
import { useState } from "react";
import { ZoomIn, ZoomOut, RefreshCcw, Fullscreen, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BoundingBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  confidence: number;
  type: 'word' | 'line' | 'paragraph';
}

interface MobileDocumentViewerProps {
  previewUrl: string;
  boundingBoxes?: BoundingBox[];
  selectedModel: string;
  preserveOriginalQuality?: boolean;
}

const MobileDocumentViewer = ({ 
  previewUrl, 
  boundingBoxes = [], 
  selectedModel,
  preserveOriginalQuality = false 
}: MobileDocumentViewerProps) => {
  const [zoom, setZoom] = useState(100);
  const [selectedBox, setSelectedBox] = useState<string | null>(null);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock bounding boxes for demonstration
  const mockBoundingBoxes: BoundingBox[] = [
    { id: '1', x: 10, y: 20, width: 150, height: 25, text: 'Document Title', confidence: 98, type: 'line' },
    { id: '2', x: 10, y: 60, width: 200, height: 20, text: 'Sample document content', confidence: 95, type: 'line' },
    { id: '3', x: 10, y: 100, width: 180, height: 40, text: 'Table data section', confidence: 92, type: 'paragraph' },
  ];

  const displayBoxes = boundingBoxes.length > 0 ? boundingBoxes : mockBoundingBoxes;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  
  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
    setZoom(100);
    setRotation(0);
    setSelectedBox(null);
  };

  const handleFullscreen = () => {
    const viewerElement = document.querySelector('.mobile-document-viewer');
    
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

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 95) return 'border-green-500 bg-green-500/10';
    if (confidence >= 85) return 'border-yellow-500 bg-yellow-500/10';
    return 'border-red-500 bg-red-500/10';
  };

  return (
    <Card className="h-full mobile-document-viewer">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <CardTitle className="text-base sm:text-lg truncate">Document Viewer</CardTitle>
            <Badge variant="outline" className="text-xs">{selectedModel}</Badge>
            {preserveOriginalQuality && (
              <Badge variant="secondary" className="text-xs bg-green-50 text-green-700">Original Quality</Badge>
            )}
          </div>
          
          {/* Mobile: Dropdown menu for controls */}
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
                  <DropdownMenuItem onClick={handleZoomOut} disabled={zoom <= 50}>
                    Zoom Out ({zoom}%)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleZoomIn} disabled={zoom >= 200}>
                    Zoom In ({zoom}%)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleRotate}>
                    Rotate Document
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleRefresh} disabled={isRefreshing}>
                    {isRefreshing ? 'Refreshing...' : 'Refresh'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleFullscreen}>
                    {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Desktop: Individual buttons */}
            <div className="hidden sm:flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
              >
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
                className="w-full h-full transition-transform duration-200"
                style={{ 
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  transformOrigin: 'center',
                  objectFit: preserveOriginalQuality ? 'contain' : 'contain',
                  imageRendering: preserveOriginalQuality ? 'crisp-edges' : 'auto'
                }}
              />
              
              {/* Bounding Boxes Overlay */}
              {showBoundingBoxes && (
                <div className="absolute inset-0 pointer-events-none">
                  {displayBoxes.map((box) => (
                    <div
                      key={box.id}
                      className={`absolute border-2 cursor-pointer pointer-events-auto transition-all duration-200 ${
                        getConfidenceColor(box.confidence)
                      } ${selectedBox === box.id ? 'border-primary bg-primary/20' : ''}`}
                      style={{
                        left: `${box.x}px`,
                        top: `${box.y}px`,
                        width: `${box.width}px`,
                        height: `${box.height}px`,
                        transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                        transformOrigin: 'top left'
                      }}
                      onClick={() => setSelectedBox(selectedBox === box.id ? null : box.id)}
                      title={`${box.text} (${box.confidence}% confidence)`}
                    >
                      {selectedBox === box.id && (
                        <div className="absolute -top-8 left-0 bg-black text-white text-xs px-2 py-1 rounded z-10 whitespace-nowrap">
                          {box.text} ({box.confidence}%)
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <Fullscreen className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Upload a document to view at original quality</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Selected Region Info */}
        {selectedBox && (
          <div className="mt-3 sm:mt-4 p-3 bg-blue-50 rounded-lg">
            {(() => {
              const box = displayBoxes.find(b => b.id === selectedBox);
              return box ? (
                <div className="text-sm">
                  <div className="font-medium mb-1">Selected: {box.type}</div>
                  <div className="text-gray-600 mb-1">"{box.text}"</div>
                  <div className="text-xs text-gray-500">
                    Confidence: {box.confidence}% • Position: ({box.x}, {box.y})
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MobileDocumentViewer;
