
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, CheckCircle, AlertCircle, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { azureDocumentIntelligence } from "@/services/azureDocumentIntelligence";

interface AzureCredentialsFormProps {
  onCredentialsSet: (isValid: boolean) => void;
}

const AzureCredentialsForm = ({ onCredentialsSet }: AzureCredentialsFormProps) => {
  const [endpoint, setEndpoint] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing credentials
    const existing = azureDocumentIntelligence.getCredentials();
    if (existing) {
      setEndpoint(existing.endpoint);
      setApiKey(existing.apiKey);
      setIsValid(true);
      onCredentialsSet(true);
    }
  }, [onCredentialsSet]);

  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      const credentials = { endpoint: endpoint.trim(), apiKey: apiKey.trim() };
      
      if (!azureDocumentIntelligence.validateCredentials(credentials)) {
        throw new Error("Invalid endpoint or API key format");
      }

      azureDocumentIntelligence.setCredentials(credentials);
      setIsValid(true);
      onCredentialsSet(true);
      
      toast({
        title: "Credentials saved",
        description: "Azure Document Intelligence credentials have been configured successfully.",
      });
    } catch (error) {
      toast({
        title: "Invalid credentials",
        description: error instanceof Error ? error.message : "Please check your endpoint and API key format.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    azureDocumentIntelligence.clearCredentials();
    setEndpoint("");
    setApiKey("");
    setIsValid(false);
    onCredentialsSet(false);
    
    toast({
      title: "Credentials cleared",
      description: "Azure credentials have been removed.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>Azure Document Intelligence Configuration</span>
          {isValid && <Badge variant="default" className="ml-2"><CheckCircle className="h-3 w-3 mr-1" />Connected</Badge>}
        </CardTitle>
        <CardDescription>
          Configure your Azure Document Intelligence credentials to enable real document processing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="endpoint">Azure Endpoint</Label>
          <Input
            id="endpoint"
            type="url"
            placeholder="https://your-resource.cognitiveservices.azure.com/"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Your Azure Cognitive Services endpoint URL
          </p>
        </div>

        <div>
          <Label htmlFor="apiKey">API Key</Label>
          <div className="relative mt-1">
            <Input
              id="apiKey"
              type={showApiKey ? "text" : "password"}
              placeholder="Enter your Azure API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => setShowApiKey(!showApiKey)}
            >
              {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Your Azure Document Intelligence API key (64 characters)
          </p>
        </div>

        <div className="flex space-x-2">
          <Button 
            onClick={handleSave} 
            disabled={!endpoint.trim() || !apiKey.trim() || isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Validating...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Save Credentials
              </>
            )}
          </Button>
          
          {isValid && (
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
          )}
        </div>

        {!isValid && (endpoint || apiKey) && (
          <div className="flex items-center space-x-2 text-sm text-orange-600">
            <AlertCircle className="h-4 w-4" />
            <span>Please save valid credentials to enable Azure processing</span>
          </div>
        )}

        {isValid && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-sm text-green-700">
              <CheckCircle className="h-4 w-4" />
              <span>Azure Document Intelligence is ready for use</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AzureCredentialsForm;
