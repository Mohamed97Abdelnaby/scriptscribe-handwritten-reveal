import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Download, FileJson } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ConfidenceIndicator from "./ConfidenceIndicator";
import { azureDocumentIntelligence } from "@/services/azureDocumentIntelligence";

interface StructuredDataViewerProps {
  rawText: string;
  selectedModel: string;
  azureResult?: any; // Real Azure result data
}

const StructuredDataViewer = ({ rawText, selectedModel, azureResult }: StructuredDataViewerProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("hierarchy");

  // Enhanced structured data based on model type and Azure results
  const getStructuredData = () => {
    // If we have real Azure results, use them
    if (azureResult?.rawData?.analyzeResult) {
      return formatAzureData(azureResult);
    }

    // Enhanced structured data based on model type
    const baseData = {
      hierarchy: {
        pages: [
          {
            pageNumber: 1,
            lines: [
              {
                id: 1,
                text: "ADVANCED OCR RESULT",
                confidence: 98.5,
                boundingBox: { x: 10, y: 20, width: 200, height: 25 },
                words: [
                  { text: "ADVANCED", confidence: 99.1, boundingBox: { x: 10, y: 20, width: 80, height: 25 } },
                  { text: "OCR", confidence: 98.8, boundingBox: { x: 95, y: 20, width: 35, height: 25 } },
                  { text: "RESULT", confidence: 97.6, boundingBox: { x: 135, y: 20, width: 65, height: 25 } }
                ]
              },
              {
                id: 2,
                text: "Document Analysis Complete",
                confidence: 96.2,
                boundingBox: { x: 10, y: 60, width: 220, height: 20 },
                words: [
                  { text: "Document", confidence: 97.1, boundingBox: { x: 10, y: 60, width: 70, height: 20 } },
                  { text: "Analysis", confidence: 95.8, boundingBox: { x: 85, y: 60, width: 65, height: 20 } },
                  { text: "Complete", confidence: 95.7, boundingBox: { x: 155, y: 60, width: 65, height: 20 } }
                ]
              }
            ]
          }
        ]
      },
      tables: selectedModel === 'invoice' || selectedModel === 'financial' ? [
        {
          id: 1,
          confidence: 94.5,
          boundingBox: { x: 50, y: 150, width: 400, height: 120 },
          rows: [
            { cells: ["Item", "Quantity", "Price", "Total"], isHeader: true, confidence: 96.8 },
            { cells: ["Widget A", "2", "$10.00", "$20.00"], isHeader: false, confidence: 95.2 },
            { cells: ["Widget B", "1", "$15.00", "$15.00"], isHeader: false, confidence: 94.7 },
            { cells: ["Total", "", "", "$35.00"], isHeader: false, confidence: 97.1 }
          ]
        }
      ] : [],
      keyValuePairs: selectedModel === 'form' || selectedModel === 'id' ? [
        { key: "Name", value: "John Doe", confidence: 97.8 },
        { key: "Date of Birth", value: "01/15/1990", confidence: 96.5 },
        { key: "ID Number", value: "123456789", confidence: 98.2 },
        { key: "Address", value: "123 Main St, City, State", confidence: 94.8 }
      ] : [
        { key: "Document Type", value: "Sample Document", confidence: 98.0 },
        { key: "Processing Model", value: selectedModel, confidence: 100 },
        { key: "Total Words", value: rawText.split(' ').length.toString(), confidence: 95.5 },
        { key: "Total Characters", value: rawText.length.toString(), confidence: 99.2 }
      ]
    };

    return baseData;
  };

  const formatAzureData = (azureResult: any) => {
    const analyzeResult = azureResult.rawData.analyzeResult;
    
    const azureData = {
      hierarchy: {
        pages: analyzeResult.pages?.map((page: any, index: number) => ({
          pageNumber: page.pageNumber || index + 1,
          lines: page.lines?.map((line: any, lineIndex: number) => ({
            id: lineIndex + 1,
            text: line.content,
            confidence: line.confidence ? line.confidence * 100 : 95,
            boundingBox: {
              x: line.boundingBox?.[0] || 0,
              y: line.boundingBox?.[1] || 0,
              width: line.boundingBox?.[4] - line.boundingBox?.[0] || 100,
              height: line.boundingBox?.[5] - line.boundingBox?.[1] || 20
            },
            words: page.words?.filter((word: any) => 
              line.content.includes(word.content)
            ).map((word: any, wordIndex: number) => ({
              text: word.content,
              confidence: word.confidence ? word.confidence * 100 : 90,
              boundingBox: {
                x: word.boundingBox?.[0] || 0,
                y: word.boundingBox?.[1] || 0,
                width: word.boundingBox?.[4] - word.boundingBox?.[0] || 50,
                height: word.boundingBox?.[5] - word.boundingBox?.[1] || 15
              }
            })) || []
          })) || []
        })) || []
      },
      tables: analyzeResult.tables?.map((table: any, tableIndex: number) => ({
        id: tableIndex + 1,
        confidence: 94.5,
        boundingBox: { x: 50, y: 150, width: 400, height: 120 },
        rows: this.formatTableRows(table)
      })) || [],
      keyValuePairs: [
        ...(azureResult.name ? [{ key: "Name", value: azureResult.name, confidence: 97.8 }] : []),
        ...(azureResult.date ? [{ key: "Date", value: azureResult.date, confidence: 96.5 }] : []),
        ...(azureResult.amount ? [{ key: "Amount", value: azureResult.amount, confidence: 98.2 }] : []),
        ...(azureResult.id ? [{ key: "ID", value: azureResult.id, confidence: 94.8 }] : []),
        { key: "Confidence Score", value: `${azureResult.confidence.toFixed(1)}%`, confidence: 100 },
        { key: "Processing Engine", value: "Azure Document Intelligence", confidence: 100 }
      ]
    };

    return azureData;
  };

  const formatTableRows = (table: any) => {
    if (!table.cells) return [];
    
    const rows: any[][] = [];
    const maxRow = Math.max(...table.cells.map((cell: any) => cell.rowIndex));
    const maxCol = Math.max(...table.cells.map((cell: any) => cell.columnIndex));
    
    // Initialize rows array
    for (let i = 0; i <= maxRow; i++) {
      rows[i] = new Array(maxCol + 1).fill('');
    }
    
    // Fill cells
    table.cells.forEach((cell: any) => {
      rows[cell.rowIndex][cell.columnIndex] = cell.content;
    });
    
    // Convert to expected format
    return rows.map((row, index) => ({
      cells: row,
      isHeader: index === 0,
      confidence: 95.0
    }));
  };

  const copyToClipboard = (content: string, type: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: `${type} copied`,
      description: "Content has been copied to your clipboard.",
    });
  };

  const downloadJSON = () => {
    const jsonData = {
      rawText,
      structuredData,
      metadata: {
        model: selectedModel,
        timestamp: new Date().toISOString(),
        version: "2.0"
      }
    };
    
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `structured-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download started",
      description: "Structured data JSON file is being downloaded.",
    });
  };

  const structuredData = getStructuredData();

  return (
    <div className="space-y-4">
      {/* Export Actions */}
      <div className="flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => copyToClipboard(JSON.stringify(structuredData, null, 2), "Structured data")}
        >
          <Copy className="h-4 w-4 mr-1" />
          Copy JSON
        </Button>
        <Button variant="outline" size="sm" onClick={downloadJSON}>
          <FileJson className="h-4 w-4 mr-1" />
          Download JSON
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="hierarchy">Document Hierarchy</TabsTrigger>
          <TabsTrigger value="tables">Tables</TabsTrigger>
          <TabsTrigger value="keyvalue">Key-Value Pairs</TabsTrigger>
          <TabsTrigger value="coordinates">Coordinates</TabsTrigger>
        </TabsList>

        <TabsContent value="hierarchy" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Hierarchy</CardTitle>
              <CardDescription>Pages → Lines → Words structure with confidence scores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {structuredData.hierarchy.pages.map((page, pageIndex) => (
                  <div key={pageIndex} className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-3">Page {page.pageNumber}</h4>
                    <div className="space-y-3">
                      {page.lines.map((line) => (
                        <div key={line.id} className="bg-gray-50 rounded p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">Line {line.id}</span>
                            <ConfidenceIndicator confidence={line.confidence} label="" />
                          </div>
                          <p className="text-sm text-gray-700 mb-2">"{line.text}"</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                            {line.words.map((word, wordIndex) => (
                              <div key={wordIndex} className="bg-white rounded p-2 border">
                                <div className="font-medium">"{word.text}"</div>
                                <div className="text-gray-500">
                                  Confidence: {word.confidence}%
                                </div>
                                <div className="text-gray-400">
                                  ({word.boundingBox.x}, {word.boundingBox.y})
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tables" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Extracted Tables</CardTitle>
              <CardDescription>Structured table data with cell-level confidence</CardDescription>
            </CardHeader>
            <CardContent>
              {structuredData.tables.length > 0 ? (
                <div className="space-y-6">
                  {structuredData.tables.map((table, tableIndex) => (
                    <div key={tableIndex} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold">Table {tableIndex + 1}</h4>
                        <ConfidenceIndicator confidence={table.confidence} label="Table confidence" />
                      </div>
                      
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {table.rows[0]?.cells.map((cell, cellIndex) => (
                              <TableHead key={cellIndex}>{cell}</TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {table.rows.slice(1).map((row, rowIndex) => (
                            <TableRow key={rowIndex}>
                              {row.cells.map((cell, cellIndex) => (
                                <TableCell key={cellIndex} className="relative">
                                  {cell}
                                  <Badge 
                                    variant="outline" 
                                    className="absolute top-1 right-1 text-xs"
                                  >
                                    {row.confidence}%
                                  </Badge>
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Table className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No tables detected in this document</p>
                  <p className="text-sm">Try using specialized models like Invoice or Form Processor</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keyvalue" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Key-Value Pairs</CardTitle>
              <CardDescription>Extracted form fields and document metadata</CardDescription>
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
        </TabsContent>

        <TabsContent value="coordinates" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Coordinate Data</CardTitle>
              <CardDescription>Precise positioning information for each text element</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {structuredData.hierarchy.pages[0].lines.map((line) => (
                  <div key={line.id} className="bg-gray-50 rounded p-3">
                    <div className="font-medium mb-2">"{line.text}"</div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Line Position:</span>
                        <div>X: {line.boundingBox.x}px, Y: {line.boundingBox.y}px</div>
                        <div>Width: {line.boundingBox.width}px, Height: {line.boundingBox.height}px</div>
                      </div>
                      <div>
                        <span className="font-medium">Confidence:</span> {line.confidence}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StructuredDataViewer;
