
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Upload, Download, Zap, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ImageUpscaler = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [upscaledImageUrl, setUpscaledImageUrl] = useState<string>("");
  const [isUpscaling, setIsUpscaling] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scale, setScale] = useState(4);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setUpscaledImageUrl("");
      
      toast({
        title: "Image uploaded",
        description: `${file.name} is ready for upscaling.`
      });
    } else {
      toast({
        title: "Invalid file",
        description: "Please select a valid image file.",
        variant: "destructive"
      });
    }
  };

  const upscaleImage = async () => {
    if (!selectedFile) return;

    setIsUpscaling(true);
    setProgress(0);

    try {
      // Convert file to base64
      const reader = new FileReader();
      const imageData = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(selectedFile);
      });

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 2000);

      // Call upscaling function
      const { data, error } = await supabase.functions.invoke('upscale-image', {
        body: {
          imageData,
          scale
        }
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (error) {
        console.error('Upscaling error:', error);
        toast({
          title: "Upscaling Failed",
          description: "Failed to upscale the image. Please try again.",
          variant: "destructive"
        });
        return;
      }

      if (data.success) {
        setUpscaledImageUrl(data.upscaledImage);
        toast({
          title: "Image Upscaled Successfully!",
          description: `Image enhanced with ${scale}x resolution.`
        });
      } else {
        throw new Error(data.error || 'Unknown error');
      }

    } catch (error) {
      console.error('Error upscaling image:', error);
      toast({
        title: "Processing Error",
        description: "An error occurred while upscaling your image.",
        variant: "destructive"
      });
    } finally {
      setIsUpscaling(false);
    }
  };

  const downloadImage = async () => {
    if (!upscaledImageUrl) return;

    try {
      const response = await fetch(upscaledImageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `upscaled_${selectedFile?.name || 'image.jpg'}`;
      a.click();
      
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download started",
        description: "Your upscaled image is downloading."
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Could not download the image.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ImageIcon className="h-5 w-5" />
            <span>Image Upscaler</span>
          </CardTitle>
          <CardDescription>
            Enhance your images with AI-powered upscaling technology
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                {selectedFile ? (
                  <div className="space-y-2">
                    <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-green-600" />
                    </div>
                    <p className="font-semibold">{selectedFile.name}</p>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      Ready for upscaling
                    </Badge>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-12 w-12 mx-auto text-gray-400" />
                    <p className="text-lg font-semibold">Upload Image</p>
                    <p className="text-sm text-gray-500">Click to select an image file</p>
                  </div>
                )}
              </label>
            </div>

            {selectedFile && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Upscaling Factor</label>
                  <select 
                    value={scale} 
                    onChange={(e) => setScale(Number(e.target.value))}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value={2}>2x Resolution</option>
                    <option value={4}>4x Resolution (Recommended)</option>
                    <option value={8}>8x Resolution</option>
                  </select>
                </div>

                <Button 
                  onClick={upscaleImage} 
                  disabled={isUpscaling} 
                  className="w-full"
                  size="lg"
                >
                  {isUpscaling ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Upscaling Image...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Upscale Image
                    </>
                  )}
                </Button>

                {isUpscaling && (
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Enhancing image quality...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="w-full" />
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {(previewUrl || upscaledImageUrl) && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>Compare original and upscaled images</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {previewUrl && (
                <div>
                  <h4 className="font-medium mb-2">Original Image</h4>
                  <img 
                    src={previewUrl} 
                    alt="Original" 
                    className="w-full rounded-lg border"
                  />
                </div>
              )}
              
              {upscaledImageUrl && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Upscaled Image ({scale}x)</h4>
                    <Button onClick={downloadImage} size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                  <img 
                    src={upscaledImageUrl} 
                    alt="Upscaled" 
                    className="w-full rounded-lg border"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImageUpscaler;
