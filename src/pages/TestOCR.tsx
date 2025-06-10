
import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Upload, File, Image, Play, CheckCircle } from "lucide-react";
import Header from "@/components/Header";
import ModelSelector from "@/components/ModelSelector";
import ProcessingSteps from "@/components/ProcessingSteps";
import AdvancedResults from "@/components/AdvancedResults";
import { useToast } from "@/hooks/use-toast";

const TestOCR = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>("mixed");
  const [currentStep, setCurrentStep] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = useCallback((file: File) => {
    console.log("File selected:", file);
    setSelectedFile(file);
    setCurrentStep(2);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setOcrResult("");
    setProgress(0);
    
    toast({
      title: "File uploaded successfully",
      description: `${file.name} is ready for OCR processing.`,
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
          variant: "destructive",
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
    
    // Enhanced mock text based on selected model
    const getModelSpecificText = () => {
      const baseText = `ADVANCED OCR RESULT - ${selectedModel.toUpperCase()} MODEL

Document Analysis Complete for: "${selectedFile.name}"

Model Configuration:
• Processing Model: ${selectedModel === 'handwriting' ? 'Handwriting Focus (v2.1)' : selectedModel === 'print' ? 'Print Document Reader (v3.0)' : 'Mixed Document Processor (v2.5)'}
• File Type: ${selectedFile.type.includes('image') ? 'Image Document' : 'Document File'}
• File Size: ${(selectedFile.size / 1024).toFixed(1)} KB
• Processing Time: ~${selectedModel === 'handwriting' ? '3.2' : selectedModel === 'print' ? '1.8' : '2.5'} seconds

EXTRACTED CONTENT:
This is a demonstration of our advanced OCR technology processing your uploaded document with the ${selectedModel} model. 

Key Detection Features:
- Text Recognition: ${selectedModel === 'handwriting' ? '99.2% accuracy for handwritten content' : selectedModel === 'print' ? '99.8% accuracy for printed text' : '98.9% accuracy for mixed content'}
- Layout Analysis: Advanced structure detection
- Language Support: Multi-language recognition
- Table Extraction: Structured data preservation
- Form Processing: Key-value pair identification

Sample Document Content:
The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet and is commonly used for testing typography and OCR systems.

INVOICE #INV-2024-001
Date: June 10, 2025
Customer: John Doe
Amount: $1,234.56

Technical Specifications:
- Resolution: High-DPI processing
- Color Mode: ${selectedFile.type.includes('image') ? 'RGB/Grayscale adaptive' : 'Document optimized'}
- Noise Reduction: Applied
- Skew Correction: Automatic

Processing Statistics:
• Characters Detected: 1,247
• Words Identified: 234
• Lines Processed: 18
• Confidence Score: ${selectedModel === 'handwriting' ? '97.2%' : selectedModel === 'print' ? '99.1%' : '98.3%'}
• Processing Status: Complete ✓

This demonstration shows how your actual document content would be extracted and formatted for further processing or analysis.`;

      return baseText;
    };

    // Simulate processing progress with more realistic timing
    const progressSteps = [0, 15, 35, 55, 75, 90, 100];
    for (const step of progressSteps) {
      setProgress(step);
      await new Promise(resolve => setTimeout(resolve, selectedModel === 'print' ? 150 : 250));
    }
    
    setOcrResult(getModelSpecificText());
    setIsProcessing(false);
    setCurrentStep(4);
    
    toast({
      title: "OCR Processing Complete!",
      description: `Document processed successfully with ${selectedModel} model.`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Advanced OCR Testing Platform</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Experience our Azure-inspired document intelligence system. Upload documents, select processing models, 
              and extract text with industry-leading accuracy and detailed analytics.
            </p>
          </div>

          {/* Processing Steps */}
          <ProcessingSteps currentStep={currentStep} />

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Upload & Configuration Section */}
            <div className="space-y-6">
              {/* Upload Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Upload className="h-6 w-6" />
                    <span>Document Upload</span>
                  </CardTitle>
                  <CardDescription>
                    Upload images (JPG, PNG) or PDF documents for OCR processing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className={`upload-area p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-all ${
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
                      <div className="space-y-4">
                        <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{selectedFile.name}</p>
                          <p className="text-sm text-gray-500">
                            {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type}
                          </p>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700">File ready</Badge>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                          <Upload className="h-8 w-8 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-gray-900">Drop your document here</p>
                          <p className="text-gray-500">or click to browse files</p>
                          <p className="text-xs text-gray-400 mt-2">Supports JPG, PNG, PDF up to 10MB</p>
                        </div>
                        <Badge variant="secondary">Ready for upload</Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Model Configuration */}
              {selectedFile && (
                <Card>
                  <CardHeader>
                    <CardTitle>Processing Configuration</CardTitle>
                    <CardDescription>Select the optimal model for your document type</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ModelSelector 
                      selectedModel={selectedModel} 
                      onModelChange={(model) => {
                        setSelectedModel(model);
                        setCurrentStep(3);
                      }} 
                    />
                    
                    <Button 
                      onClick={simulateOCR} 
                      disabled={isProcessing}
                      className="w-full"
                      size="lg"
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing with {selectedModel} model...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Start OCR Processing
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
                        <p className="text-xs text-gray-500 mt-1">
                          Estimated time: ~{selectedModel === 'print' ? '2' : '3'} seconds
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Preview Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Image className="h-6 w-6" />
                  <span>Document Preview</span>
                </CardTitle>
                <CardDescription>
                  Preview of your uploaded document
                </CardDescription>
              </CardHeader>
              <CardContent>
                {previewUrl ? (
                  <div className="bg-gray-100 rounded-lg p-4 min-h-64 flex items-center justify-center">
                    <img 
                      src={previewUrl} 
                      alt="Document preview" 
                      className="max-w-full max-h-64 object-contain rounded shadow-sm"
                    />
                  </div>
                ) : (
                  <div className="bg-gray-100 rounded-lg p-8 min-h-64 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <File className="h-12 w-12 mx-auto mb-2" />
                      <p>Upload a document to see preview</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Advanced Results Section */}
          {(ocrResult || isProcessing) && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>OCR Results & Analytics</CardTitle>
                <CardDescription>
                  Comprehensive analysis and extracted content from your document
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdvancedResults 
                  rawText={ocrResult}
                  isProcessing={isProcessing}
                  selectedModel={selectedModel}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestOCR;
