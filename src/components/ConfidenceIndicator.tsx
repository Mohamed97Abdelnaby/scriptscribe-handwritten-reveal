
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ConfidenceIndicatorProps {
  confidence: number;
  label?: string;
}

const ConfidenceIndicator = ({ confidence, label = "Confidence" }: ConfidenceIndicatorProps) => {
  const getConfidenceColor = (score: number) => {
    if (score >= 95) return "bg-green-500";
    if (score >= 85) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 95) return "High";
    if (score >= 85) return "Medium";
    return "Low";
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <Badge variant="outline" className="text-xs">
          {getConfidenceLabel(confidence)}
        </Badge>
      </div>
      <div className="flex items-center space-x-2">
        <Progress value={confidence} className="flex-1" />
        <span className="text-sm font-medium w-12 text-right">{confidence}%</span>
      </div>
    </div>
  );
};

export default ConfidenceIndicator;
