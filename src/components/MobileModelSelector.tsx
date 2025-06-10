
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Brain, FileText, Layers, Receipt, CreditCard, FileCheck, IdCard, Calculator } from "lucide-react";

interface ModelData {
  value: string;
  label: string;
  description: string;
  icon: React.ReactElement;
  accuracy: string;
  speed: string;
  isSpecialized?: boolean;
}

interface MobileModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const MobileModelSelector = ({ selectedModel, onModelChange }: MobileModelSelectorProps) => {
  const modelCategories = [
    {
      category: "General Purpose",
      models: [
        {
          value: "handwriting",
          label: "Handwriting",
          description: "For handwritten documents",
          icon: <Brain className="h-4 w-4" />,
          accuracy: "99.2%",
          speed: "Fast"
        },
        {
          value: "print",
          label: "Print Text", 
          description: "For printed documents",
          icon: <FileText className="h-4 w-4" />,
          accuracy: "99.8%",
          speed: "Very Fast"
        },
        {
          value: "mixed",
          label: "Mixed Document",
          description: "Both handwritten and printed",
          icon: <Layers className="h-4 w-4" />,
          accuracy: "98.9%",
          speed: "Fast"
        }
      ] as ModelData[]
    },
    {
      category: "Specialized",
      models: [
        {
          value: "invoice",
          label: "Invoice",
          description: "Extract invoice data and totals",
          icon: <Receipt className="h-4 w-4" />,
          accuracy: "97.5%",
          speed: "Medium",
          isSpecialized: true
        },
        {
          value: "receipt",
          label: "Receipt",
          description: "Process receipts and expenses",
          icon: <CreditCard className="h-4 w-4" />,
          accuracy: "96.8%",
          speed: "Fast",
          isSpecialized: true
        },
        {
          value: "form",
          label: "Form",
          description: "Extract structured form data",
          icon: <FileCheck className="h-4 w-4" />,
          accuracy: "98.1%",
          speed: "Medium",
          isSpecialized: true
        },
        {
          value: "id",
          label: "ID Document",
          description: "Process identity documents",
          icon: <IdCard className="h-4 w-4" />,
          accuracy: "99.4%",
          speed: "Fast",
          isSpecialized: true
        },
        {
          value: "financial",
          label: "Financial",
          description: "Extract financial data",
          icon: <Calculator className="h-4 w-4" />,
          accuracy: "97.8%",
          speed: "Medium",
          isSpecialized: true
        }
      ] as ModelData[]
    }
  ];

  const allModels = modelCategories.flatMap(cat => cat.models);
  const selectedModelData = allModels.find(model => model.value === selectedModel);

  return (
    <div className="space-y-3 sm:space-y-4">
      <div>
        <Label htmlFor="model-select" className="text-sm font-medium">Document Intelligence Model</Label>
        <p className="text-xs text-gray-500 mt-1">Choose the best model for your document</p>
      </div>
      
      <Select value={selectedModel} onValueChange={onModelChange}>
        <SelectTrigger id="model-select" className="h-auto min-h-[44px]">
          <SelectValue placeholder="Select processing model">
            {selectedModelData && (
              <div className="flex items-center space-x-2 py-1">
                {selectedModelData.icon}
                <div className="text-left flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{selectedModelData.label}</div>
                  <div className="text-xs text-muted-foreground truncate sm:hidden">
                    {selectedModelData.accuracy} • {selectedModelData.speed}
                  </div>
                  <div className="text-xs text-muted-foreground hidden sm:block">{selectedModelData.description}</div>
                </div>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-[70vh] z-50">
          {modelCategories.map((category) => (
            <div key={category.category}>
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                {category.category}
              </div>
              {category.models.map((model) => (
                <SelectItem key={model.value} value={model.value} className="py-3 min-h-[44px]">
                  <div className="flex items-start space-x-3 w-full">
                    {model.icon}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-sm">{model.label}</span>
                        {model.isSpecialized && (
                          <Badge variant="secondary" className="text-xs">Specialized</Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mb-1">{model.description}</div>
                      <div className="flex items-center space-x-3 text-xs">
                        <span className="text-muted-foreground">
                          Accuracy: <span className="font-medium text-green-600">{model.accuracy}</span>
                        </span>
                        <span className="text-muted-foreground">
                          Speed: <span className="font-medium text-blue-600">{model.speed}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </div>
          ))}
        </SelectContent>
      </Select>

      {/* Mobile-optimized Model Information */}
      {selectedModelData && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center space-x-2 mb-2">
            {selectedModelData.icon}
            <span className="font-medium text-sm">{selectedModelData.label}</span>
            {selectedModelData.isSpecialized && (
              <Badge variant="default" className="text-xs">Specialized</Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-gray-600 mb-2">{selectedModelData.description}</p>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-gray-500 block">Accuracy:</span>
              <div className="font-semibold text-green-600">{selectedModelData.accuracy}</div>
            </div>
            <div>
              <span className="text-gray-500 block">Speed:</span>
              <div className="font-semibold text-blue-600">{selectedModelData.speed}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileModelSelector;
