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
import { useEffect, useLayoutEffect } from "react";
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
    currentConversation,
    isLoaded: isConversationsLoaded,
    createNewConversation,
    updateConversationTitle,
  } = useSimpleConversations();
  const isLoaded = isConversationsLoaded;

  // 当没有当前对话时，创建一个新对话
  useEffect(() => {
    if (isLoaded && isConversationsLoaded && !currentConversation) {
      createNewConversation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isConversationsLoaded, currentConversation]);

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
              initialMessages={(currentConversation.messages || []).filter((m) => m.role !== "data") as any}
              render={(runtime) => (
                <AssistantRuntimeProvider runtime={runtime}>
                  <AssistantInner currentConversation={currentConversation} updateConversationTitle={updateConversationTitle} />
                </AssistantRuntimeProvider>
              )}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-muted-foreground">加载中...</div>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function RuntimeSection({
  settings,
  currentConversationId,
  initialMessages,
  render,
}: {
  settings: Settings;
  currentConversationId: string;
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
      'X-Model': settings.model,
      // include conversation id to ensure isolation if needed server-side
      'X-Conversation-Id': currentConversationId,
    },
  });
  // Hard reset thread synchronously to guarantee blank view for new conversations
  useLayoutEffect(() => {
    try {
      runtime.switchToNewThread();
      // eslint-disable-next-line no-console
      console.log('[RuntimeSection] switched to new thread for', currentConversationId);
    } catch (e) {
      console.warn('Failed to switch to new thread:', e);
    }
  }, [currentConversationId]);
  return render(runtime);
}
