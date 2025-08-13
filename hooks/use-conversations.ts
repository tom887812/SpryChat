"use client";

import { useState, useEffect } from "react";

export interface Conversation {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages: any[]; // 存储完整的消息历史
}

const STORAGE_KEY = "openchat-conversations";
const CURRENT_CONVERSATION_KEY = "openchat-current-conversation";

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // 从localStorage加载对话历史
  useEffect(() => {
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

  // 保存对话到localStorage
  const saveConversations = (convs: Conversation[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(convs));
    } catch (error) {
      console.error("Failed to save conversations:", error);
    }
  };

  // 创建新对话
  const createNewConversation = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: "新对话",
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [],
    };

    const updatedConversations = [newConversation, ...conversations];
    setConversations(updatedConversations);
    setCurrentConversationId(newConversation.id);
    saveConversations(updatedConversations);
    
    try {
      localStorage.setItem(CURRENT_CONVERSATION_KEY, newConversation.id);
    } catch (error) {
      console.error("Failed to save current conversation ID:", error);
    }

    return newConversation.id;
  };

  // 切换到指定对话
  const switchToConversation = (conversationId: string) => {
    setCurrentConversationId(conversationId);
    try {
      localStorage.setItem(CURRENT_CONVERSATION_KEY, conversationId);
    } catch (error) {
      console.error("Failed to save current conversation ID:", error);
    }
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
        try {
          localStorage.removeItem(CURRENT_CONVERSATION_KEY);
        } catch (error) {
          console.error("Failed to remove current conversation ID:", error);
        }
      }
    }
  };

  // 清除所有对话历史
  const clearAllConversations = () => {
    setConversations([]);
    setCurrentConversationId(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(CURRENT_CONVERSATION_KEY);
    } catch (error) {
      console.error("Failed to clear conversations:", error);
    }
  };

  // 更新对话消息
  const updateConversationMessages = (conversationId: string, messages: any[]) => {
    const updatedConversations = conversations.map(conv =>
      conv.id === conversationId
        ? { ...conv, messages, updatedAt: new Date() }
        : conv
    );
    setConversations(updatedConversations);
    saveConversations(updatedConversations);
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
    updateConversationMessages,
  };
}
