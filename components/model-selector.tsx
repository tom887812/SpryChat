"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useSettings } from "@/hooks/use-settings";
import { useI18n } from "@/hooks/use-i18n";
import { useSimpleConversations } from "@/hooks/use-simple-conversations";

// Model interfaces and types
interface Model {
  id: string;
  name: string;
  description?: string;
  pricing?: { prompt: string; completion: string };
  context_length?: number;
  architecture?: { modality: string; tokenizer: string; instruct_type?: string };
  top_provider?: { max_completion_tokens?: number; is_moderated: boolean };
  per_request_limits?: { prompt_tokens: string; completion_tokens: string };
  permission?: string[];
}

type ModelCategory = 'chat' | 'images' | 'audio' | 'videos';
type ImageSubcategory = 'generations' | 'edits';

interface CategorizedModel extends Model {
  category: ModelCategory;
  subcategory?: ImageSubcategory;
  endpoint?: string;
}

interface ModelGroup {
  category: ModelCategory;
  displayName: string;
  models: CategorizedModel[];
  subcategories?: { [key in ImageSubcategory]?: CategorizedModel[] };
}

// Helper functions for model processing
const parseSafe = (str: string | undefined): number => {
  if (!str) return 1;
  const num = parseFloat(str.replace(/[^\d.]/g, ''));
  return isNaN(num) ? 1 : num;
};

const isFreeModel = (model: Model) => {
  if (model.permission?.includes('free')) return true;
  const prompt = parseSafe(model.pricing?.prompt);
  const completion = parseSafe(model.pricing?.completion);
  return prompt === 0 && completion === 0;
};

const categorizeModel = (model: Model): CategorizedModel => {
  const id = model.id.toLowerCase();
  const modality = model.architecture?.modality?.toLowerCase() || '';

  if (modality === 'image' || ['dall-e', 'midjourney', 'stable-diffusion', 'flux', 'imagen', 'firefly', 'playground'].some(v => id.includes(v))) {
    const subcategory: ImageSubcategory = id.includes('edit') || id.includes('inpaint') || id.includes('outpaint') ? 'edits' : 'generations';
    const endpoint = subcategory === 'edits' ? '/images/edits' : '/images/generations';
    return { ...model, category: 'images', subcategory, endpoint };
  }

  if (modality === 'audio' || ['whisper', 'tts', 'speech', 'audio', 'voice'].some(v => id.includes(v))) {
    const endpoint = id.includes('tts') || id.includes('speech') ? '/audio/speech' : '/audio/transcriptions';
    return { ...model, category: 'audio', endpoint };
  }

  if (modality === 'video' || ['sora', 'runway', 'pika', 'video', 'gen-2', 'gen-3'].some(v => id.includes(v))) {
    return { ...model, category: 'videos', endpoint: '/videos/generations' };
  }

  return { ...model, category: 'chat', endpoint: '/chat/completions' };
};

const groupModelsByCategory = (models: CategorizedModel[]): ModelGroup[] => {
  const groups: { [key in ModelCategory]: ModelGroup } = {
    chat: { category: 'chat', displayName: '💬 聊天模型', models: [] },
    images: { category: 'images', displayName: '🎨 图像模型', models: [], subcategories: {} },
    audio: { category: 'audio', displayName: '🎵 音频模型', models: [] },
    videos: { category: 'videos', displayName: '🎬 视频模型', models: [] },
  };

  models.forEach(model => {
    const group = groups[model.category];
    group.models.push(model);
    if (model.category === 'images' && model.subcategory && group.subcategories) {
      if (!group.subcategories[model.subcategory]) {
        group.subcategories[model.subcategory] = [];
      }
      group.subcategories[model.subcategory]!.push(model);
    }
  });

  return Object.values(groups).filter(group => group.models.length > 0);
};

// The component
// Global state to prevent multiple instances from fetching
let globalFetchState = {
  inFlight: false,
  lastFetch: 0,
  models: [] as Model[],
  error: null as string | null,
  loading: false
};

export function ModelSelector() {
  const { settings, updateSettings } = useSettings();
  const { t } = useI18n();
  const { currentConversation, updateConversationModel } = useSimpleConversations();

  const [allModels, setAllModels] = useState<Model[]>(globalFetchState.models);
  const [loading, setLoading] = useState(globalFetchState.loading);
  const [error, setError] = useState<string | null>(globalFetchState.error);
  const mountedRef = useRef(false);

  // Simple fetch function that updates global state
  const fetchModels = useCallback(async () => {
    const apiKey = settings.apiKey;
    const baseURL = settings.baseURL;
    
    if (!apiKey || !baseURL) {
      globalFetchState = { inFlight: false, lastFetch: 0, models: [], error: null, loading: false };
      setAllModels([]);
      setLoading(false);
      setError(null);
      return;
    }

    // Global in-flight check with cooldown
    const now = Date.now();
    if (globalFetchState.inFlight || (now - globalFetchState.lastFetch < 5000)) {
      // eslint-disable-next-line no-console
      console.log('[ModelSelector] skip - global cooldown or in-flight');
      return;
    }
    
    globalFetchState.inFlight = true;
    globalFetchState.loading = true;
    globalFetchState.error = null;
    globalFetchState.lastFetch = now;
    
    setLoading(true);
    setError(null);
    
    // eslint-disable-next-line no-console
    console.log('[ModelSelector] fetch start');
    
    try {
      const normalizedBase = baseURL.replace(/\/$/, '');
      const response = await fetch("/api/models", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
          "X-Base-URL": normalizedBase,
        },
      });

      if (!response.ok) {
        let errMsg = 'Failed to fetch model list';
        try {
          const errorData = await response.json();
          errMsg = errorData.error?.message || errMsg;
        } catch {}
        throw new Error(errMsg);
      }

      const result: { data: Model[] } = await response.json();
      globalFetchState.models = result.data || [];
      globalFetchState.error = null;
      setAllModels(globalFetchState.models);
      setError(null);
      // eslint-disable-next-line no-console
      console.log('[ModelSelector] fetch success, models:', result.data?.length || 0);
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to fetch model list';
      globalFetchState.models = [];
      globalFetchState.error = errorMsg;
      setAllModels([]);
      setError(errorMsg);
      // eslint-disable-next-line no-console
      console.log('[ModelSelector] fetch error:', errorMsg);
    } finally {
      globalFetchState.loading = false;
      globalFetchState.inFlight = false;
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mount effect - only run once per component instance
  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    
    // eslint-disable-next-line no-console
    console.log('[ModelSelector] component mounted');
    
    // Use existing data if available and fresh
    if (globalFetchState.models.length > 0 && Date.now() - globalFetchState.lastFetch < 30000) {
      // eslint-disable-next-line no-console
      console.log('[ModelSelector] using cached models');
      setAllModels(globalFetchState.models);
      setLoading(false);
      setError(globalFetchState.error);
    } else {
      fetchModels();
    }
    
    // Settings-saved event listener
    const handler = () => {
      // eslint-disable-next-line no-console
      console.log('[ModelSelector] settings-saved event received');
      fetchModels();
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('sprychat:settings-saved', handler);
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('sprychat:settings-saved', handler);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredModels = useMemo(() => {
    if (settings.showAllModels) return allModels;
    const free = allModels.filter(isFreeModel);
    return free.length > 0 ? free : allModels;
  }, [allModels, settings.showAllModels]);

  const modelGroups = useMemo(() => {
    const categorized = filteredModels.map(categorizeModel);
    return groupModelsByCategory(categorized);
  }, [filteredModels]);

  const handleModelChange = (modelId: string) => {
    if (modelId === settings.model) return;
    updateSettings({ model: modelId });
    if (currentConversation) {
      updateConversationModel(currentConversation.id, modelId);
    }
  };

  const selectedModelExists = useMemo(() => 
    filteredModels.some(m => m.id === settings.model),
    [filteredModels, settings.model]
  );

  // Do not auto-reset global model if it is not in the filtered list.
  // We simply show a placeholder until the user selects a visible model.

  return (
    <Select
      value={selectedModelExists ? settings.model : ''}
      onValueChange={handleModelChange}
      disabled={loading || modelGroups.length === 0}
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder={loading ? t('loading') : t('selectModel')} />
      </SelectTrigger>
      <SelectContent>
        {error ? (
          <div className="p-2 text-sm text-red-500">{error}</div>
        ) : loading ? (
          <div className="p-2 text-sm text-muted-foreground">{t('loading')}</div>
        ) : modelGroups.length === 0 ? (
          <div className="p-2 text-sm text-muted-foreground">{t('configureApiKey')}</div>
        ) : (
          modelGroups.map((group) => (
            <div key={group.category}>
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-b">
                {group.displayName}
              </div>
              {(group.category === 'images' && group.subcategories ? 
                Object.entries(group.subcategories).map(([sub, models]) => (
                  <div key={sub}>
                    <div className="px-4 py-1 text-xs text-muted-foreground">
                      {sub === 'generations' ? '🎨 图像生成' : '✏️ 图像编辑'}
                    </div>
                    {models?.map((model) => <ModelItem key={model.id} model={model} />)}
                  </div>
                )) :
                group.models.map((model) => <ModelItem key={model.id} model={model} />)
              )}
            </div>
          ))
        )}
      </SelectContent>
    </Select>
  );
}

function ModelItem({ model }: { model: CategorizedModel }) {
  return (
    <SelectItem value={model.id}>
      <div className="flex items-center justify-between w-full">
        <span className="truncate">{model.name || model.id}</span>
        <div className="flex items-center gap-1 ml-2">
          <Badge variant="default" className={`text-xs ${isFreeModel(model) ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700' : 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700'}`}>
            {isFreeModel(model) ? '免费' : '收费'}
          </Badge>
          {model.endpoint && (
            <Badge variant="outline" className="text-xs">
              {model.endpoint.split('/').pop()}
            </Badge>
          )}
        </div>
      </div>
    </SelectItem>
  );
}
