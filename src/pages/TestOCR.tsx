
import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Upload, File, Image, Play, Copy, Download, CheckCircle } from "lucide-react";
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";

const TestOCR = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = useCallback((file: File) => {
    console.log("File selected:", file);
    setSelectedFile(file);
    
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
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

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
    console.log("Starting OCR processing for:", selectedFile.name);
    
    // Simulate processing with progress
    const mockText = `SAMPLE OCR RESULT

This is a demonstration of our OCR technology processing your uploaded document: "${selectedFile.name}"

Key Features Detected:
• Document type: ${selectedFile.type.includes('image') ? 'Image Document' : 'Document File'}
• File size: ${(selectedFile.size / 1024).toFixed(1)} KB
• Processing time: ~2.3 seconds

Sample extracted text would appear here. Our advanced AI can recognize:
- Handwritten text with 99.2% accuracy
- Printed text with 99.8% accuracy  
- Multiple languages and fonts
- Tables, forms, and structured data
- Mathematical equations and symbols

This is a demo showing how your actual document text would be extracted and displayed in an editable format. The real OCR system would analyze the actual content of your uploaded file.

Confidence Score: 97.5%
Processing Status: Complete ✓`;

    // Simulate processing progress
    for (let i = 0; i <= 100; i += 10) {
      setProgress(i);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    setOcrResult(mockText);
    setIsProcessing(false);
    
    toast({
      title: "OCR Processing Complete!",
      description: "Your document has been successfully processed.",
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(ocrResult);
    toast({
      title: "Copied to clipboard",
      description: "OCR result has been copied to your clipboard.",
    });
  };

  const downloadResult = () => {
    const blob = new Blob([ocrResult], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ocr-result-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download started",
      description: "OCR result is being downloaded as a text file.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Test Our OCR System</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Upload any handwritten or printed document and watch our AI extract the text in real-time.
              Supports images, PDFs, and various document formats.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="h-6 w-6" />
                  <span>Upload Document</span>
                </CardTitle>
                <CardDescription>
                  Drag and drop a file or click to browse. Supports JPG, PNG, PDF, and more.
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
                    accept="image/*,.pdf,.doc,.docx"
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
                          {(selectedFile.size / 1024).toFixed(1)} KB • Ready for processing
                        </p>
                      </div>
                      <Badge variant="outline">File uploaded successfully</Badge>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                        <Upload className="h-8 w-8 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-gray-900">Drop your file here</p>
                        <p className="text-gray-500">or click to browse</p>
                      </div>
                      <Badge variant="secondary">Waiting for upload</Badge>
                    </div>
                  )}
                </div>

                {selectedFile && (
                  <div className="mt-6">
                    <Button 
                      onClick={simulateOCR} 
                      disabled={isProcessing}
                      className="w-full"
                      size="lg"
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Run OCR
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
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Preview Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Image className="h-6 w-6" />
                  <span>Document Preview</span>
                </CardTitle>
                <CardDescription>
                  Preview of your uploaded document before OCR processing
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

          {/* Results Section */}
          {(ocrResult || isProcessing) && (
            <Card className="mt-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>OCR Results</CardTitle>
                    <CardDescription>
                      Extracted text from your document with editing capabilities
                    </CardDescription>
                  </div>
                  {ocrResult && (
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={copyToClipboard}>
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                      <Button variant="outline" size="sm" onClick={downloadResult}>
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="text" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="text">Extracted Text</TabsTrigger>
                    <TabsTrigger value="formatted">Formatted View</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="text" className="mt-4">
                    <div className="bg-gray-50 rounded-lg p-4 min-h-64">
                      {isProcessing ? (
                        <div className="flex items-center justify-center h-32">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                            <p className="text-gray-600">Processing your document...</p>
                          </div>
                        </div>
                      ) : (
                        <textarea
                          value={ocrResult}
                          onChange={(e) => setOcrResult(e.target.value)}
                          className="w-full h-64 bg-transparent border-none resize-none focus:outline-none"
                          placeholder="OCR results will appear here..."
                        />
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="formatted" className="mt-4">
                    <div className="bg-white border rounded-lg p-6 min-h-64">
                      {isProcessing ? (
                        <div className="flex items-center justify-center h-32">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                            <p className="text-gray-600">Processing your document...</p>
                          </div>
                        </div>
                      ) : (
                        <div className="prose max-w-none">
                          {ocrResult.split('\n').map((line, index) => (
                            <p key={index} className="mb-2">
                              {line || <br />}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestOCR;
