
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FileText, Layers, Table, CheckSquare, Image } from "lucide-react";

interface ReadLayoutModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const ReadLayoutModelSelector = ({ selectedModel, onModelChange }: ReadLayoutModelSelectorProps) => {
  const models = [
    {
      value: "layout",
      label: "Layout Analysis",
      description: "Complete document understanding - tables, checkboxes, figures, and text",
      icon: <Layers className="h-4 w-4" />,
      features: ["Tables", "Checkboxes", "Figures", "Text", "Forms"],
      accuracy: "99.1%",
      speed: "Medium",
      isRecommended: true
    },
    {
      value: "read",
      label: "Text Reading",
      description: "Fast text extraction with basic layout detection",
      icon: <FileText className="h-4 w-4" />,
      features: ["Text", "Basic Layout"],
      accuracy: "99.5%",
      speed: "Fast",
      isRecommended: false
    }
  ];

  const selectedModelData = models.find(model => model.value === selectedModel);

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="model-select">Raya Document Intelligence Model</Label>
        <p className="text-xs text-gray-500 mt-1">Choose the analysis type for your document</p>
      </div>
      
      <Select value={selectedModel} onValueChange={onModelChange}>
        <SelectTrigger id="model-select" className="h-auto">
          <SelectValue placeholder="Select analysis model">
            {selectedModelData && (
              <div className="flex items-center space-x-2 py-1">
                {selectedModelData.icon}
                <div className="text-left">
                  <div className="font-medium">{selectedModelData.label}</div>
                  <div className="text-xs text-muted-foreground">{selectedModelData.description}</div>
                </div>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-96">
          {models.map((model) => (
            <SelectItem key={model.value} value={model.value} className="py-3">
              <div className="flex items-start space-x-3 w-full">
                {model.icon}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{model.label}</span>
                    {model.isRecommended && (
                      <Badge variant="default" className="text-xs bg-green-600">Recommended</Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{model.description}</div>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="text-xs">
                      <span className="text-muted-foreground">Accuracy:</span> 
                      <span className="font-medium ml-1">{model.accuracy}</span>
                    </div>
                    <div className="text-xs">
                      <span className="text-muted-foreground">Speed:</span> 
                      <span className="font-medium ml-1">{model.speed}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    {model.features.map((feature, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {feature === "Tables" && <Table className="h-3 w-3 mr-1" />}
                        {feature === "Checkboxes" && <CheckSquare className="h-3 w-3 mr-1" />}
                        {feature === "Figures" && <Image className="h-3 w-3 mr-1" />}
                        {feature === "Text" && <FileText className="h-3 w-3 mr-1" />}
                        {feature === "Forms" && <Layers className="h-3 w-3 mr-1" />}
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Model Information Card */}
      {selectedModelData && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            {selectedModelData.icon}
            <span className="font-medium">{selectedModelData.label}</span>
            {selectedModelData.isRecommended && (
              <Badge variant="default" className="text-xs bg-green-600">Recommended</Badge>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-3">{selectedModelData.description}</p>
          <div className="grid grid-cols-2 gap-4 text-sm mb-3">
            <div>
              <span className="text-gray-500">Expected Accuracy:</span>
              <div className="font-semibold text-green-600">{selectedModelData.accuracy}</div>
            </div>
            <div>
              <span className="text-gray-500">Processing Speed:</span>
              <div className="font-semibold text-blue-600">{selectedModelData.speed}</div>
            </div>
          </div>
          <div>
            <span className="text-gray-500 text-sm">Detects:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {selectedModelData.features.map((feature, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {feature}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReadLayoutModelSelector;
