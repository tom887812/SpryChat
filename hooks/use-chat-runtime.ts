"use client";

import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { useSettings } from "./use-settings";
import { useSimpleConversations } from "./use-simple-conversations";
import { useMemo, useEffect, useState, useRef } from "react";

export function useSpryChat() {
  const { settings, isLoaded } = useSettings();
  const { currentConversation, isLoaded: conversationsLoaded } = useSimpleConversations();
  const [forceUpdate, setForceUpdate] = useState(0);
  const prevModelRef = useRef<string>('');
  
  // 当模型改变时强制重新创建运行时
  useEffect(() => {
    console.log('🔍 Model change check:', {
      isLoaded,
      currentModel: settings.model,
      prevModel: prevModelRef.current,
      needsUpdate: isLoaded && settings.model !== prevModelRef.current
    });
    
    if (isLoaded && settings.model && settings.model !== prevModelRef.current) {
      console.log('🔄 Model changed from', prevModelRef.current, 'to', settings.model);
      prevModelRef.current = settings.model;
      setForceUpdate(prev => {
        const newForceUpdate = prev + 1;
        console.log('⚡ Force update triggered:', newForceUpdate);
        return newForceUpdate;
      });
    }
  }, [settings.model, isLoaded]);
  
  // 额外的 useEffect 来强制监听设置变化
  useEffect(() => {
    console.log('📊 Settings changed:', settings);
    console.log('📊 Current model in settings:', settings.model);
  }, [settings]);
  
  // 创建运行时配置 - 包含forceUpdate以强制重新创建
  const runtimeConfig = useMemo(() => {
    console.log('Creating runtime config with model:', settings.model, 'forceUpdate:', forceUpdate);
    return {
      api: "/api/chat",
      headers: {
        'X-API-Key': settings.apiKey || '',
        'X-Base-URL': settings.baseURL || '',
        'X-Model': settings.model || '',
      },
    };
  }, [settings.apiKey, settings.baseURL, settings.model, forceUpdate]);

  const runtime = useChatRuntime(runtimeConfig);

  // 当对话切换时，切换到新线程
  useEffect(() => {
    if (currentConversation && runtime && isLoaded && conversationsLoaded) {
      console.log('Switching to conversation:', currentConversation.id);
      runtime.switchToNewThread();
    }
  }, [currentConversation?.id, runtime, isLoaded, conversationsLoaded]);

  return {
    runtime,
    isLoaded: isLoaded && conversationsLoaded,
    settings,
  };
}
