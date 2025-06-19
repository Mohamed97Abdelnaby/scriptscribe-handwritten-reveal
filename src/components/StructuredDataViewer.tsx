
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Download, FileJson, CheckSquare, Image, FileText, Grid3X3 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import ConfidenceIndicator from "./ConfidenceIndicator";

interface StructuredDataViewerProps {
  rawText: string;
  selectedModel: string;
  structuredData?: any;
}

const StructuredDataViewer = ({ rawText, selectedModel, structuredData }: StructuredDataViewerProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("text");

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
    a.download = `document-analysis-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download started",
      description: "Document analysis JSON file is being downloaded.",
    });
  };

  // Extract focused elements from structured data
  const textElements = structuredData?.textElements || [];
  const tables = structuredData?.tables || [];
  const checkboxes = structuredData?.checkboxes || [];
  const figures = structuredData?.figures || [];
  const metadata = structuredData?.metadata || {};

  return (
    <div className="space-y-4">
      {/* Export Actions */}
      <div className="flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => copyToClipboard(rawText, "Text content")}
        >
          <Copy className="h-4 w-4 mr-1" />
          Copy Text
        </Button>
        <Button variant="outline" size="sm" onClick={downloadJSON}>
          <FileJson className="h-4 w-4 mr-1" />
          Download JSON
        </Button>
        <Badge variant="default" className="bg-blue-100 text-blue-800">
          {metadata.modelUsed || selectedModel} Analysis
        </Badge>
      </div>

      {/* Statistics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-sm font-medium text-blue-800">Text Lines</div>
          <div className="text-lg font-bold text-blue-600">{metadata.totalTextLines || 0}</div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="text-sm font-medium text-green-800">Tables</div>
          <div className="text-lg font-bold text-green-600">{metadata.totalTables || 0}</div>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg">
          <div className="text-sm font-medium text-purple-800">Checkboxes</div>
          <div className="text-lg font-bold text-purple-600">{metadata.totalCheckboxes || 0}</div>
        </div>
        <div className="bg-orange-50 p-3 rounded-lg">
          <div className="text-sm font-medium text-orange-800">Figures</div>
          <div className="text-lg font-bold text-orange-600">{metadata.totalFigures || 0}</div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="text" className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            Text ({metadata.totalTextLines || 0})
          </TabsTrigger>
          <TabsTrigger value="tables" className="flex items-center gap-1">
            <Grid3X3 className="h-4 w-4" />
            Tables ({metadata.totalTables || 0})
          </TabsTrigger>
          <TabsTrigger value="checkboxes" className="flex items-center gap-1">
            <CheckSquare className="h-4 w-4" />
            Checkboxes ({metadata.totalCheckboxes || 0})
          </TabsTrigger>
          <TabsTrigger value="figures" className="flex items-center gap-1">
            <Image className="h-4 w-4" />
            Figures ({metadata.totalFigures || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Extracted Text Elements
              </CardTitle>
              <CardDescription>
                All text content extracted from the document with confidence scores
              </CardDescription>
            </CardHeader>
            <CardContent>
              {textElements.length > 0 ? (
                <div className="space-y-3">
                  <div className="p-4 bg-gray-50 rounded border max-h-96 overflow-y-auto">
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {rawText}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Text Elements Details:</h4>
                    {textElements.slice(0, 10).map((element: any, index: number) => (
                      <div key={index} className="bg-white p-3 rounded border">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Line {index + 1}</span>
                          <ConfidenceIndicator confidence={element.confidence * 100} label="" />
                        </div>
                        <p className="text-sm text-gray-700">"{element.content}"</p>
                      </div>
                    ))}
                    {textElements.length > 10 && (
                      <p className="text-sm text-gray-500">
                        ... and {textElements.length - 10} more text elements
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No text elements extracted</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tables" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Grid3X3 className="h-5 w-5" />
                Extracted Tables
              </CardTitle>
              <CardDescription>
                Structured table data with cell-level content and positions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tables.length > 0 ? (
                <div className="space-y-6">
                  {tables.map((table: any, tableIndex: number) => (
                    <div key={tableIndex} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold">Table {tableIndex + 1}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{table.rowCount} rows</Badge>
                          <Badge variant="outline">{table.columnCount} cols</Badge>
                          <ConfidenceIndicator confidence={table.confidence * 100} label="Confidence" />
                        </div>
                      </div>
                      
                      {table.cells && table.cells.length > 0 ? (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                {Array.from({ length: table.columnCount }, (_, colIndex) => (
                                  <TableHead key={colIndex}>Column {colIndex + 1}</TableHead>
                                ))}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {Array.from({ length: table.rowCount }, (_, rowIndex) => (
                                <TableRow key={rowIndex}>
                                  {Array.from({ length: table.columnCount }, (_, colIndex) => {
                                    const cell = table.cells.find(
                                      (c: any) => c.rowIndex === rowIndex && c.columnIndex === colIndex
                                    );
                                    return (
                                      <TableCell key={colIndex} className="relative">
                                        {cell ? cell.content : ''}
                                        {cell && (
                                          <Badge 
                                            variant="outline" 
                                            className="absolute top-1 right-1 text-xs"
                                          >
                                            {Math.round(cell.confidence * 100)}%
                                          </Badge>
                                        )}
                                      </TableCell>
                                    );
                                  })}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No cell data available for this table</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Grid3X3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No tables detected in this document</p>
                  <p className="text-sm">Tables will be automatically detected when present</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checkboxes" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5" />
                Selection Marks & Checkboxes
              </CardTitle>
              <CardDescription>
                Detected checkboxes and selection marks with their states
              </CardDescription>
            </CardHeader>
            <CardContent>
              {checkboxes.length > 0 ? (
                <div className="space-y-3">
                  {checkboxes.map((checkbox: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                      <div className="flex items-center gap-3">
                        <Checkbox 
                          checked={checkbox.state === 'selected'} 
                          disabled 
                          className="pointer-events-none"
                        />
                        <div>
                          <span className="font-medium">Checkbox {index + 1}</span>
                          <div className="text-sm text-gray-600">
                            State: <Badge variant={checkbox.state === 'selected' ? 'default' : 'outline'}>
                              {checkbox.state}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <ConfidenceIndicator confidence={checkbox.confidence * 100} label="Confidence" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CheckSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No checkboxes detected in this document</p>
                  <p className="text-sm">Checkboxes and selection marks will be automatically detected</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="figures" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Figures & Images
              </CardTitle>
              <CardDescription>
                Detected figures, images, and diagrams with captions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {figures.length > 0 ? (
                <div className="space-y-4">
                  {figures.map((figure: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">Figure {index + 1}</h4>
                        <ConfidenceIndicator confidence={figure.confidence * 100} label="Confidence" />
                      </div>
                      
                      {figure.caption && (
                        <div className="mb-3">
                          <span className="text-sm font-medium text-gray-600">Caption:</span>
                          <p className="text-sm text-gray-700 mt-1">"{figure.caption}"</p>
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-500">
                        Elements: {figure.elements?.length || 0} | 
                        Regions: {figure.boundingRegions?.length || 0}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Image className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No figures detected in this document</p>
                  <p className="text-sm">Images and diagrams will be automatically detected</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StructuredDataViewer;
