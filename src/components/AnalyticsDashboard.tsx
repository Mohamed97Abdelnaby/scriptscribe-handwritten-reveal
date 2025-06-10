
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { FileText, Clock, Target, Globe, Table, FileCheck } from "lucide-react";
import ConfidenceIndicator from "./ConfidenceIndicator";

interface AnalyticsDashboardProps {
  selectedModel: string;
  processingTime?: string;
  overallConfidence?: number;
}

const AnalyticsDashboard = ({ 
  selectedModel, 
  processingTime = "2.3 seconds", 
  overallConfidence = 97.5 
}: AnalyticsDashboardProps) => {
  
  // Mock analytics data
  const confidenceByRegion = [
    { name: 'Headers', confidence: 98 },
    { name: 'Body Text', confidence: 96 },
    { name: 'Tables', confidence: 94 },
    { name: 'Signatures', confidence: 89 },
    { name: 'Handwriting', confidence: 92 }
  ];

  const documentStructure = [
    { name: 'Text Regions', value: 45, color: '#3B82F6' },
    { name: 'Tables', value: 12, color: '#10B981' },
    { name: 'Images', value: 8, color: '#F59E0B' },
    { name: 'Forms', value: 5, color: '#8B5CF6' }
  ];

  const processingMetrics = [
    { metric: 'Pages Processed', value: '3', icon: FileText },
    { metric: 'Processing Time', value: processingTime, icon: Clock },
    { metric: 'Words Detected', value: '1,247', icon: Target },
    { metric: 'Languages', value: 'English', icon: Globe },
    { metric: 'Tables Found', value: '4', icon: Table },
    { metric: 'Forms Detected', value: '2', icon: FileCheck }
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {processingMetrics.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <IconComponent className="h-4 w-4 text-primary" />
                  <span className="text-xs text-muted-foreground">{metric.metric}</span>
                </div>
                <div className="text-lg font-bold">{metric.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Overall Analytics */}
        <Card>
          <CardHeader>
            <CardTitle>Processing Analytics</CardTitle>
            <CardDescription>Overall confidence and quality metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ConfidenceIndicator 
              confidence={overallConfidence} 
              label="Overall Confidence" 
            />
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Model Accuracy</span>
                <Badge variant="default">{selectedModel === 'print' ? '99.8%' : selectedModel === 'handwriting' ? '99.2%' : '98.9%'}</Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Language Detection</span>
                <Badge variant="outline">English (99.5%)</Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Document Quality</span>
                <Badge variant="default" className="bg-green-600">Excellent</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Document Structure */}
        <Card>
          <CardHeader>
            <CardTitle>Document Structure</CardTitle>
            <CardDescription>Distribution of detected elements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={documentStructure}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {documentStructure.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {documentStructure.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confidence by Region */}
      <Card>
        <CardHeader>
          <CardTitle>Confidence by Region</CardTitle>
          <CardDescription>OCR accuracy across different document regions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={confidenceByRegion}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[80, 100]} />
                <Tooltip formatter={(value) => [`${value}%`, 'Confidence']} />
                <Bar dataKey="confidence" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
