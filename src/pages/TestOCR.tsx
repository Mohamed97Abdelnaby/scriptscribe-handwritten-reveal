import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Upload, Play, CheckCircle, BarChart3 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import MobileProcessingSteps from "@/components/MobileProcessingSteps";
import MobileModelSelector from "@/components/MobileModelSelector";
import MobileDocumentViewer from "@/components/MobileDocumentViewer";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import StructuredDataViewer from "@/components/StructuredDataViewer";
import AdvancedResults from "@/components/AdvancedResults";
import { useToast } from "@/hooks/use-toast";
import AzureCredentialsForm from "@/components/AzureCredentialsForm";
import { azureDocumentIntelligence } from "@/services/azureDocumentIntelligence";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const TestOCR = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>("mixed");
  const [currentStep, setCurrentStep] = useState(1);
  const [activeResultsTab, setActiveResultsTab] = useState("analytics");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const [azureCredentialsConfigured, setAzureCredentialsConfigured] = useState(false);
  const [lovableApiEndpoint, setLovableApiEndpoint] = useState("");
  const [useAzureProcessing, setUseAzureProcessing] = useState(false);

  const handleFileSelect = useCallback((file: File) => {
    console.log("File selected:", file);
    setSelectedFile(file);
    setCurrentStep(2);

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setOcrResult("");
    setProgress(0);
    toast({
      title: "File uploaded successfully",
      description: `${file.name} is ready for advanced OCR processing.`
    });
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        handleFileSelect(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload an image or PDF file.",
          variant: "destructive"
        });
      }
    }
  }, [handleFileSelect, toast]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const simulateOCR = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setProgress(0);
    setCurrentStep(3);
    console.log("Starting OCR processing for:", selectedFile.name, "with model:", selectedModel);

    try {
      if (useAzureProcessing && azureCredentialsConfigured) {
        // Use real Azure Document Intelligence
        await processWithAzure();
      } else {
        // Use simulated processing
        await processWithSimulation();
      }
    } catch (error) {
      console.error("Processing error:", error);
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "An error occurred during document processing.",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };

  const processWithAzure = async () => {
    if (!selectedFile) return;

    try {
      // Map UI model selection to Azure model IDs
      const azureModelMap: Record<string, string> = {
        'invoice': 'prebuilt-invoice',
        'receipt': 'prebuilt-receipt',
        'form': 'prebuilt-document',
        'id': 'prebuilt-idDocument',
        'financial': 'prebuilt-document',
        'handwriting': 'prebuilt-read',
        'print': 'prebuilt-read',
        'mixed': 'prebuilt-document'
      };

      const azureModelId = azureModelMap[selectedModel] || 'prebuilt-document';

      // Progress updates
      setProgress(20);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProgress(40);
      
      // Call Azure Document Intelligence
      const result = await azureDocumentIntelligence.analyzeDocument(selectedFile, azureModelId);
      
      setProgress(80);
      
      // Send to Lovable API if endpoint is provided
      if (lovableApiEndpoint) {
        await azureDocumentIntelligence.sendToLovableAPI(result, lovableApiEndpoint);
      }
      
      setProgress(100);
      
      // Format result for display
      const formattedResult = formatAzureResult(result);
      setOcrResult(formattedResult);
      setCurrentStep(4);
      
      toast({
        title: "Azure Document Intelligence Complete!",
        description: `Document processed successfully with ${selectedModel} model.`
      });
      
    } finally {
      setIsProcessing(false);
    }
  };

  const processWithSimulation = async () => {
    const getEnhancedModelSpecificText = () => {
      const modelDescriptions = {
        invoice: "Invoice data extraction with line items, totals, and vendor information",
        receipt: "Receipt processing with merchant details, items, and tax information",
        form: "Form field extraction with structured key-value pairs",
        id: "Identity document processing with personal information extraction",
        financial: "Financial statement analysis with account details and transactions",
        handwriting: "Handwriting recognition with advanced character analysis",
        print: "High-precision printed text extraction with layout preservation",
        mixed: "Combined handwritten and printed text processing"
      };

      return `AZURE DOCUMENT INTELLIGENCE STUDIO RESULT

Document: "${selectedFile?.name}"
Model: ${selectedModel.toUpperCase()} PROCESSING ENGINE
Processing Mode: ${modelDescriptions[selectedModel as keyof typeof modelDescriptions] || 'Advanced OCR processing'}

=== DOCUMENT ANALYSIS ===
✓ Document loaded and preprocessed
✓ Layout analysis completed
✓ Text regions identified and classified
✓ Confidence scoring applied
✓ Structured data extraction completed

Processing Configuration:
• Engine: Azure Document Intelligence v3.1
• Model: ${selectedModel === 'invoice' ? 'prebuilt-invoice' : selectedModel === 'receipt' ? 'prebuilt-receipt' : selectedModel === 'form' ? 'prebuilt-document' : selectedModel === 'id' ? 'prebuilt-idDocument' : `custom-${selectedModel}`}
• API Version: 2023-07-31
• Processing Mode: ${selectedModel.includes('invoice') || selectedModel.includes('receipt') || selectedModel.includes('form') ? 'Structured Extraction' : 'Text Recognition'}

=== EXTRACTION RESULTS ===

${selectedModel === 'invoice' ? `
INVOICE DATA EXTRACTED:
• Vendor: Acme Corporation
• Invoice #: INV-2024-001  
• Date: June 10, 2025
• Due Date: July 10, 2025
• Subtotal: $1,150.00
• Tax: $92.00
• Total: $1,242.00

LINE ITEMS:
1. Professional Services - Qty: 10 hrs - Rate: $100.00 - Amount: $1,000.00
2. Consultation Fee - Qty: 1 - Rate: $150.00 - Amount: $150.00

VENDOR DETAILS:
• Company: Acme Corporation
• Address: 123 Business Ave, Suite 100, City, ST 12345
• Phone: (555) 123-4567
• Email: billing@acme.com
` : selectedModel === 'receipt' ? `
RECEIPT DATA EXTRACTED:
• Merchant: SuperMart Grocery
• Date: June 10, 2025
• Time: 14:32:18
• Receipt #: 789456123
• Total: $47.83
• Tax: $3.58
• Payment Method: Credit Card ****1234

ITEMS PURCHASED:
1. Organic Bananas - $3.99
2. Whole Milk (1 Gal) - $4.29
3. Bread (Whole Wheat) - $2.89
4. Chicken Breast (2 lbs) - $12.98
5. Mixed Vegetables - $6.49
6. Orange Juice - $3.99
7. Greek Yogurt - $5.99
8. Apples (3 lbs) - $4.47
` : selectedModel === 'form' ? `
FORM DATA EXTRACTED:

PERSONAL INFORMATION:
• Full Name: John Michael Smith
• Date of Birth: January 15, 1990
• Social Security: XXX-XX-6789
• Phone: (555) 987-6543
• Email: john.smith@email.com

ADDRESS INFORMATION:
• Street: 456 Main Street, Apt 2B
• City: Springfield
• State: Illinois
• ZIP Code: 62701
• Country: United States

EMPLOYMENT DETAILS:
• Employer: Tech Solutions Inc.
• Position: Software Engineer
• Start Date: March 1, 2020
• Annual Salary: $85,000
• Department: Engineering
` : selectedModel === 'id' ? `
IDENTITY DOCUMENT EXTRACTED:

DOCUMENT TYPE: Driver's License
STATE: California
LICENSE CLASS: C

PERSONAL INFORMATION:
• Name: SMITH, JOHN MICHAEL
• Date of Birth: 01/15/1990
• License Number: D1234567
• Issue Date: 06/15/2023
• Expiration: 01/15/2031
• Sex: M
• Height: 5'10"
• Weight: 175 lbs
• Eye Color: Brown
• Hair Color: Brown

ADDRESS:
• 456 MAIN STREET
• SPRINGFIELD, CA 62701

RESTRICTIONS: NONE
ENDORSEMENTS: NONE
` : `
DOCUMENT CONTENT EXTRACTED:

This is a demonstration of our Azure Document Intelligence-inspired OCR platform processing your uploaded document with the ${selectedModel} model.

Advanced Text Recognition Features:
- Multi-language support with automatic detection
- High-precision character recognition: 99.2% accuracy
- Layout analysis with reading order detection
- Table structure preservation and extraction
- Form field identification and classification
- Handwriting recognition with neural networks

Sample Extracted Content:
The quick brown fox jumps over the lazy dog. This sentence demonstrates our advanced OCR capabilities including character recognition, word spacing, and punctuation handling.

TECHNICAL ANALYSIS:
• Document Type: ${selectedFile.type.includes('pdf') ? 'PDF Document' : 'Image Document'}
• Page Count: 1
• Text Regions: 12 detected
• Table Count: ${selectedModel === 'invoice' || selectedModel === 'financial' ? '2' : '0'}
• Form Fields: ${selectedModel === 'form' ? '8' : '0'}
• Language: English (confidence: 99.8%)
• Text Direction: Left-to-right
• Reading Order: Top-to-bottom
`}

PROCESSING STATISTICS:
• Total Characters: ${Math.floor(Math.random() * 1000) + 1200}
• Words Identified: ${Math.floor(Math.random() * 200) + 250}
• Lines Processed: ${Math.floor(Math.random() * 20) + 15}
• Confidence Score: ${selectedModel === 'print' ? '99.1%' : selectedModel === 'handwriting' ? '97.2%' : '98.3%'}
• Processing Time: ${selectedModel === 'print' ? '1.8' : selectedModel === 'handwriting' ? '3.2' : '2.5'} seconds
• Model Accuracy: ${selectedModel === 'print' ? '99.8%' : selectedModel === 'handwriting' ? '99.2%' : '98.9%'}

=== QUALITY METRICS ===
✓ Image Quality: Excellent
✓ Text Clarity: High
✓ Layout Complexity: Medium
✓ Noise Level: Low
✓ Skew Correction: Applied
✓ Enhancement: Auto-optimized

This enhanced result demonstrates professional-grade document intelligence capabilities with detailed analytics and structured data extraction.`;
    };

    const progressSteps = [0, 10, 25, 40, 55, 70, 85, 95, 100];
    for (const step of progressSteps) {
      setProgress(step);
      await new Promise(resolve => setTimeout(resolve, selectedModel === 'print' ? 120 : 180));
    }
    setOcrResult(getEnhancedModelSpecificText());
    setIsProcessing(false);
    setCurrentStep(4);
    toast({
      title: "Document Intelligence Complete!",
      description: `Advanced processing completed with ${selectedModel} model.`
    });
  };

  const formatAzureResult = (result: any) => {
    return `AZURE DOCUMENT INTELLIGENCE RESULT

Document: "${selectedFile?.name}"
Status: ${result.rawData.status}
Confidence: ${result.confidence.toFixed(1)}%

=== EXTRACTED DATA ===

${result.name ? `Name: ${result.name}` : ''}
${result.date ? `Date: ${result.date}` : ''}
${result.amount ? `Amount: ${result.amount}` : ''}
${result.id ? `ID/Number: ${result.id}` : ''}

=== PROCESSING DETAILS ===
• Engine: Azure Document Intelligence v3.1
• Model: ${selectedModel === 'invoice' ? 'prebuilt-invoice' : selectedModel === 'receipt' ? 'prebuilt-receipt' : selectedModel === 'form' ? 'prebuilt-document' : selectedModel === 'id' ? 'prebuilt-idDocument' : `prebuilt-${selectedModel}`}
• API Version: 2023-07-31
• Processing Mode: Real-time Azure Analysis

${lovableApiEndpoint ? '• Data sent to Lovable API endpoint' : ''}

This is a real result from Azure Document Intelligence processing your uploaded document.`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Page Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">Raya Intelligent Document</h1>
            <p className="text-sm sm:text-lg text-gray-600 max-w-4xl mx-auto px-2">
              Professional document processing platform with advanced OCR, structured data extraction, 
              and comprehensive analytics.
            </p>
          </div>

          <MobileProcessingSteps currentStep={currentStep} />

          {/* Mobile-First Layout */}
          <div className="space-y-6">
            {/* Azure Configuration - Show first if not configured */}
            {!azureCredentialsConfigured && (
              <AzureCredentialsForm onCredentialsSet={setAzureCredentialsConfigured} />
            )}

            {/* Upload & Configuration - Full width on mobile */}
            <div className="w-full">
              {/* Enhanced Upload Card */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                    <Upload className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span>Document Upload</span>
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Upload documents for advanced OCR processing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div 
                    className={`upload-area p-4 sm:p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-all ${
                      isDragOver ? 'drag-over' : ''
                    }`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept="image/*,.pdf"
                      onChange={handleFileInput}
                    />
                    
                    {selectedFile ? (
                      <div className="space-y-3 sm:space-y-4">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm sm:text-base break-all">{selectedFile.name}</p>
                          <p className="text-xs sm:text-sm text-gray-500">
                            {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type}
                          </p>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 text-xs">Ready for processing</Badge>
                      </div>
                    ) : (
                      <div className="space-y-3 sm:space-y-4">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                          <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-base sm:text-lg font-semibold text-gray-900">Drop your document here</p>
                          <p className="text-sm text-gray-500">or tap to browse files</p>
                          <p className="text-xs text-gray-400 mt-1">Supports JPG, PNG, PDF up to 10MB</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">Ready for upload</Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Model Configuration */}
              {selectedFile && (
                <Card className="mt-4">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg sm:text-xl">Processing Configuration</CardTitle>
                    <CardDescription className="text-sm">Configure document processing options</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Azure vs Simulation Toggle */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Processing Engine</Label>
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="processing"
                            checked={!useAzureProcessing}
                            onChange={() => setUseAzureProcessing(false)}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">Simulation Mode</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="processing"
                            checked={useAzureProcessing}
                            onChange={() => setUseAzureProcessing(true)}
                            disabled={!azureCredentialsConfigured}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">Azure Document Intelligence</span>
                          {azureCredentialsConfigured && <Badge variant="default" className="text-xs">Live</Badge>}
                        </label>
                      </div>
                    </div>

                    {/* Lovable API Endpoint */}
                    {useAzureProcessing && (
                      <div className="space-y-2">
                        <Label htmlFor="lovable-endpoint" className="text-sm font-medium">Lovable API Endpoint (Optional)</Label>
                        <Input
                          id="lovable-endpoint"
                          type="url"
                          placeholder="https://your-lovable-api-endpoint.com"
                          value={lovableApiEndpoint}
                          onChange={(e) => setLovableApiEndpoint(e.target.value)}
                          className="text-sm"
                        />
                        <p className="text-xs text-muted-foreground">Results will be sent to this endpoint after processing</p>
                      </div>
                    )}

                    <MobileModelSelector 
                      selectedModel={selectedModel} 
                      onModelChange={(model) => {
                        setSelectedModel(model);
                        setCurrentStep(3);
                      }} 
                    />
                    
                    <Button 
                      onClick={simulateOCR} 
                      disabled={isProcessing || (useAzureProcessing && !azureCredentialsConfigured)} 
                      className="w-full h-12 text-base"
                      size="lg"
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          {useAzureProcessing ? 'Processing with Azure...' : 'Processing...'}
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          {useAzureProcessing ? 'Process with Azure DI' : 'Start Document Intelligence'}
                        </>
                      )}
                    </Button>
                    
                    {isProcessing && (
                      <div className="mt-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>Processing document...</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="w-full" />
                        <p className="text-xs text-gray-500 mt-1">Advanced analysis in progress...</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Document Viewer - Full width on mobile */}
            {previewUrl && (
              <div className="w-full">
                <MobileDocumentViewer 
                  previewUrl={previewUrl} 
                  selectedModel={selectedModel} 
                />
              </div>
            )}
          </div>

          {/* Enhanced Results Section */}
          {(ocrResult || isProcessing) && (
            <Card className="mt-6 sm:mt-8">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                  <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span>Document Intelligence Results</span>
                </CardTitle>
                <CardDescription className="text-sm">
                  Comprehensive analysis and data extraction
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isProcessing ? (
                  <div className="flex items-center justify-center h-32 sm:h-64">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                      <p className="text-gray-600 text-sm">Running advanced document intelligence...</p>
                    </div>
                  </div>
                ) : (
                  <Tabs value={activeResultsTab} onValueChange={setActiveResultsTab}>
                    <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
                      <TabsTrigger value="analytics" className="text-xs sm:text-sm p-2 sm:p-3">Analytics</TabsTrigger>
                      <TabsTrigger value="structured" className="text-xs sm:text-sm p-2 sm:p-3">Data</TabsTrigger>
                      <TabsTrigger value="advanced" className="text-xs sm:text-sm p-2 sm:p-3 hidden sm:flex">Advanced</TabsTrigger>
                      <TabsTrigger value="raw" className="text-xs sm:text-sm p-2 sm:p-3">Raw</TabsTrigger>
                    </TabsList>

                    <TabsContent value="analytics" className="mt-4 sm:mt-6">
                      <AnalyticsDashboard 
                        selectedModel={selectedModel} 
                        processingTime={selectedModel === 'print' ? '1.8 seconds' : selectedModel === 'handwriting' ? '3.2 seconds' : '2.5 seconds'} 
                        overallConfidence={selectedModel === 'print' ? 99.1 : selectedModel === 'handwriting' ? 97.2 : 98.3} 
                      />
                    </TabsContent>

                    <TabsContent value="structured" className="mt-4 sm:mt-6">
                      <StructuredDataViewer rawText={ocrResult} selectedModel={selectedModel} />
                    </TabsContent>

                    <TabsContent value="advanced" className="mt-4 sm:mt-6">
                      <AdvancedResults rawText={ocrResult} isProcessing={isProcessing} selectedModel={selectedModel} />
                    </TabsContent>

                    <TabsContent value="raw" className="mt-4 sm:mt-6">
                      <Card>
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg">Raw OCR Output</CardTitle>
                          <CardDescription className="text-sm">Unprocessed text extraction results</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <textarea 
                            value={ocrResult} 
                            className="w-full h-64 sm:h-96 bg-gray-50 border rounded-lg p-3 sm:p-4 resize-none focus:outline-none focus:ring-2 focus:ring-primary font-mono text-xs sm:text-sm" 
                            placeholder="Raw OCR results will appear here..." 
                            readOnly 
                          />
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestOCR;
