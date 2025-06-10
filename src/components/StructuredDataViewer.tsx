
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Download, FileJson } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ConfidenceIndicator from "./ConfidenceIndicator";

interface StructuredDataViewerProps {
  rawText: string;
  selectedModel: string;
  azureResult?: any;
}

const StructuredDataViewer = ({ rawText, selectedModel, azureResult }: StructuredDataViewerProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("hierarchy");

  // Process Azure results or use fallback data
  const getStructuredData = () => {
    if (azureResult) {
      return {
        hierarchy: {
          pages: azureResult.pages?.map((page: any, index: number) => ({
            pageNumber: index + 1,
            lines: page.lines?.map((line: any, lineIndex: number) => ({
              id: lineIndex + 1,
              text: line.content || '',
              confidence: (line.confidence || 0) * 100,
              boundingBox: line.polygon?.[0] ? {
                x: Math.round(line.polygon[0].x || 0),
                y: Math.round(line.polygon[0].y || 0),
                width: Math.round((line.polygon[2]?.x || 0) - (line.polygon[0]?.x || 0)),
                height: Math.round((line.polygon[2]?.y || 0) - (line.polygon[0]?.y || 0))
              } : { x: 0, y: 0, width: 0, height: 0 },
              words: line.words?.map((word: any) => ({
                text: word.content || '',
                confidence: (word.confidence || 0) * 100,
                boundingBox: word.polygon?.[0] ? {
                  x: Math.round(word.polygon[0].x || 0),
                  y: Math.round(word.polygon[0].y || 0),
                  width: Math.round((word.polygon[2]?.x || 0) - (word.polygon[0]?.x || 0)),
                  height: Math.round((word.polygon[2]?.y || 0) - (word.polygon[0]?.y || 0))
                } : { x: 0, y: 0, width: 0, height: 0 }
              })) || []
            })) || []
          })) || []
        },
        tables: azureResult.tables?.map((table: any, tableIndex: number) => ({
          id: tableIndex + 1,
          confidence: (table.confidence || 0) * 100,
          boundingBox: table.boundingRegions?.[0]?.polygon?.[0] ? {
            x: Math.round(table.boundingRegions[0].polygon[0].x || 0),
            y: Math.round(table.boundingRegions[0].polygon[0].y || 0),
            width: Math.round((table.boundingRegions[0].polygon[2]?.x || 0) - (table.boundingRegions[0].polygon[0]?.x || 0)),
            height: Math.round((table.boundingRegions[0].polygon[2]?.y || 0) - (table.boundingRegions[0].polygon[0]?.y || 0))
          } : { x: 0, y: 0, width: 0, height: 0 },
          rows: [] // We'll need to process table cells to create rows
        })) || [],
        keyValuePairs: azureResult.keyValuePairs?.map((kvp: any) => ({
          key: kvp.key?.content || 'Unknown',
          value: kvp.value?.content || '',
          confidence: Math.round((kvp.confidence || 0) * 100)
        })) || azureResult.documents?.[0]?.fields ? Object.entries(azureResult.documents[0].fields).map(([key, field]: [string, any]) => ({
          key: key.replace(/([A-Z])/g, ' $1').replace(/^./, (str: string) => str.toUpperCase()),
          value: field.content || field.valueString || field.valueNumber?.toString() || field.valueDate || 'N/A',
          confidence: Math.round((field.confidence || 0) * 100)
        })) : [
          { key: "Document Type", value: selectedModel, confidence: 100 },
          { key: "Total Words", value: rawText.split(' ').length.toString(), confidence: 95 },
          { key: "Total Characters", value: rawText.length.toString(), confidence: 99 }
        ]
      };
    }

    // Fallback data for when Azure results are not available
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
            { cells: ["Widget A", "2", "$10.00", "$20.00"], isHeader: false, confidence: 95.2 }
          ]
        }
      ] : [],
      keyValuePairs: [
        { key: "Document Type", value: selectedModel, confidence: 100 },
        { key: "Total Words", value: rawText.split(' ').length.toString(), confidence: 95 },
        { key: "Total Characters", value: rawText.length.toString(), confidence: 99 }
      ]
    };

    return baseData;
  };

  const structuredData = getStructuredData();

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
      azureResult,
      metadata: {
        model: selectedModel,
        timestamp: new Date().toISOString(),
        version: "3.0-azure"
      }
    };
    
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `azure-document-intelligence-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download started",
      description: "Azure Document Intelligence JSON file is being downloaded.",
    });
  };

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
              <CardDescription>Pages → Lines → Words structure with Azure confidence scores</CardDescription>
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
                                  Confidence: {Math.round(word.confidence)}%
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
              <CardDescription>Azure-extracted table data with cell-level confidence</CardDescription>
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
                      <p className="text-sm text-gray-600">Table extraction powered by Azure Document Intelligence</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Table className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No tables detected in this document</p>
                  <p className="text-sm">Azure will automatically detect tables when present</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keyvalue" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Key-Value Pairs</CardTitle>
              <CardDescription>Azure-extracted form fields and document metadata</CardDescription>
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
              <CardDescription>Precise positioning information from Azure Document Intelligence</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {structuredData.hierarchy.pages[0]?.lines.map((line) => (
                  <div key={line.id} className="bg-gray-50 rounded p-3">
                    <div className="font-medium mb-2">"{line.text}"</div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Position:</span>
                        <div>X: {line.boundingBox.x}px, Y: {line.boundingBox.y}px</div>
                        <div>Width: {line.boundingBox.width}px, Height: {line.boundingBox.height}px</div>
                      </div>
                      <div>
                        <span className="font-medium">Confidence:</span> {Math.round(line.confidence)}%
                      </div>
                    </div>
                  </div>
                )) || <p className="text-gray-500">No coordinate data available</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StructuredDataViewer;
