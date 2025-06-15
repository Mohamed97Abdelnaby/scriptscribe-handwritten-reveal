
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Eye, PenTool, Type, FileImage, Receipt, CreditCard, IdCard, DollarSign } from "lucide-react";

interface ModelOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  recommended?: boolean;
  confidence: string;
}

interface EnhancedReadModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const EnhancedReadModelSelector = ({ selectedModel, onModelChange }: EnhancedReadModelSelectorProps) => {
  const modelOptions: ModelOption[] = [
    {
      id: "read",
      name: "Enhanced Read",
      description: "Advanced text extraction with handwriting detection",
      icon: <Eye className="h-5 w-5" />,
      features: ["Handwriting Detection", "Polygon Bounding Boxes", "Word Confidence", "Page Dimensions"],
      recommended: true,
      confidence: "99.2%"
    },
    {
      id: "handwriting",
      name: "Handwriting Focus",
      description: "Optimized for handwritten documents",
      icon: <PenTool className="h-5 w-5" />,
      features: ["Handwriting Analysis", "Style Detection", "Cursive Text", "Mixed Content"],
      confidence: "97.8%"
    },
    {
      id: "print",
      name: "Print Focus",
      description: "Optimized for printed text documents",
      icon: <Type className="h-5 w-5" />,
      features: ["High Accuracy", "Font Detection", "Layout Analysis", "Multi-Column"],
      confidence: "99.5%"
    },
    {
      id: "mixed",
      name: "Mixed Content",
      description: "Handles both printed and handwritten text",
      icon: <FileText className="h-5 w-5" />,
      features: ["Universal Detection", "Content Classification", "Adaptive Processing", "Best Balance"],
      confidence: "98.1%"
    },
    {
      id: "invoice",
      name: "Invoice Processor",
      description: "Specialized for invoice documents",
      icon: <Receipt className="h-5 w-5" />,
      features: ["Invoice Fields", "Line Items", "Tax Extraction", "Vendor Info"],
      confidence: "96.7%"
    },
    {
      id: "receipt",
      name: "Receipt Processor",
      description: "Optimized for receipt scanning",
      icon: <CreditCard className="h-5 w-5" />,
      features: ["Transaction Data", "Item Detection", "Merchant Info", "Totals"],
      confidence: "95.9%"
    },
    {
      id: "id",
      name: "ID Document",
      description: "Identity document processing",
      icon: <IdCard className="h-5 w-5" />,
      features: ["Personal Info", "Document Type", "Security Features", "Field Extraction"],
      confidence: "97.3%"
    },
    {
      id: "financial",
      name: "Financial Document",
      description: "Bank statements and financial forms",
      icon: <DollarSign className="h-5 w-5" />,
      features: ["Financial Fields", "Transaction History", "Account Info", "Statements"],
      confidence: "96.1%"
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Enhanced Read Models</h3>
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          Azure Document Intelligence
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {modelOptions.map((option) => (
          <Card
            key={option.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedModel === option.id 
                ? 'ring-2 ring-primary border-primary bg-primary/5' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onModelChange(option.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`p-2 rounded-lg ${
                    selectedModel === option.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {option.icon}
                  </div>
                  {option.recommended && (
                    <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                      Recommended
                    </Badge>
                  )}
                </div>
                <Badge variant="outline" className="text-xs">
                  {option.confidence}
                </Badge>
              </div>
              <CardTitle className="text-base">{option.name}</CardTitle>
              <CardDescription className="text-sm">{option.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {option.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    <span className="text-xs text-gray-600">{feature}</span>
                  </div>
                ))}
              </div>
              {selectedModel === option.id && (
                <Button size="sm" className="w-full mt-3" disabled>
                  Selected
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="text-xs text-gray-500 text-center">
        All models support Arabic, English, and 100+ languages with enhanced polygon-based bounding boxes
      </div>
    </div>
  );
};

export default EnhancedReadModelSelector;
