
import { useState } from "react";
import { ZoomIn, ZoomOut, RefreshCcw, Fullscreen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

interface DocumentViewerProps {
  previewUrl: string;
  boundingBoxes?: BoundingBox[];
  selectedModel: string;
}

const DocumentViewer = ({ previewUrl, boundingBoxes = [], selectedModel }: DocumentViewerProps) => {
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
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
    // Reset view state
    setZoom(100);
    setRotation(0);
    setSelectedBox(null);
  };

  const handleFullscreen = () => {
    const viewerElement = document.querySelector('.document-viewer-container');
    
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
    <Card className="h-full document-viewer-container">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <span>Document Viewer</span>
            <Badge variant="outline">{selectedModel} model</Badge>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
            >
              {showBoundingBoxes ? 'Hide Regions' : 'Show Regions'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">{zoom}%</span>
            <Button variant="outline" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRotate}
              title="Rotate document"
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Refresh document"
            >
              {isRefreshing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              ) : (
                <RefreshCcw className="h-4 w-4" />
              )}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleFullscreen}
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              <Fullscreen className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative bg-gray-50 rounded-lg overflow-hidden" style={{ height: '400px' }}>
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
                <Fullscreen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Upload a document to view with region detection</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Selected Region Info */}
        {selectedBox && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            {(() => {
              const box = displayBoxes.find(b => b.id === selectedBox);
              return box ? (
                <div>
                  <div className="font-medium">Selected Region: {box.type}</div>
                  <div className="text-sm text-gray-600">Text: "{box.text}"</div>
                  <div className="text-sm text-gray-600">Confidence: {box.confidence}%</div>
                  <div className="text-sm text-gray-600">
                    Position: ({box.x}, {box.y}) Size: {box.width}×{box.height}
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

export default DocumentViewer;
