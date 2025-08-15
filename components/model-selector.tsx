"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useI18n } from "@/hooks/use-i18n";
import { Badge } from "@/components/ui/badge";

interface Model {
  id: string;
  name: string;
  description?: string;
  pricing?: {
    prompt: string;
    completion: string;
  };
  context_length?: number;
  architecture?: {
    modality: string;
    tokenizer: string;
    instruct_type?: string;
  };
  top_provider?: {
    max_completion_tokens?: number;
    is_moderated: boolean;
  };
  per_request_limits?: {
    prompt_tokens: string;
    completion_tokens: string;
  };
}

interface ModelsResponse {
  data: Model[];
}

// 安全转换函数
const parseSafe = (str: string | undefined): number => {
  if (!str) return 1;
  const num = parseFloat(str.replace(/[^\d.]/g, ''));
  return isNaN(num) ? 1 : num;
};

import { Settings, UpdateSettingsFunction } from "@/hooks/use-settings";
import { useSimpleConversations } from "@/hooks/use-simple-conversations";

interface ModelSelectorProps {
  settings: Settings;
  updateSettings: UpdateSettingsFunction;
}

export function ModelSelector({ settings, updateSettings }: ModelSelectorProps) {
  
  const { t } = useI18n();
  const { currentConversation, updateConversationModel } = useSimpleConversations();
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  
  // 调试：监控设置变化
  useEffect(() => {
    console.log('🔍 ModelSelector settings changed:', {
      model: settings.model,
      apiKey: settings.apiKey ? '***configured***' : 'missing',
      baseURL: settings.baseURL,
      language: settings.language,
      theme: settings.theme,
      timestamp: new Date().toISOString()
    });
  }, [settings]);

  // 获取模型列表
  const fetchModels = async () => {
    if (!settings.apiKey || !settings.baseURL) {
      console.log('🚫 Model fetch skipped: missing API key or baseURL');
      return;
    }

    console.log('🔄 Fetching models via proxy:', '/api/models');
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/models`, {
        method: 'GET',
        headers: {
          'X-API-Key': settings.apiKey,
          'X-Base-URL': settings.baseURL,
          'X-Title': 'SpryChat',
        },
      });

      console.log('📡 Models API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Models API error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: ModelsResponse = await response.json();
      console.log('✅ Models fetched successfully:', data.data.length, 'models');
      
      // 过滤出免费模型（价格为0的模型）
      const freeModels = data.data.filter(model => {
        const prompt = parseSafe(model.pricing?.prompt);
        const completion = parseSafe(model.pricing?.completion);
        return prompt === 0 && completion === 0;
      });

      console.log('🆓 Free models found:', freeModels.length);
      
      // 如果没有免费模型，显示所有模型
      const finalModels = freeModels.length > 0 ? freeModels : data.data;
      
      // 确保当前选择的模型在列表中
      if (settings.model && !finalModels.some((m: any) => m.id === settings.model)) {
        console.log('⚠️ Current model not in API list, adding:', settings.model);
        finalModels.unshift({
          id: settings.model,
          name: settings.model.split('/').pop()?.replace(/:free$/, '') || settings.model,
        });
      }
      
      setModels(finalModels);
      console.log('📋 Final models set:', {
        count: finalModels.length,
        currentModel: settings.model
      });
    } catch (err) {
      console.error('❌ Failed to fetch models:', err);
      setError(err instanceof Error ? err.message : t('fetchModelsError'));
      
      // 保留现有模型列表，避免清空
      setModels(prev => {
        const keepExisting = [...prev];
        
        // 确保当前模型存在
        if (settings.model && !keepExisting.some(m => m.id === settings.model)) {
          keepExisting.unshift({
            id: settings.model,
            name: settings.model.split('/').pop()?.replace(/:free$/, '') || settings.model,
            pricing: { prompt: '0', completion: '0' }
          });
        }
        
        // 如果没有任何模型，使用默认模型
        if (keepExisting.length === 0) {
          const defaultFreeModels = [
            { id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo', pricing: { prompt: '0', completion: '0' } },
            { id: 'google/gemma-2-9b-it:free', name: 'Gemma 2 9B', pricing: { prompt: '0', completion: '0' } },
            { id: 'meta-llama/llama-3.1-8b-instruct:free', name: 'Llama 3.1 8B', pricing: { prompt: '0', completion: '0' } },
            { id: 'microsoft/wizardlm-2-8x22b:free', name: 'WizardLM 2 8x22B', pricing: { prompt: '0', completion: '0' } },
            { id: 'moonshotai/kimi-k2:free', name: 'Kimi K2', pricing: { prompt: '0', completion: '0' } },
            { id: 'mistralai/mistral-7b-instruct:free', name: 'Mistral 7B', pricing: { prompt: '0', completion: '0' } },
          ];
          
          console.log('🔄 Using default free models as fallback');
          return defaultFreeModels;
        }
        
        console.log('🔄 Keeping existing models after error, count:', keepExisting.length);
        return keepExisting;
      });
    } finally {
      setLoading(false);
    }
  };

  // 当API配置改变时重新获取模型
  useEffect(() => {
    let active = true;
    (async () => {
      await fetchModels();
      if (!active) return;
    })();
    return () => {
      active = false;
    };
  }, [settings.apiKey, settings.baseURL]);

  const handleModelChange = (modelId: string) => {
    if (modelId === settings.model) return;
    if (currentConversation && currentConversation.model === modelId) return;
    try {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('sprychat:persist-active-conversation'));
        console.log('🛰️ Dispatched persist-active-conversation before model change');
      }
    } catch {}
    updateSettings({ model: modelId });
    // 写入当前会话的模型，确保该会话记住此模型
    if (currentConversation) {
      try {
        updateConversationModel(currentConversation.id, modelId);
      } catch {}
    }
    
    // 延迟检查设置是否真的更新了
    setTimeout(() => {
      const verificationMsg = `🔍 Verification (100ms later): Current=${settings.model}, Expected=${modelId}, Match=${settings.model === modelId}`;
      setDebugInfo(prev => prev + '\n' + verificationMsg);
      console.log(verificationMsg);
    }, 100);
    
    // 更长时间的验证
    setTimeout(() => {
      const finalMsg = `🎯 Final check (500ms later): Current=${settings.model}, Expected=${modelId}, Match=${settings.model === modelId}`;
      setDebugInfo(prev => prev + '\n' + finalMsg);
      console.log(finalMsg);
    }, 500);
  };

  const isFreeModel = (model: Model) => {
    const prompt = parseFloat(model.pricing?.prompt || "1");
    const completion = parseFloat(model.pricing?.completion || "1");
    return prompt === 0 && completion === 0;
  };

  // 调试：监控渲染时的状态
  console.log('🎨 ModelSelector render:', {
    selectedModel: settings.model,
    modelsCount: models.length,
    modelsList: models.map(m => ({ id: m.id, name: m.name })),
    loading,
    error,
    isSelectedModelInList: models.some(m => m.id === settings.model),
    timestamp: new Date().toISOString()
  });

  // 调试函数：手动测试模型选择
  const debugModelSelection = () => {
    const timestamp = new Date().toLocaleTimeString();
    const debugMsg = `🧪 Debug clicked at ${timestamp}`;
    
    // 更新可视化调试信息
    setDebugInfo(prev => prev + '\n' + debugMsg);
    
    // 输出调试信息
    console.log('🧪 Debug: Manual model selection test');
    
    const debugInfo = {
      currentModel: settings.model,
      availableModels: models.length,
      loading: loading,
      error: error,
      timestamp: timestamp
    };
    
    setDebugInfo(prev => prev + '\n' + `Current state: ${JSON.stringify(debugInfo, null, 2)}`);
    
    console.log('Current state:', debugInfo);
    console.table(models); // 表格形式显示模型
    
    if (models.length > 0) {
      console.log('📋 Models available for selection:', models);
    } else {
      const noModelsMsg = 'No models available for testing!';
      setDebugInfo(prev => prev + '\n' + noModelsMsg);
      console.warn(noModelsMsg);
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center space-x-2">

        
        <Select
          value={settings.model}
          onValueChange={handleModelChange}
          disabled={loading}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={loading ? t('loading') : t('selectModel')} />
          </SelectTrigger>
          <SelectContent>
            {error ? (
              <div className="p-2 text-sm text-red-500">
                {error}
              </div>
            ) : models.length === 0 && !loading ? (
              <div className="p-2 text-sm text-muted-foreground">
                {t('configureApiKey')}
              </div>
            ) : (
              models.map((model) => {

                return (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex items-center justify-between w-full">
                      <span className="truncate">{model.name || model.id}</span>
                      {isFreeModel(model) && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {t('freeModel')}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                );
              })
            )}
          </SelectContent>
        </Select>
      </div>
      

    </div>
  );
}
