
import { useState } from "react";
import { ZoomIn, ZoomOut, RefreshCcw, Fullscreen, MoreHorizontal, PenTool, Type, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EnhancedBoundingBox {
  id: string;
  text: string;
  confidence: number;
  polygon: number[];
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  type: 'word' | 'line' | 'paragraph';
  isHandwritten?: boolean;
}

interface EnhancedDocumentViewerProps {
  previewUrl: string;
  boundingBoxes?: EnhancedBoundingBox[];
  selectedModel: string;
  handwritingPercentage?: number;
  pageDimensions?: {
    width: number;
    height: number;
    unit: string;
  };
}

const EnhancedDocumentViewer = ({ 
  previewUrl, 
  boundingBoxes = [], 
  selectedModel,
  handwritingPercentage = 0,
  pageDimensions
}: EnhancedDocumentViewerProps) => {
  const [zoom, setZoom] = useState(100);
  const [selectedBox, setSelectedBox] = useState<string | null>(null);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(false);
  const [viewMode, setViewMode] = useState<'polygons' | 'rectangles'>('polygons');
  const [filterMode, setFilterMode] = useState<'all' | 'handwritten' | 'printed'>('all');
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Enhanced mock data with polygon and handwriting detection
  const mockBoundingBoxes: EnhancedBoundingBox[] = [
    { 
      id: '1', 
      text: 'Enhanced Document Title', 
      confidence: 98.5, 
      polygon: [10, 20, 250, 20, 250, 45, 10, 45],
      boundingBox: { x: 10, y: 20, width: 240, height: 25 },
      type: 'line',
      isHandwritten: false
    },
    { 
      id: '2', 
      text: 'Handwritten note here', 
      confidence: 94.2, 
      polygon: [10, 60, 220, 65, 215, 85, 5, 80],
      boundingBox: { x: 5, y: 60, width: 215, height: 25 },
      type: 'line',
      isHandwritten: true
    },
    { 
      id: '3', 
      text: 'Printed content section', 
      confidence: 99.1, 
      polygon: [10, 100, 200, 100, 200, 140, 10, 140],
      boundingBox: { x: 10, y: 100, width: 190, height: 40 },
      type: 'paragraph',
      isHandwritten: false
    },
  ];

  const displayBoxes = boundingBoxes.length > 0 ? boundingBoxes : mockBoundingBoxes;
  
  // Filter boxes based on mode
  const filteredBoxes = displayBoxes.filter(box => {
    if (filterMode === 'all') return true;
    if (filterMode === 'handwritten') return box.isHandwritten;
    if (filterMode === 'printed') return !box.isHandwritten;
    return true;
  });

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  
  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleRefresh = async () => {
    setZoom(100);
    setRotation(0);
    setSelectedBox(null);
  };

  const handleFullscreen = () => {
    const viewerElement = document.querySelector('.enhanced-document-viewer');
    
    if (!isFullscreen && viewerElement) {
      if (viewerElement.requestFullscreen) {
        viewerElement.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  const getConfidenceColor = (confidence: number, isHandwritten?: boolean) => {
    const baseColor = isHandwritten ? 'border-purple-500 bg-purple-500/10' : 'border-blue-500 bg-blue-500/10';
    if (confidence >= 95) return isHandwritten ? 'border-purple-600 bg-purple-600/15' : 'border-green-500 bg-green-500/10';
    if (confidence >= 85) return isHandwritten ? 'border-purple-400 bg-purple-400/10' : 'border-yellow-500 bg-yellow-500/10';
    return isHandwritten ? 'border-purple-300 bg-purple-300/10' : 'border-red-500 bg-red-500/10';
  };

  const createPolygonPath = (polygon: number[]) => {
    if (polygon.length < 8) return '';
    const points = [];
    for (let i = 0; i < polygon.length; i += 2) {
      points.push(`${polygon[i]},${polygon[i + 1]}`);
    }
    return points.join(' ');
  };

  return (
    <Card className="h-full enhanced-document-viewer">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <CardTitle className="text-base sm:text-lg truncate">Enhanced Document Viewer</CardTitle>
            <Badge variant="outline" className="text-xs">{selectedModel}</Badge>
            {handwritingPercentage > 0 && (
              <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                <PenTool className="h-3 w-3 mr-1" />
                {handwritingPercentage}% Handwritten
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-2">
            <div className="block sm:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-10 w-10 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}>
                    {showBoundingBoxes ? 'Hide Regions' : 'Show Regions'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setViewMode(viewMode === 'polygons' ? 'rectangles' : 'polygons')}>
                    {viewMode === 'polygons' ? 'Rectangle View' : 'Polygon View'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleZoomOut} disabled={zoom <= 50}>
                    Zoom Out ({zoom}%)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleZoomIn} disabled={zoom >= 200}>
                    Zoom In ({zoom}%)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleRotate}>
                    Rotate Document
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleFullscreen}>
                    {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="hidden sm:flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
              >
                <Eye className="h-4 w-4 mr-1" />
                {showBoundingBoxes ? 'Hide' : 'Show'} Regions
              </Button>
              <Button variant="outline" size="sm" onClick={handleZoomOut} disabled={zoom <= 50}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium px-2">{zoom}%</span>
              <Button variant="outline" size="sm" onClick={handleZoomIn} disabled={zoom >= 200}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleRotate}>
                <RefreshCcw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleFullscreen}>
                <Fullscreen className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Controls */}
        {showBoundingBoxes && (
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'polygons' | 'rectangles')}>
            <div className="flex items-center justify-between">
              <TabsList className="grid w-full grid-cols-2 max-w-[200px]">
                <TabsTrigger value="polygons" className="text-xs">Polygons</TabsTrigger>
                <TabsTrigger value="rectangles" className="text-xs">Rectangles</TabsTrigger>
              </TabsList>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant={filterMode === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterMode('all')}
                  className="text-xs"
                >
                  All
                </Button>
                <Button
                  variant={filterMode === 'handwritten' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterMode('handwritten')}
                  className="text-xs"
                >
                  <PenTool className="h-3 w-3 mr-1" />
                  Handwritten
                </Button>
                <Button
                  variant={filterMode === 'printed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterMode('printed')}
                  className="text-xs"
                >
                  <Type className="h-3 w-3 mr-1" />
                  Printed
                </Button>
              </div>
            </div>
          </Tabs>
        )}
      </CardHeader>
      
      <CardContent className="p-3 sm:p-6">
        <div 
          className="relative bg-gray-50 rounded-lg overflow-hidden"
          style={{ height: 'min(400px, 60vh)' }}
        >
          {previewUrl ? (
            <div className="relative w-full h-full">
              <img 
                src={previewUrl} 
                alt="Document preview" 
                className="w-full h-full object-contain transition-transform duration-200"
                style={{ 
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  transformOrigin: 'center'
                }}
              />
              
              {/* Enhanced Bounding Boxes Overlay */}
              {showBoundingBoxes && (
                <div className="absolute inset-0 pointer-events-none">
                  {viewMode === 'polygons' ? (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{
                      transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                      transformOrigin: 'center'
                    }}>
                      {filteredBoxes.map((box) => (
                        <polygon
                          key={box.id}
                          points={createPolygonPath(box.polygon)}
                          className={`cursor-pointer pointer-events-auto transition-all duration-200 fill-transparent stroke-2 ${
                            box.isHandwritten ? 'stroke-purple-500' : 'stroke-blue-500'
                          } ${selectedBox === box.id ? 'stroke-primary fill-primary/20' : ''}`}
                          onClick={() => setSelectedBox(selectedBox === box.id ? null : box.id)}
                        />
                      ))}
                    </svg>
                  ) : (
                    filteredBoxes.map((box) => (
                      <div
                        key={box.id}
                        className={`absolute border-2 cursor-pointer pointer-events-auto transition-all duration-200 ${
                          getConfidenceColor(box.confidence, box.isHandwritten)
                        } ${selectedBox === box.id ? 'border-primary bg-primary/20' : ''}`}
                        style={{
                          left: `${box.boundingBox.x}px`,
                          top: `${box.boundingBox.y}px`,
                          width: `${box.boundingBox.width}px`,
                          height: `${box.boundingBox.height}px`,
                          transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                          transformOrigin: 'top left'
                        }}
                        onClick={() => setSelectedBox(selectedBox === box.id ? null : box.id)}
                        title={`${box.text} (${box.confidence}% confidence)`}
                      >
                        {selectedBox === box.id && (
                          <div className="absolute -top-8 left-0 bg-black text-white text-xs px-2 py-1 rounded z-10 whitespace-nowrap">
                            {box.text} ({box.confidence}%)
                            {box.isHandwritten && (
                              <PenTool className="inline h-3 w-3 ml-1" />
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <Fullscreen className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Upload a document for enhanced analysis</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Enhanced Selected Region Info */}
        {selectedBox && (
          <div className="mt-3 sm:mt-4 p-3 bg-blue-50 rounded-lg">
            {(() => {
              const box = filteredBoxes.find(b => b.id === selectedBox);
              return box ? (
                <div className="text-sm">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium">Selected: {box.type}</span>
                    {box.isHandwritten ? (
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-xs">
                        <PenTool className="h-3 w-3 mr-1" />
                        Handwritten
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                        <Type className="h-3 w-3 mr-1" />
                        Printed
                      </Badge>
                    )}
                  </div>
                  <div className="text-gray-600 mb-1">"{box.text}"</div>
                  <div className="text-xs text-gray-500">
                    Confidence: {box.confidence}% • Position: ({box.boundingBox.x}, {box.boundingBox.y})
                    {box.polygon.length > 0 && (
                      <span> • Polygon: {Math.floor(box.polygon.length / 2)} points</span>
                    )}
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        )}

        {/* Page Dimensions Info */}
        {pageDimensions && (
          <div className="mt-3 p-2 bg-gray-100 rounded text-xs text-gray-600">
            Page: {pageDimensions.width} × {pageDimensions.height} {pageDimensions.unit}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedDocumentViewer;
