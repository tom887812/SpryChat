"use client";

import {
  AssistantRuntimeProvider,
  useLocalRuntime,
} from "@assistant-ui/react";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { AssistantInner } from "./assistant-inner";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { SettingsDialog } from "@/components/settings-dialog";
import { ModelSelector } from "@/components/model-selector";
import { useSimpleConversations, ConversationsProvider } from "@/hooks/use-simple-conversations";
import { ClientOnly } from "@/components/client-only";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import type { ReactElement } from "react";
import { Settings, UpdateSettingsFunction } from "@/hooks/use-settings";

interface AssistantProps {
  settings: Settings;
  updateSettings: UpdateSettingsFunction;
}

export function Assistant({ settings, updateSettings }: AssistantProps) {
  // Top-level provider wrapper to ensure context is available before any hook usage
  return (
    <ClientOnly
      fallback={
        <div className="flex items-center justify-center h-screen">
          <div className="text-muted-foreground">加载中...</div>
        </div>
      }
    >
      <ConversationsProvider>
        <AssistantBody settings={settings} updateSettings={updateSettings} />
      </ConversationsProvider>
    </ClientOnly>
  );
}

function AssistantBody({ settings, updateSettings }: AssistantProps) {
  const {
    conversations,
    currentConversation,
    isLoaded: isConversationsLoaded,
    createNewConversation,
    updateConversationTitle,
    updateConversationModel,
  } = useSimpleConversations();
  const isLoaded = isConversationsLoaded;
  const lastSyncedFromConversation = useRef<string | null>(null); // key: `${convId}:${model}`

  // Resolve initial messages for current conversation (saved first, then cache fallback)
  const initialMessagesResolved = useMemo(() => {
    if (!currentConversation) return [] as any[];
    const saved = (currentConversation.messages || []).filter((m: any) => m.role !== 'data');
    if (saved.length > 0) return saved.filter((m: any) => m.role === 'user' || m.role === 'assistant');
    if (typeof window === 'undefined') return saved as any[];
    try {
      const cachedStr = localStorage.getItem('sprychat-thread-cache-' + currentConversation.id);
      if (cachedStr) {
        const parsed = JSON.parse(cachedStr);
        if (Array.isArray(parsed)) {
          return parsed.filter((m: any) => m.role === 'user' || m.role === 'assistant');
        }
      }
    } catch {}
    return saved as any[];
  }, [currentConversation?.id, currentConversation?.messages]);

  // 依赖 Provider 层的首帧新建逻辑；此处不再重复新建，避免竞态

  // 当切换会话时，如该会话保存了特定模型，则同步到全局设置，驱动选择器展示
  useEffect(() => {
    if (!currentConversation) return;
    const desired = currentConversation.model;
    if (desired && desired !== settings.model) {
      const key = `${currentConversation.id}:${desired}`;
      if (lastSyncedFromConversation.current === key) return; // prevent re-entrant loop
      // 同步全局模型为该会话模型
      updateSettings({ model: currentConversation.model });
      lastSyncedFromConversation.current = key;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentConversation?.id, currentConversation?.model]);

  // 如果会话没有模型（老历史），首访时初始化为当前全局模型（一次性），避免后续切换不上模型
  useEffect(() => {
    if (!currentConversation) return;
    if (!currentConversation.model && settings.model) {
      updateConversationModel(currentConversation.id, settings.model);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentConversation?.id]);

  // 不在这里把全局模型写回会话，以避免切换时的循环更新。
  // 会话模型仅在用户在 ModelSelector 中显式更改时更新。

  // 应用主题
  useEffect(() => {
    if (isLoaded) {
      document.documentElement.classList.toggle("dark", settings.theme === "dark");
    }
  }, [settings.theme, isLoaded]);

  if (!isLoaded) {
    return (
      <div className="flex h-dvh w-full items-center justify-center">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <ModelSelector settings={settings} updateSettings={updateSettings} />
          </div>
          <div className="ml-auto px-4">
            <SettingsDialog />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {isLoaded && currentConversation ? (
            <RuntimeSection
              key={currentConversation.id}
              settings={settings}
              currentConversationId={currentConversation.id}
              model={currentConversation.model || settings.model}
              initialMessages={initialMessagesResolved as any}
              render={(runtime) => (
                <AssistantRuntimeProvider runtime={runtime}>
                  <AssistantInner currentConversation={currentConversation} updateConversationTitle={updateConversationTitle} />
                </AssistantRuntimeProvider>
              )}
            />
          ) : null}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function RuntimeSection({
  settings,
  currentConversationId,
  model,
  initialMessages,
  render,
}: {
  settings: Settings;
  currentConversationId: string;
  model: string;
  initialMessages: any[];
  render: (runtime: any) => ReactElement;
}) {
  // Create a fresh runtime for each conversation via key on parent
  const runtime = useChatRuntime({
    initialMessages,
    api: "/api/chat",
    headers: {
      'X-API-Key': settings.apiKey,
      'X-Base-URL': settings.baseURL,
      'X-Model': model,
      'X-Title': 'SpryChat',
      // include conversation id to ensure isolation if needed server-side
      'X-Conversation-Id': currentConversationId,
    },
  });
  // Reset thread ONLY for brand new conversations (no messages)
  useLayoutEffect(() => {
    if (!initialMessages || initialMessages.length > 0) return;
    try {
      runtime.switchToNewThread();
      // eslint-disable-next-line no-console
      console.log('[RuntimeSection] switched to new blank thread for', currentConversationId);
    } catch (e) {
      console.warn('Failed to switch to new thread:', e);
    }
  }, [currentConversationId, initialMessages?.length]);
  return render(runtime);
}
