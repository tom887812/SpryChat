"use client";

import {
  AssistantRuntimeProvider,
  useLocalRuntime,
} from "@assistant-ui/react";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { Thread } from "@/components/assistant-ui/thread";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { SettingsDialog } from "@/components/settings-dialog";
import { ModelSelector } from "@/components/model-selector";
import { useSpryChat } from "@/hooks/use-chat-runtime";
import { useSimpleConversations } from "@/hooks/use-simple-conversations";
import { ClientOnly } from "@/components/client-only";
import { useEffect } from "react";
import { Settings, UpdateSettingsFunction } from "@/hooks/use-settings";

interface AssistantProps {
  settings: Settings;
  updateSettings: UpdateSettingsFunction;
}

export function Assistant({ settings, updateSettings }: AssistantProps) {
  const { runtime, isLoaded } = useSpryChat({ settings });
  const { 
    currentConversation, 
    createNewConversation, 
    updateConversationTitle,
    isLoaded: conversationsLoaded 
  } = useSimpleConversations();

  // 当没有当前对话时，创建一个新对话
  useEffect(() => {
    if (conversationsLoaded && !currentConversation) {
      createNewConversation();
    }
  }, [conversationsLoaded, currentConversation, createNewConversation]);

  // 当对话切换时，重新创建runtime以加载新对话的消息
  useEffect(() => {
    if (currentConversation && runtime) {
      console.log('Loading conversation:', currentConversation.id);
      // 切换到新线程以加载新对话的消息
      runtime.switchToNewThread();
    }
  }, [currentConversation?.id]);

  // 当对话改变时，强制切换到新线程
  useEffect(() => {
    if (runtime && currentConversation) {
      console.log('Conversation changed, switching to new thread:', currentConversation.id);
      runtime.switchToNewThread();
    }
  }, [currentConversation?.id, runtime]);

  // 实现简单的消息保存机制
  useEffect(() => {
    if (!runtime || !currentConversation) return;

    // 每5秒检查一次消息变化并保存
    const saveInterval = setInterval(() => {
      try {
        // 这里需要使用正确的方式获取消息
        // 暂时使用一个简单的方法来模拟消息保存
        console.log('Checking for message updates...');
      } catch (error) {
        console.error('Error saving conversation:', error);
      }
    }, 5000);

    return () => clearInterval(saveInterval);
  }, [runtime, currentConversation, updateConversationTitle]);

  // 应用主题
  useEffect(() => {
    if (isLoaded) {
      document.documentElement.classList.toggle('dark', settings.theme === 'dark');
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
    <ClientOnly fallback={
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    }>
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
            {runtime && isLoaded && conversationsLoaded ? (
              <AssistantRuntimeProvider runtime={runtime}>
                <Thread />
              </AssistantRuntimeProvider>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-muted-foreground">加载中...</div>
              </div>
            )}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ClientOnly>
  );
};
