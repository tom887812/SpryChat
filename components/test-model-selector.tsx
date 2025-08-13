"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/use-settings";

export function TestModelSelector() {
  const { settings, updateSettings } = useSettings();
  const [testModels] = useState([
    "gpt-4o",
    "gpt-4o-mini", 
    "claude-3-5-sonnet-20241022",
    "meta-llama/llama-3.2-3b-instruct:free"
  ]);

  const handleModelChange = (model: string) => {
    console.log("Changing model to:", model);
    updateSettings("model", model);
    console.log("Model updated in settings:", settings.model);
  };

  return (
    <div className="flex flex-col gap-2 p-4 border rounded-lg">
      <div className="text-sm font-medium">当前模型: {settings.model}</div>
      <div className="flex flex-wrap gap-2">
        {testModels.map((model) => (
          <Button
            key={model}
            variant={settings.model === model ? "default" : "outline"}
            size="sm"
            onClick={() => handleModelChange(model)}
          >
            {model.split("/").pop() || model}
          </Button>
        ))}
      </div>
    </div>
  );
}
