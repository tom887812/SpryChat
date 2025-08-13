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

  // 获取模型列表
  const fetchModels = async () => {
    if (!settings.apiKey || !settings.baseURL) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${settings.baseURL}/models`, {
        headers: {
          'Authorization': `Bearer ${settings.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: ModelsResponse = await response.json();
      
      // 过滤出免费模型（价格为0的模型）
      const freeModels = data.data.filter(model => {
        const prompt = parseFloat(model.pricing?.prompt || "1");
        const completion = parseFloat(model.pricing?.completion || "1");
        return prompt === 0 && completion === 0;
      });

      // 如果没有免费模型，显示所有模型
      setModels(freeModels.length > 0 ? freeModels : data.data);
    } catch (err) {
      console.error('Failed to fetch models:', err);
      setError(err instanceof Error ? err.message : t('fetchModelsError'));
    } finally {
      setLoading(false);
    }
  };

  // 当API配置改变时重新获取模型
  useEffect(() => {
    fetchModels();
  }, [settings.apiKey, settings.baseURL]);

  const handleModelChange = (modelId: string) => {
    updateSettings({ model: modelId });
  };

  const isFreeModel = (model: Model) => {
    const prompt = parseFloat(model.pricing?.prompt || "1");
    const completion = parseFloat(model.pricing?.completion || "1");
    return prompt === 0 && completion === 0;
  };

  return (
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
            models.map((model) => (
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
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
