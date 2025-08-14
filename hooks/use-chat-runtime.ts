"use client";

import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { useSettings } from "./use-settings";
import { useSimpleConversations } from "./use-simple-conversations";
import { useEffect } from "react";
import { Settings } from "./use-settings";

export function useSpryChat({ settings }: { settings: Settings }) {
  const { currentConversation, isLoaded: conversationsLoaded } = useSimpleConversations();

  const runtime = useChatRuntime({
    api: "/api/chat",
    headers: {
      'X-API-Key': settings.apiKey,
      'X-Base-URL': settings.baseURL,
      'X-Model': settings.model,
    },
  });

  useEffect(() => {
    if (currentConversation && runtime) {
      runtime.switchToNewThread(currentConversation.id);
    }
  }, [currentConversation?.id, runtime]);

  return {
    runtime,
    isLoaded: conversationsLoaded,
  };
}
