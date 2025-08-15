"use client";

import { useState, useEffect, createContext, useContext, ReactNode, createElement } from "react";

export interface SimpleConversation {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages?: any[];
  model?: string;
}

const STORAGE_KEY = "sprychat-conversations";
const CURRENT_CONVERSATION_KEY = "sprychat-current-conversation";

type ConversationsValue = {
  conversations: SimpleConversation[];
  currentConversation: SimpleConversation | null;
  currentConversationId: string | null;
  isLoaded: boolean;
  createNewConversation: (model?: string) => string;
  switchToConversation: (conversationId: string) => void;
  updateConversationTitle: (conversationId: string, title: string) => void;
  updateConversationMessages: (conversationId: string, messages: any[]) => void;
  updateConversationModel: (conversationId: string, model: string) => void;
  deleteConversation: (conversationId: string) => void;
  clearAllConversations: () => void;
};

const ConversationsContext = createContext<ConversationsValue | null>(null);

function useSimpleConversationsImpl(): ConversationsValue {
  const [conversations, setConversations] = useState<SimpleConversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [didInitialSelect, setDidInitialSelect] = useState(false);

  // 从localStorage加载对话列表 - 防止水合错误
  useEffect(() => {
    // 确保在客户端执行
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const currentId = localStorage.getItem(CURRENT_CONVERSATION_KEY);
      
      if (stored) {
        const parsedConversations = JSON.parse(stored).map((conv: any) => ({
          ...conv,
          createdAt: new Date(conv.createdAt),
          updatedAt: new Date(conv.updatedAt),
        }));
        setConversations(parsedConversations);
      }
      
      if (currentId) {
        setCurrentConversationId(currentId);
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // 当已加载后仅在第一次初始化且没有当前会话但存在历史时，默认选中最新的一条
  useEffect(() => {
    if (!isLoaded) return;
    if (didInitialSelect) return;
    if (!currentConversationId && conversations.length > 0) {
      const nextId = conversations[0].id;
      setCurrentConversationId(nextId);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(CURRENT_CONVERSATION_KEY, nextId);
        } catch {}
      }
    }
    // 标记只执行一次，避免与新建/切换时产生竞态
    setDidInitialSelect(true);
  }, [isLoaded, didInitialSelect, currentConversationId, conversations]);

  // 保存对话到localStorage - 防止水合错误
  const saveConversations = (convs: SimpleConversation[]) => {
    // 确保在客户端执行
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(convs));
    } catch (error) {
      console.error("Failed to save conversations:", error);
    }
  };

  // 更新对话使用的模型
  const updateConversationModel = (conversationId: string, model: string) => {
    setConversations(prev => {
      let changed = false;
      const updated = prev.map(conv => {
        if (conv.id !== conversationId) return conv;
        if (conv.model === model) return conv; // no change
        changed = true;
        return { ...conv, model, updatedAt: new Date() };
      });
      if (changed) {
        saveConversations(updated);
        return updated;
      }
      return prev;
    });
  };

  const THREAD_CACHE_PREFIX = 'sprychat-thread-cache-';
  const persistFromCache = (conversationId?: string | null) => {
    if (!conversationId) return;
    if (typeof window === 'undefined') return;
    try {
      const cached = localStorage.getItem(THREAD_CACHE_PREFIX + conversationId);
      if (!cached) {
        // eslint-disable-next-line no-console
        console.log('[Conversations] No cache for', conversationId);
        return;
      }
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // eslint-disable-next-line no-console
        console.log('[Conversations] Persisting from cache', conversationId, 'messages:', parsed.length);
        // 写入对应会话消息
        const messages = parsed as any;
        setConversations(prev => {
          const updated = prev.map(conv =>
            conv.id === conversationId
              ? { ...conv, messages, updatedAt: new Date() }
              : conv
          );
          saveConversations(updated);
          return updated;
        });
      } else {
        // eslint-disable-next-line no-console
        console.log('[Conversations] Cache empty for', conversationId);
      }
    } catch (e) {
      console.warn('Failed to persist cache in hook', e);
    }
  };

    // 创建新对话
  const createNewConversation = (model?: string) => {
    if (typeof window === 'undefined') return '';
    // 先持久化当前会话的缓存
    persistFromCache(currentConversationId);
    // eslint-disable-next-line no-console
    console.log('[Conversations] Creating new conversation, previous:', currentConversationId);
    const id = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    const newConversation: SimpleConversation = {
      id,
      title: "新对话",
      createdAt: now,
      updatedAt: now,
      messages: [],
      model,
    };

    setConversations(prev => {
      const updated = [newConversation, ...prev];
      // eslint-disable-next-line no-console
      console.log('[Conversations] New conversation list size:', updated.length);
      saveConversations(updated);
      return updated;
    });

    setCurrentConversationId(newConversation.id);
    setDidInitialSelect(true);
    try {
      localStorage.setItem(CURRENT_CONVERSATION_KEY, newConversation.id);
    } catch (error) {
      console.error("Failed to save current conversation ID:", error);
    }
    console.log('Created new conversation:', newConversation.id);
    return newConversation.id;
  };

  // 切换到指定对话
  const switchToConversation = (conversationId: string) => {
    // 若与当前一致或该会话不存在，则不处理，避免抖动
    if (conversationId === currentConversationId) return;
    if (!conversations.find(c => c.id === conversationId)) return;
    // 切换前持久化当前会话缓存
    persistFromCache(currentConversationId);
    // eslint-disable-next-line no-console
    console.log('[Conversations] Switching from', currentConversationId, 'to', conversationId);
    setCurrentConversationId(conversationId);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(CURRENT_CONVERSATION_KEY, conversationId);
      } catch (error) {
        console.error("Failed to save current conversation ID:", error);
      }
    }
    console.log('Switched to conversation:', conversationId);
  };

  // 更新对话标题
  const updateConversationTitle = (conversationId: string, title: string) => {
    setConversations(prev => {
      const updated = prev.map(conv =>
        conv.id === conversationId
          ? { ...conv, title, updatedAt: new Date() }
          : conv
      );
      saveConversations(updated);
      return updated;
    });
  };

  // 更新对话消息
  const updateConversationMessages = (conversationId: string, messages: any[]) => {
    setConversations(prev => {
      const updated = prev.map(conv =>
        conv.id === conversationId
          ? { ...conv, messages, updatedAt: new Date() }
          : conv
      );
      saveConversations(updated);
      return updated;
    });
  };

  // 删除对话
  const deleteConversation = (conversationId: string) => {
    setConversations(prev => {
      const updated = prev.filter(conv => conv.id !== conversationId);
      saveConversations(updated);
      // 如果删除的是当前对话，切换到最新的对话或清空
      if (currentConversationId === conversationId) {
        if (updated.length > 0) {
          switchToConversation(updated[0].id);
        } else {
          setCurrentConversationId(null);
          if (typeof window !== 'undefined') {
            try {
              localStorage.removeItem(CURRENT_CONVERSATION_KEY);
            } catch (error) {
              console.error("Failed to remove current conversation ID:", error);
            }
          }
        }
      }
      return updated;
    });
  };

  // 清除所有对话历史
  const clearAllConversations = () => {
    setConversations([]);
    setCurrentConversationId(null);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(CURRENT_CONVERSATION_KEY);
      } catch (error) {
        console.error("Failed to clear conversations:", error);
      }
    }
  };

  // 获取当前对话
  const currentConversation: SimpleConversation | null = currentConversationId
    ? (conversations.find(conv => conv.id === currentConversationId) ?? null)
    : null;

  return {
    conversations,
    currentConversation,
    currentConversationId,
    isLoaded,
    createNewConversation,
    switchToConversation,
    updateConversationTitle,
    updateConversationMessages,
    updateConversationModel,
    deleteConversation,
    clearAllConversations,
  };
}

export function ConversationsProvider({ children }: { children: ReactNode }) {
  const value = useSimpleConversationsImpl();
  return (
    // Use createElement to avoid JSX in .ts files
    // eslint-disable-next-line react/no-children-prop
    (createElement as any)(ConversationsContext.Provider, { value }, children)
  );
}

export function useSimpleConversations(): ConversationsValue {
  const ctx = useContext(ConversationsContext);
  if (!ctx) {
    throw new Error(
      "useSimpleConversations must be used within a ConversationsProvider."
    );
  }
  return ctx;
}
