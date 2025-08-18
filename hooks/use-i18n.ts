"use client";

import { useCallback } from "react";
import { useSettings } from "./use-settings";

// 多语言文本定义
const translations = {
  zh: {
    // 通用
    loading: "加载中...",
    save: "保存",
    cancel: "取消",
    reset: "重置",
    settings: "设置",
    
    // 设置对话框
    settingsTitle: "设置",
    settingsDescription: "配置您的API密钥、模型和偏好设置。设置将保存在浏览器本地。",
    apiConfig: "API配置",
    appearance: "外观",
    advanced: "高级",
    
    // API配置
    apiKey: "API密钥",
    apiKeyPlaceholder: "输入您的API密钥",
    baseURL: "API基础URL",
    defaultModel: "默认模型",
    modelListNote: "稍后将支持从API自动获取可用模型列表",
    
    // 外观设置
    language: "语言",
    theme: "主题",
    lightTheme: "浅色",
    darkTheme: "深色",
    
    // 高级设置
    resetSettings: "重置设置",
    resetDescription: "将所有设置重置为默认值",
    resetAllSettings: "重置所有设置",
    
    // 模型选择器
    selectModel: "选择模型",
    freeModel: "免费",
    configureApiKey: "请先配置API密钥",
    
    // 错误信息
    fetchModelsError: "获取模型列表失败",
    
    // 历史对话
    newThread: "新对话",
    history: "历史记录",
    conversationHistory: "对话历史",
    clearHistory: "清除历史",
    clearHistoryConfirm: "确定要清除所有对话历史吗？此操作不可撤销。",
    editTitle: "编辑标题",
    delete: "删除",
    version: "版本",
    about: "关于",
    noConversations: "暂无对话历史",
  },
  en: {
    // Common
    loading: "Loading...",
    save: "Save",
    cancel: "Cancel",
    reset: "Reset",
    settings: "Settings",
    
    // Settings dialog
    settingsTitle: "Settings",
    settingsDescription: "Configure your API key, model, and preferences. Settings are saved locally in your browser.",
    apiConfig: "API Configuration",
    appearance: "Appearance",
    advanced: "Advanced",
    
    // API configuration
    apiKey: "API Key",
    apiKeyPlaceholder: "Enter your API key",
    baseURL: "API Base URL",
    defaultModel: "Default Model",
    modelListNote: "Automatic model list fetching from API will be supported later",
    
    // Appearance settings
    language: "Language",
    theme: "Theme",
    lightTheme: "Light",
    darkTheme: "Dark",
    
    // Advanced settings
    resetSettings: "Reset Settings",
    resetDescription: "Reset all settings to default values",
    resetAllSettings: "Reset All Settings",
    
    // Model selector
    selectModel: "Select Model",
    freeModel: "Free",
    configureApiKey: "Please configure API key first",
    
    // Error messages
    fetchModelsError: "Failed to fetch model list",
    
    // Conversation history
    newThread: "New Thread",
    history: "History",
    conversationHistory: "Conversation History",
    clearHistory: "Clear History",
    clearHistoryConfirm: "Are you sure you want to clear all conversation history? This action cannot be undone.",
    editTitle: "Edit Title",
    delete: "Delete",
    version: "Version",
    about: "About",
    noConversations: "No conversations yet",
  },
};

export type TranslationKey = keyof typeof translations.zh;

export function useI18n() {
  const { settings } = useSettings();
  
  const t = useCallback((key: TranslationKey): string => {
    return translations[settings.language]?.[key] || translations.zh[key] || key;
  }, [settings.language]);
  
  return { t, language: settings.language };
}
