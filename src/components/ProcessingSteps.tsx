
import { Check, Upload, Settings, Play, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProcessingStepsProps {
  currentStep: number;
}

const ProcessingSteps = ({ currentStep }: ProcessingStepsProps) => {
  const steps = [
    { id: 1, name: "Upload", icon: Upload },
    { id: 2, name: "Configure", icon: Settings },
    { id: 3, name: "Process", icon: Play },
    { id: 4, name: "Results", icon: FileText }
  ];

  return (
    <div className="flex items-center justify-between w-full max-w-md mx-auto mb-6">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
            currentStep > step.id 
              ? 'bg-primary border-primary text-primary-foreground' 
              : currentStep === step.id
              ? 'border-primary text-primary'
              : 'border-muted text-muted-foreground'
          }`}>
            {currentStep > step.id ? (
              <Check className="h-5 w-5" />
            ) : (
              <step.icon className="h-5 w-5" />
            )}
          </div>
          <div className="ml-2">
            <Badge variant={currentStep >= step.id ? "default" : "secondary"} className="text-xs">
              {step.name}
            </Badge>
          </div>
          {index < steps.length - 1 && (
            <div className={`w-8 h-0.5 mx-2 ${
              currentStep > step.id ? 'bg-primary' : 'bg-muted'
            }`} />
          )}
        </div>
      ))}
    </div>
  );
};

export default ProcessingSteps;
