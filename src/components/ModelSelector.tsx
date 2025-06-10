
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Brain, FileText, Layers } from "lucide-react";

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const ModelSelector = ({ selectedModel, onModelChange }: ModelSelectorProps) => {
  const models = [
    {
      value: "handwriting",
      label: "Handwriting Focus",
      description: "Optimized for handwritten documents",
      icon: <Brain className="h-4 w-4" />
    },
    {
      value: "print",
      label: "Print Focus", 
      description: "Best for printed text and documents",
      icon: <FileText className="h-4 w-4" />
    },
    {
      value: "mixed",
      label: "Mixed Document",
      description: "Handles both handwritten and printed text",
      icon: <Layers className="h-4 w-4" />
    }
  ];

  return (
    <div className="space-y-2">
      <Label htmlFor="model-select">OCR Model</Label>
      <Select value={selectedModel} onValueChange={onModelChange}>
        <SelectTrigger id="model-select">
          <SelectValue placeholder="Select OCR model" />
        </SelectTrigger>
        <SelectContent>
          {models.map((model) => (
            <SelectItem key={model.value} value={model.value}>
              <div className="flex items-center space-x-2">
                {model.icon}
                <div>
                  <div className="font-medium">{model.label}</div>
                  <div className="text-xs text-muted-foreground">{model.description}</div>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ModelSelector;
