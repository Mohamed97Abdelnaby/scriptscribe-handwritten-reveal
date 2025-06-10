
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Brain, FileText, Layers, Receipt, CreditCard, FileCheck, IdCard, Calculator } from "lucide-react";

interface EnhancedModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const EnhancedModelSelector = ({ selectedModel, onModelChange }: EnhancedModelSelectorProps) => {
  const modelCategories = [
    {
      category: "General Purpose",
      models: [
        {
          value: "handwriting",
          label: "Handwriting Focus",
          description: "Optimized for handwritten documents and notes",
          icon: <Brain className="h-4 w-4" />,
          accuracy: "99.2%",
          speed: "Fast"
        },
        {
          value: "print",
          label: "Print Focus", 
          description: "Best for printed text and documents",
          icon: <FileText className="h-4 w-4" />,
          accuracy: "99.8%",
          speed: "Very Fast"
        },
        {
          value: "mixed",
          label: "Mixed Document",
          description: "Handles both handwritten and printed text",
          icon: <Layers className="h-4 w-4" />,
          accuracy: "98.9%",
          speed: "Fast"
        }
      ]
    },
    {
      category: "Specialized Models",
      models: [
        {
          value: "invoice",
          label: "Invoice Processor",
          description: "Extract invoice data, line items, and totals",
          icon: <Receipt className="h-4 w-4" />,
          accuracy: "97.5%",
          speed: "Medium",
          isSpecialized: true
        },
        {
          value: "receipt",
          label: "Receipt Analyzer",
          description: "Process receipts and expense documents",
          icon: <CreditCard className="h-4 w-4" />,
          accuracy: "96.8%",
          speed: "Fast",
          isSpecialized: true
        },
        {
          value: "form",
          label: "Form Processor",
          description: "Extract structured data from forms",
          icon: <FileCheck className="h-4 w-4" />,
          accuracy: "98.1%",
          speed: "Medium",
          isSpecialized: true
        },
        {
          value: "id",
          label: "ID Document",
          description: "Process identity documents and cards",
          icon: <IdCard className="h-4 w-4" />,
          accuracy: "99.4%",
          speed: "Fast",
          isSpecialized: true
        },
        {
          value: "financial",
          label: "Financial Statement",
          description: "Extract data from financial documents",
          icon: <Calculator className="h-4 w-4" />,
          accuracy: "97.8%",
          speed: "Medium",
          isSpecialized: true
        }
      ]
    }
  ];

  const allModels = modelCategories.flatMap(cat => cat.models);
  const selectedModelData = allModels.find(model => model.value === selectedModel);

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="model-select">Document Intelligence Model</Label>
        <p className="text-xs text-gray-500 mt-1">Choose the best model for your document type</p>
      </div>
      
      <Select value={selectedModel} onValueChange={onModelChange}>
        <SelectTrigger id="model-select" className="h-auto">
          <SelectValue placeholder="Select processing model">
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
          {modelCategories.map((category) => (
            <div key={category.category}>
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                {category.category}
              </div>
              {category.models.map((model) => (
                <SelectItem key={model.value} value={model.value} className="py-3">
                  <div className="flex items-start space-x-3 w-full">
                    {model.icon}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{model.label}</span>
                        {model.isSpecialized && (
                          <Badge variant="secondary" className="text-xs">Specialized</Badge>
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
                    </div>
                  </div>
                </SelectItem>
              ))}
            </div>
          ))}
        </SelectContent>
      </Select>

      {/* Model Information Card */}
      {selectedModelData && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            {selectedModelData.icon}
            <span className="font-medium">{selectedModelData.label}</span>
            {selectedModelData.isSpecialized && (
              <Badge variant="default" className="text-xs">Specialized Model</Badge>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-3">{selectedModelData.description}</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Expected Accuracy:</span>
              <div className="font-semibold text-green-600">{selectedModelData.accuracy}</div>
            </div>
            <div>
              <span className="text-gray-500">Processing Speed:</span>
              <div className="font-semibold text-blue-600">{selectedModelData.speed}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedModelSelector;
