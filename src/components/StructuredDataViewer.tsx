import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Download, FileJson, PenTool, Type } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ConfidenceIndicator from "./ConfidenceIndicator";

interface StructuredDataViewerProps {
  rawText: string;
  selectedModel: string;
  structuredData?: any;
}

const StructuredDataViewer = ({ rawText, selectedModel, structuredData }: StructuredDataViewerProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("hierarchy");

  // Enhanced data processing for read models
  const getStructuredData = () => {
    if (structuredData) {
      return structuredData;
    }

    // Enhanced fallback demo data
    const enhancedData = {
      hierarchy: {
        pages: [
          {
            pageNumber: 1,
            width: 612,
            height: 792,
            unit: "pixel",
            lines: [
              {
                id: 1,
                text: "ENHANCED OCR RESULT",
                confidence: 98.5,
                polygon: [10, 20, 200, 20, 200, 45, 10, 45],
                boundingBox: { x: 10, y: 20, width: 190, height: 25 },
                words: [
                  { 
                    text: "ENHANCED", 
                    confidence: 99.1, 
                    polygon: [10, 20, 80, 20, 80, 45, 10, 45],
                    boundingBox: { x: 10, y: 20, width: 70, height: 25 } 
                  },
                  { 
                    text: "OCR", 
                    confidence: 98.8, 
                    polygon: [85, 20, 120, 20, 120, 45, 85, 45],
                    boundingBox: { x: 85, y: 20, width: 35, height: 25 } 
                  },
                  { 
                    text: "RESULT", 
                    confidence: 97.6, 
                    polygon: [125, 20, 200, 20, 200, 45, 125, 45],
                    boundingBox: { x: 125, y: 20, width: 75, height: 25 } 
                  }
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
          polygon: [50, 150, 450, 150, 450, 270, 50, 270],
          boundingBox: { x: 50, y: 150, width: 400, height: 120 },
          rows: [
            { cells: ["Item", "Quantity", "Price", "Total"], isHeader: true, confidence: 96.8 },
            { cells: ["Enhanced Demo Item", "1", "$10.00", "$10.00"], isHeader: false, confidence: 95.2 }
          ]
        }
      ] : [],
      keyValuePairs: [
        { key: "Document Type", value: "Enhanced Read Analysis", confidence: 98.0 },
        { key: "Processing Model", value: selectedModel, confidence: 100 },
        { key: "Handwriting Detection", value: "Advanced", confidence: 97.5 },
        { key: "Polygon Support", value: "Enabled", confidence: 100 }
      ],
      handwritingAnalysis: [
        {
          id: 1,
          isHandwritten: false,
          confidence: 98,
          spans: []
        }
      ],
      enhancedFeatures: {
        totalPages: 1,
        handwritingPercentage: 15,
        avgConfidence: 97.8,
        pageDimensions: [{ page: 1, width: 612, height: 792, unit: "pixel" }]
      }
    };

    return enhancedData;
  };

  const displayData = getStructuredData();

  // Create cleaned paragraph content
  const paragraphContent = rawText.replace(/\n/g, " ").replace(/\r/g, " ").trim();

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
      structuredData: displayData,
      metadata: {
        model: selectedModel,
        timestamp: new Date().toISOString(),
        version: "2.0",
        source: structuredData ? "Azure Document Intelligence" : "Demo Data"
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

  return (
    <div className="space-y-4">
      {/* Enhanced Export Actions */}
      <div className="flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => copyToClipboard(JSON.stringify(displayData, null, 2), "Structured data")}
        >
          <Copy className="h-4 w-4 mr-1" />
          Copy JSON
        </Button>
        <Button variant="outline" size="sm" onClick={downloadJSON}>
          <FileJson className="h-4 w-4 mr-1" />
          Download JSON
        </Button>
        {paragraphContent && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => copyToClipboard(paragraphContent, "Paragraph content")}
          >
            <Copy className="h-4 w-4 mr-1" />
            Copy Paragraph
          </Button>
        )}
        {structuredData?.enhancedFeatures && (
          <Badge variant="default" className="bg-purple-100 text-purple-800">
            Enhanced Read Data
          </Badge>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="hierarchy">Hierarchy</TabsTrigger>
          <TabsTrigger value="paragraph">Paragraph</TabsTrigger>
          <TabsTrigger value="handwriting">Handwriting</TabsTrigger>
          <TabsTrigger value="tables">Tables</TabsTrigger>
          <TabsTrigger value="keyvalue">Key-Value</TabsTrigger>
          <TabsTrigger value="coordinates">Coordinates</TabsTrigger>
        </TabsList>

        <TabsContent value="paragraph" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Content as Paragraph</CardTitle>
              <CardDescription>
                Complete document text presented as a single paragraph with line breaks removed
                {structuredData && " (from Azure Document Intelligence)"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {paragraphContent ? (
                <div className="p-4 bg-gray-50 rounded border">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {paragraphContent}
                  </p>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No content available</p>
                  <p className="text-sm">Process a document to see the paragraph view</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="handwriting" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Handwriting Analysis</CardTitle>
              <CardDescription>
                Advanced handwriting detection and style analysis
                {structuredData && " (from Enhanced Azure Document Intelligence)"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {displayData.handwritingAnalysis?.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <div className="text-sm font-medium text-purple-800">Handwriting Detected</div>
                      <div className="text-lg font-bold text-purple-600">
                        {displayData.enhancedFeatures?.handwritingPercentage || 0}%
                      </div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-sm font-medium text-blue-800">Print Text</div>
                      <div className="text-lg font-bold text-blue-600">
                        {100 - (displayData.enhancedFeatures?.handwritingPercentage || 0)}%
                      </div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="text-sm font-medium text-green-800">Avg Confidence</div>
                      <div className="text-lg font-bold text-green-600">
                        {displayData.enhancedFeatures?.avgConfidence || 0}%
                      </div>
                    </div>
                  </div>
                  
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Style ID</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Confidence</TableHead>
                        <TableHead>Spans</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {displayData.handwritingAnalysis.map((style, index) => (
                        <TableRow key={index}>
                          <TableCell>{style.id}</TableCell>
                          <TableCell>
                            <Badge variant={style.isHandwritten ? "secondary" : "outline"} className={
                              style.isHandwritten ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                            }>
                              {style.isHandwritten ? (
                                <>
                                  <PenTool className="h-3 w-3 mr-1" />
                                  Handwritten
                                </>
                              ) : (
                                <>
                                  <Type className="h-3 w-3 mr-1" />
                                  Printed
                                </>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={style.confidence >= 95 ? "default" : "secondary"}>
                              {style.confidence}%
                            </Badge>
                          </TableCell>
                          <TableCell>{style.spans?.length || 0} spans</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <PenTool className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No handwriting analysis available</p>
                  <p className="text-sm">Use enhanced read models for handwriting detection</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hierarchy" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Hierarchy</CardTitle>
              <CardDescription>
                Pages → Lines → Words structure with confidence scores
                {structuredData && " (from Azure Document Intelligence)"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {displayData.hierarchy.pages.map((page, pageIndex) => (
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
              <CardDescription>
                Structured table data with cell-level confidence
                {structuredData && " (from Azure Document Intelligence)"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {displayData.tables.length > 0 ? (
                <div className="space-y-6">
                  {displayData.tables.map((table, tableIndex) => (
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
              <CardDescription>
                Extracted form fields and document metadata
                {structuredData && " (from Azure Document Intelligence)"}
              </CardDescription>
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
                  {displayData.keyValuePairs.map((item, index) => (
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
              <CardTitle>Enhanced Coordinate Data</CardTitle>
              <CardDescription>
                Precise polygon positioning and page dimensions
                {structuredData && " (from Enhanced Azure Document Intelligence)"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Page Dimensions */}
              {displayData.enhancedFeatures?.pageDimensions && (
                <div className="mb-4 p-3 bg-gray-50 rounded">
                  <h4 className="font-medium mb-2">Page Dimensions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                    {displayData.enhancedFeatures.pageDimensions.map((page, index) => (
                      <div key={index} className="bg-white p-2 rounded border">
                        <div>Page {page.page}</div>
                        <div className="text-gray-600">
                          {page.width} × {page.height} {page.unit}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                {displayData.hierarchy.pages[0].lines.map((line) => (
                  <div key={line.id} className="bg-gray-50 rounded p-3">
                    <div className="font-medium mb-2">"{line.text}"</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Rectangle Position:</span>
                        <div>X: {line.boundingBox.x}px, Y: {line.boundingBox.y}px</div>
                        <div>Width: {line.boundingBox.width}px, Height: {line.boundingBox.height}px</div>
                      </div>
                      <div>
                        <span className="font-medium">Polygon Points:</span>
                        <div className="text-xs bg-white p-2 rounded border font-mono">
                          {line.polygon ? (
                            line.polygon.reduce((acc, val, index) => {
                              if (index % 2 === 0) {
                                return acc + `(${val}, ${line.polygon[index + 1]}) `;
                              }
                              return acc;
                            }, '')
                          ) : 'No polygon data'}
                        </div>
                        <div className="mt-1">Confidence: {line.confidence}%</div>
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
