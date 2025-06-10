
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, FileJson, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ConfidenceIndicator from "./ConfidenceIndicator";

interface AdvancedResultsProps {
  rawText: string;
  isProcessing: boolean;
  selectedModel: string;
}

const AdvancedResults = ({ rawText, isProcessing, selectedModel }: AdvancedResultsProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("raw");

  // Mock structured data based on the raw text
  const structuredData = {
    keyValuePairs: [
      { key: "Document Type", value: "Sample Document", confidence: 98 },
      { key: "Processing Model", value: selectedModel, confidence: 100 },
      { key: "Word Count", value: rawText.split(' ').length.toString(), confidence: 95 },
      { key: "Character Count", value: rawText.length.toString(), confidence: 99 }
    ],
    tables: [
      {
        headers: ["Metric", "Value", "Confidence"],
        rows: [
          ["Text Quality", "High", "97%"],
          ["Layout Detection", "Good", "92%"],
          ["Language Detection", "English", "99%"]
        ]
      }
    ],
    analytics: {
      overallConfidence: 97.5,
      processingTime: "2.3 seconds",
      modelAccuracy: selectedModel === "handwriting" ? 99.2 : selectedModel === "print" ? 99.8 : 98.5
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: `${type} copied to clipboard`,
      description: "Content has been copied to your clipboard.",
    });
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download started",
      description: `${filename} is being downloaded.`,
    });
  };

  const exportAsJSON = () => {
    const jsonData = {
      rawText,
      structuredData,
      metadata: {
        model: selectedModel,
        timestamp: new Date().toISOString(),
        confidence: structuredData.analytics.overallConfidence
      }
    };
    downloadFile(JSON.stringify(jsonData, null, 2), `ocr-result-${Date.now()}.json`, 'application/json');
  };

  const exportAsCSV = () => {
    const csvContent = [
      'Key,Value,Confidence',
      ...structuredData.keyValuePairs.map(item => 
        `"${item.key}","${item.value}",${item.confidence}`
      )
    ].join('\n');
    downloadFile(csvContent, `ocr-data-${Date.now()}.csv`, 'text/csv');
  };

  if (isProcessing) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-gray-600">Processing with {selectedModel} model...</p>
        </div>
      </div>
    );
  }

  if (!rawText) return null;

  return (
    <div className="space-y-4">
      {/* Overall Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Processing Analytics</CardTitle>
          <CardDescription>Overall confidence and processing metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ConfidenceIndicator 
              confidence={structuredData.analytics.overallConfidence} 
              label="Overall Confidence" 
            />
            <div className="space-y-2">
              <span className="text-sm font-medium">Processing Time</span>
              <div className="text-lg font-semibold text-primary">
                {structuredData.analytics.processingTime}
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-sm font-medium">Model Accuracy</span>
              <div className="text-lg font-semibold text-green-600">
                {structuredData.analytics.modelAccuracy}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Actions */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => copyToClipboard(rawText, "Raw text")}>
          <Copy className="h-4 w-4 mr-1" />
          Copy Text
        </Button>
        <Button variant="outline" size="sm" onClick={exportAsJSON}>
          <FileJson className="h-4 w-4 mr-1" />
          Export JSON
        </Button>
        <Button variant="outline" size="sm" onClick={exportAsCSV}>
          <FileSpreadsheet className="h-4 w-4 mr-1" />
          Export CSV
        </Button>
        <Button variant="outline" size="sm" onClick={() => downloadFile(rawText, `ocr-text-${Date.now()}.txt`, 'text/plain')}>
          <Download className="h-4 w-4 mr-1" />
          Download Text
        </Button>
      </div>

      {/* Results Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="raw">Raw Text</TabsTrigger>
          <TabsTrigger value="structured">Structured Data</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="formatted">Formatted View</TabsTrigger>
        </TabsList>

        <TabsContent value="raw" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Extracted Text</CardTitle>
              <CardDescription>Raw text extracted from your document</CardDescription>
            </CardHeader>
            <CardContent>
              <textarea
                value={rawText}
                className="w-full h-64 bg-gray-50 border rounded-lg p-4 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="OCR results will appear here..."
                readOnly
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="structured" className="mt-4">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Key-Value Pairs</CardTitle>
                <CardDescription>Structured information extracted from the document</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Key</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Confidence</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {structuredData.keyValuePairs.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.key}</TableCell>
                        <TableCell>{item.value}</TableCell>
                        <TableCell>
                          <Badge variant={item.confidence >= 95 ? "default" : "secondary"}>
                            {item.confidence}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Analysis</CardTitle>
              <CardDescription>Detailed analysis of the processed document</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Confidence</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {structuredData.tables[0].rows.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{row[0]}</TableCell>
                      <TableCell>{row[1]}</TableCell>
                      <TableCell>
                        <Badge variant="default">{row[2]}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="formatted" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Formatted Document</CardTitle>
              <CardDescription>Formatted view of the extracted content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-white border rounded-lg p-6 min-h-64">
                <div className="prose max-w-none">
                  {rawText.split('\n').map((line, index) => (
                    <p key={index} className="mb-2">
                      {line || <br />}
                    </p>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedResults;
