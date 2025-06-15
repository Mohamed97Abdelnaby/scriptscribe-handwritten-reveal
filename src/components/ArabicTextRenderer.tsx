
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Languages, CheckCircle } from "lucide-react";

interface ArabicTextRendererProps {
  text: string;
  confidence?: number;
  detectedLanguage?: string;
}

const ArabicTextRenderer = ({ text, confidence, detectedLanguage }: ArabicTextRendererProps) => {
  // Check if text contains Arabic characters
  const containsArabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
  
  // Check if text contains English characters
  const containsEnglish = /[a-zA-Z]/.test(text);
  
  const getLanguageBadge = () => {
    if (containsArabic && containsEnglish) {
      return <Badge variant="outline" className="text-xs">Arabic + English</Badge>;
    } else if (containsArabic) {
      return <Badge variant="outline" className="text-xs bg-green-50 text-green-700">Arabic</Badge>;
    } else if (containsEnglish) {
      return <Badge variant="outline" className="text-xs">English</Badge>;
    }
    return <Badge variant="outline" className="text-xs">Unknown</Badge>;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Languages className="h-5 w-5" />
            <span>Enhanced Text Display</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            {getLanguageBadge()}
            {confidence && (
              <Badge variant="secondary" className="text-xs">
                {confidence}% confidence
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div 
          className={`p-4 rounded-lg border ${
            containsArabic ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
          }`}
          style={{
            direction: containsArabic ? 'rtl' : 'ltr',
            textAlign: containsArabic ? 'right' : 'left',
            fontFamily: containsArabic ? 'Arial, "Noto Sans Arabic", sans-serif' : 'inherit',
            lineHeight: '1.8',
            fontSize: '16px'
          }}
        >
          {text ? (
            <p className="whitespace-pre-wrap">{text}</p>
          ) : (
            <p className="text-gray-500 italic">No text extracted yet</p>
          )}
        </div>
        
        {containsArabic && (
          <div className="mt-3 flex items-center space-x-2 text-sm text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>Arabic text detected - RTL rendering enabled</span>
          </div>
        )}
        
        {detectedLanguage && (
          <div className="mt-2 text-xs text-gray-600">
            Detected language: {detectedLanguage}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ArabicTextRenderer;
