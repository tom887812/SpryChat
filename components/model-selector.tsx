"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSettings } from "@/hooks/use-settings";
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

export function ModelSelector() {
  const { settings, updateSettings } = useSettings();
  const { t } = useI18n();
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 调试：监控设置变化
  useEffect(() => {
    console.log('🔍 ModelSelector: Current settings:', settings);
    console.log('🔍 ModelSelector: Selected model:', settings.model);
  }, [settings]);

  // 获取模型列表
  const fetchModels = async () => {
    if (!settings.apiKey || !settings.baseURL) {
      console.log('🚫 Model fetch skipped: missing API key or baseURL');
      return;
    }

    console.log('🔄 Fetching models from:', settings.baseURL + '/models');
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${settings.baseURL}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${settings.apiKey}`,
          'Content-Type': 'application/json',
        },
        mode: 'cors', // 明确指定CORS模式
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
        const prompt = parseFloat(model.pricing?.prompt || "1");
        const completion = parseFloat(model.pricing?.completion || "1");
        return prompt === 0 && completion === 0;
      });

      console.log('🆓 Free models found:', freeModels.length);
      
      // 如果没有免费模型，显示所有模型
      const finalModels = freeModels.length > 0 ? freeModels : data.data;
      
      // 确保当前选择的模型在列表中
      if (settings.model && !finalModels.find((m: any) => m.id === settings.model)) {
        console.log('⚠️ Current model not in API list, adding:', settings.model);
        finalModels.unshift({
          id: settings.model,
          name: settings.model.split('/').pop()?.replace(/:free$/, '') || settings.model,
          pricing: { prompt: '0', completion: '0' }
        });
      }
      
      setModels(finalModels);
      console.log('📋 Final models set:', {
        count: finalModels.length,
        currentModel: settings.model,
        currentModelInList: finalModels.find((m: any) => m.id === settings.model) ? 'YES' : 'NO'
      });
    } catch (err) {
      console.error('❌ Failed to fetch models:', err);
      setError(err instanceof Error ? err.message : t('fetchModelsError'));
      
      // 如果获取失败，设置一些默认的免费模型，包括当前选择的模型
      const defaultFreeModels = [
        { id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo', pricing: { prompt: '0', completion: '0' } },
        { id: 'google/gemma-2-9b-it:free', name: 'Gemma 2 9B', pricing: { prompt: '0', completion: '0' } },
        { id: 'meta-llama/llama-3.1-8b-instruct:free', name: 'Llama 3.1 8B', pricing: { prompt: '0', completion: '0' } },
        { id: 'microsoft/wizardlm-2-8x22b:free', name: 'WizardLM 2 8x22B', pricing: { prompt: '0', completion: '0' } },
        { id: 'moonshotai/kimi-k2:free', name: 'Kimi K2', pricing: { prompt: '0', completion: '0' } },
        { id: 'mistralai/mistral-7b-instruct:free', name: 'Mistral 7B', pricing: { prompt: '0', completion: '0' } },
      ];
      
      // 确保当前选择的模型在列表中
      if (settings.model && !defaultFreeModels.find(m => m.id === settings.model)) {
        defaultFreeModels.push({
          id: settings.model,
          name: settings.model.split('/').pop() || settings.model,
          pricing: { prompt: '0', completion: '0' }
        });
      }
      
      console.log('🔄 Using default free models as fallback, including current model:', settings.model);
      setModels(defaultFreeModels);
    } finally {
      setLoading(false);
    }
  };

  // 当API配置改变时重新获取模型
  useEffect(() => {
    fetchModels();
  }, [settings.apiKey, settings.baseURL]);

  const handleModelChange = (modelId: string) => {
    console.log('🔄 Model selector: Changing model from', settings.model, 'to', modelId);
    updateSettings({ model: modelId });
    console.log('✅ Model selector: updateSettings called with model:', modelId);
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
    loading,
    error
  });

  return (
    <div className="flex items-center space-x-2">
      <Select
        value={settings.model}
        onValueChange={handleModelChange}
        disabled={loading}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue 
            placeholder={loading ? t('loading') : t('selectModel')}
          >
            {settings.model && models.length > 0 ? (
              models.find(m => m.id === settings.model)?.name || 
              settings.model.split('/').pop()?.replace(/:free$/, '') || 
              settings.model
            ) : loading ? t('loading') : t('selectModel')}
          </SelectValue>
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
              console.log('🎯 Rendering model option:', {
                id: model.id,
                name: model.name,
                isSelected: model.id === settings.model
              });
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
  );
}
