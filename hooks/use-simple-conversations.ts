"use client";

import { useState, useEffect } from "react";

export interface SimpleConversation {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

const STORAGE_KEY = "sprychat-conversations";
const CURRENT_CONVERSATION_KEY = "sprychat-current-conversation";

export function useSimpleConversations() {
  const [conversations, setConversations] = useState<SimpleConversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

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

  // 创建新对话
  const createNewConversation = () => {
    // 确保在客户端执行
    if (typeof window === 'undefined') return '';
    
    // 使用时间戳和随机数生成唯一ID
    const id = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const now = new Date();
    const newConversation: SimpleConversation = {
      id,
      title: "新对话",
      createdAt: now,
      updatedAt: now,
    };

    const updatedConversations = [newConversation, ...conversations];
    
    // 立即更新状态
    setConversations(updatedConversations);
    setCurrentConversationId(newConversation.id);
    
    // 保存到localStorage
    saveConversations(updatedConversations);
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
    const updatedConversations = conversations.map(conv =>
      conv.id === conversationId
        ? { ...conv, title, updatedAt: new Date() }
        : conv
    );
    setConversations(updatedConversations);
    saveConversations(updatedConversations);
  };

  // 删除对话
  const deleteConversation = (conversationId: string) => {
    const updatedConversations = conversations.filter(conv => conv.id !== conversationId);
    setConversations(updatedConversations);
    saveConversations(updatedConversations);

    // 如果删除的是当前对话，切换到最新的对话或创建新对话
    if (currentConversationId === conversationId) {
      if (updatedConversations.length > 0) {
        switchToConversation(updatedConversations[0].id);
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
  const currentConversation = currentConversationId
    ? conversations.find(conv => conv.id === currentConversationId)
    : null;

  return {
    conversations,
    currentConversation,
    currentConversationId,
    isLoaded,
    createNewConversation,
    switchToConversation,
    updateConversationTitle,
    deleteConversation,
    clearAllConversations,
  };
}
