
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Globe, Languages } from "lucide-react";

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
}

const LanguageSelector = ({ selectedLanguage, onLanguageChange }: LanguageSelectorProps) => {
  const languages = [
    {
      value: "auto",
      label: "Auto-Detect",
      description: "Let Azure detect the language automatically",
      icon: <Globe className="h-4 w-4" />,
      badge: "Recommended"
    },
    {
      value: "ar",
      label: "Arabic (العربية)",
      description: "Optimized for Arabic text recognition",
      icon: <Languages className="h-4 w-4" />,
      badge: "Enhanced"
    },
    {
      value: "en",
      label: "English",
      description: "English text recognition",
      icon: <Languages className="h-4 w-4" />
    },
    {
      value: "ar-en",
      label: "Arabic + English",
      description: "Mixed Arabic and English documents",
      icon: <Languages className="h-4 w-4" />,
      badge: "Bilingual"
    }
  ];

  return (
    <div className="space-y-2">
      <Label htmlFor="language-select" className="flex items-center space-x-2">
        <Languages className="h-4 w-4" />
        <span>Document Language</span>
      </Label>
      <Select value={selectedLanguage} onValueChange={onLanguageChange}>
        <SelectTrigger id="language-select">
          <SelectValue placeholder="Select document language" />
        </SelectTrigger>
        <SelectContent>
          {languages.map((language) => (
            <SelectItem key={language.value} value={language.value}>
              <div className="flex items-center space-x-2 w-full">
                {language.icon}
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{language.label}</span>
                    {language.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {language.badge}
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">{language.description}</div>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSelector;
