
import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Upload, Play, CheckCircle, BarChart3 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import MobileProcessingSteps from "@/components/MobileProcessingSteps";
import EnhancedDocumentViewer from "@/components/EnhancedDocumentViewer";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import StructuredDataViewer from "@/components/StructuredDataViewer";
import AdvancedResults from "@/components/AdvancedResults";
import ReadLayoutModelSelector from "@/components/ReadLayoutModelSelector";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const TestOCR = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<string>("");
  const [structuredData, setStructuredData] = useState<any>(null);
  const [processingMetadata, setProcessingMetadata] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedModel, setSelectedModel] = useState("layout");
  const [currentStep, setCurrentStep] = useState(1);
  const [activeResultsTab, setActiveResultsTab] = useState("analytics");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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
      description: `${file.name} is ready for Raya Document Intelligence processing.`
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

  const processWithAzure = async () => {
    if (!selectedFile) return;
    
    setIsProcessing(true);
    setProgress(0);
    setCurrentStep(3);
    console.log("=== Starting Azure Document Intelligence processing ===");
    console.log("File:", selectedFile.name, "Model:", selectedModel);

    try {
      // Convert file to base64
      const reader = new FileReader();
      const fileData = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          const base64Data = result.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(selectedFile);
      });

      console.log("File converted to base64, length:", fileData.length);

      // Enhanced progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 1000);

      console.log("Calling Supabase edge function...");

      // Call Azure Document Intelligence via Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('azure-document-intelligence', {
        body: {
          fileData,
          modelType: selectedModel
        }
      });

      clearInterval(progressInterval);
      setProgress(100);

      console.log("=== Edge function response ===");
      console.log("Error:", error);
      console.log("Data:", data);
      console.log("Data type:", typeof data);
      console.log("Data keys:", data ? Object.keys(data) : 'null');

      if (error) {
        console.error('=== Supabase function error ===', error);
        toast({
          title: "Processing Failed",
          description: `Failed to process document: ${error.message || 'Unknown error'}`,
          variant: "destructive"
        });
        setIsProcessing(false);
        return;
      }

      if (!data) {
        console.error('=== No data returned from edge function ===');
        toast({
          title: "Processing Failed",
          description: "No data returned from the processing service.",
          variant: "destructive"
        });
        setIsProcessing(false);
        return;
      }

      if (data.success === false) {
        console.error('=== Edge function returned error ===', data);
        toast({
          title: "Processing Failed",
          description: data.error || 'Unknown error from processing service',
          variant: "destructive"
        });
        setIsProcessing(false);
        return;
      }

      if (data.success && data.data) {
        console.log("=== Processing successful ===");
        console.log("Raw text length:", data.data.rawText?.length || 0);
        console.log("Metadata:", data.data.metadata);
        
        setOcrResult(data.data.rawText || '');
        setStructuredData(data.data);
        setProcessingMetadata(data.data.metadata);
        setCurrentStep(4);
        
        const modelTypeDisplay = selectedModel === 'layout' ? 'Layout Analysis' : 'Text Reading';
        const elementsFound = [
          data.data.metadata?.totalTextLines && `${data.data.metadata.totalTextLines} text lines`,
          data.data.metadata?.totalTables && `${data.data.metadata.totalTables} tables`,
          data.data.metadata?.totalCheckboxes && `${data.data.metadata.totalCheckboxes} checkboxes`,
          data.data.metadata?.totalFigures && `${data.data.metadata.totalFigures} figures`
        ].filter(Boolean).join(', ');
        
        toast({
          title: "Azure Document Intelligence Complete!",
          description: `Successfully extracted: ${elementsFound || 'document content'}.`
        });
      } else {
        console.error('=== Unexpected response format ===', data);
        toast({
          title: "Processing Failed",
          description: "Unexpected response format from processing service",
          variant: "destructive"
        });
      }
      
    } catch (error) {
      console.error('=== Error in processWithAzure ===', error);
      toast({
        title: "Processing Error",
        description: `An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
              Azure Document Intelligence
            </h1>
            <p className="text-sm sm:text-lg text-gray-600 max-w-4xl mx-auto px-2">
              Extract <span className="font-semibold text-blue-600">Text</span>, 
              <span className="font-semibold text-green-600"> Tables</span>, 
              <span className="font-semibold text-purple-600"> Checkboxes</span>, and 
              <span className="font-semibold text-orange-600"> Figures</span> from your documents with 
              Azure's advanced OCR technology.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                {selectedModel === 'layout' ? 'Layout Analysis Model' : 'Text Reading Model'}
              </Badge>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                Multi-language Support
              </Badge>
            </div>
          </div>

          <MobileProcessingSteps currentStep={currentStep} />

          {/* Mobile-First Layout */}
          <div className="space-y-6">
            {/* Model Selection */}
            <div className="w-full">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                    <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span>Analysis Model</span>
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Choose <span className="font-medium">Layout Analysis</span> for comprehensive extraction of text, tables, checkboxes, and figures
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ReadLayoutModelSelector 
                    selectedModel={selectedModel} 
                    onModelChange={setSelectedModel} 
                  />
                </CardContent>
              </Card>
            </div>

            {/* Upload Card */}
            <div className="w-full">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                    <Upload className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span>Document Upload</span>
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Upload documents for comprehensive analysis of text, tables, checkboxes, and figures
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

                  {/* Process Button */}
                  {selectedFile && (
                    <div className="mt-4">
                      <Button 
                        onClick={processWithAzure} 
                        disabled={isProcessing} 
                        className="w-full h-12 text-base"
                        size="lg"
                      >
                        {isProcessing ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Extracting Text, Tables, Checkboxes & Figures...
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Extract Text, Tables, Checkboxes & Figures
                          </>
                        )}
                      </Button>
                      
                      {isProcessing && (
                        <div className="mt-4">
                          <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>Azure Document Intelligence analysis...</span>
                            <span>{progress}%</span>
                          </div>
                          <Progress value={progress} className="w-full" />
                          <p className="text-xs text-gray-500 mt-1">
                            {selectedModel === 'layout' 
                              ? 'Analyzing document structure: text, tables, checkboxes, and figures...'
                              : 'Extracting text with basic layout detection...'
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Document Viewer */}
            {previewUrl && (
              <div className="w-full">
                <EnhancedDocumentViewer 
                  previewUrl={previewUrl} 
                  selectedModel={selectedModel}
                  boundingBoxes={structuredData?.structuredData?.hierarchy?.pages?.[0]?.lines?.map((line: any) => ({
                    id: line.id.toString(),
                    text: line.text,
                    confidence: line.confidence,
                    polygon: line.polygon || [],
                    boundingBox: line.boundingBox,
                    type: 'line' as const,
                    isHandwritten: false
                  }))}
                  pageDimensions={structuredData?.structuredData?.hierarchy?.pages?.[0] ? {
                    width: structuredData.structuredData.hierarchy.pages[0].width,
                    height: structuredData.structuredData.hierarchy.pages[0].height,
                    unit: structuredData.structuredData.hierarchy.pages[0].unit
                  } : undefined}
                />
              </div>
            )}
          </div>

          {/* Results Section */}
          {(ocrResult || isProcessing) && (
            <Card className="mt-6 sm:mt-8">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                  <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span>Document Intelligence Results</span>
                </CardTitle>
                <CardDescription className="text-sm">
                  Extracted text, tables, checkboxes, and figures from Azure Document Intelligence
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isProcessing ? (
                  <div className="flex items-center justify-center h-32 sm:h-64">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                      <p className="text-gray-600 text-sm">Analyzing document structure...</p>
                    </div>
                  </div>
                ) : (
                  <Tabs value={activeResultsTab} onValueChange={setActiveResultsTab}>
                    <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
                      <TabsTrigger value="analytics" className="text-xs sm:text-sm p-2 sm:p-3">Analytics</TabsTrigger>
                      <TabsTrigger value="structured" className="text-xs sm:text-sm p-2 sm:p-3">Elements</TabsTrigger>
                      <TabsTrigger value="advanced" className="text-xs sm:text-sm p-2 sm:p-3 hidden sm:flex">Advanced</TabsTrigger>
                      <TabsTrigger value="raw" className="text-xs sm:text-sm p-2 sm:p-3">Raw</TabsTrigger>
                    </TabsList>

                    <TabsContent value="analytics" className="mt-4 sm:mt-6">
                      <AnalyticsDashboard 
                        selectedModel={selectedModel} 
                        processingTime={processingMetadata?.processingTime || '2.5 seconds'} 
                        overallConfidence={processingMetadata?.confidence || 98.3} 
                      />
                    </TabsContent>

                    <TabsContent value="structured" className="mt-4 sm:mt-6">
                      <StructuredDataViewer 
                        rawText={ocrResult} 
                        selectedModel={selectedModel} 
                        structuredData={structuredData}
                      />
                    </TabsContent>

                    <TabsContent value="advanced" className="mt-4 sm:mt-6">
                      <AdvancedResults rawText={ocrResult} isProcessing={isProcessing} selectedModel={selectedModel} />
                    </TabsContent>

                    <TabsContent value="raw" className="mt-4 sm:mt-6">
                      <Card>
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg">Raw OCR Output</CardTitle>
                          <CardDescription className="text-sm">Unprocessed text extraction results from Azure Intelligence</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <textarea 
                            value={ocrResult} 
                            className="w-full h-64 sm:h-96 bg-gray-50 border rounded-lg p-3 sm:p-4 resize-none focus:outline-none focus:ring-2 focus:ring-primary font-mono text-xs sm:text-sm" 
                            placeholder="Azure OCR results will appear here..." 
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
