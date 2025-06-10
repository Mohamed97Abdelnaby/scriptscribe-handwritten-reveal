import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Zap, Shield, Clock, ArrowRight, CheckCircle } from "lucide-react";
import Header from "@/components/Header";
const Index = () => {
  const features = [{
    icon: <Zap className="h-6 w-6" />,
    title: "Lightning Fast",
    description: "Process documents in seconds with our advanced OCR technology"
  }, {
    icon: <Shield className="h-6 w-6" />,
    title: "Highly Accurate",
    description: "99.9% accuracy on handwritten and printed documents"
  }, {
    icon: <Clock className="h-6 w-6" />,
    title: "Real-time Processing",
    description: "Instant results with live preview and editing capabilities"
  }];
  const services = ["Handwritten Text Recognition", "Printed Document OCR", "Multi-language Support", "Document Structure Analysis", "Form Data Extraction", "Batch Processing"];
  return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <Header />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-4">
            Advanced OCR Technology
          </Badge>
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Transform Your
            <span className="ocr-gradient bg-clip-text text-slate-800"> Handwritten Documents</span>
            <br />into Digital Text
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Experience the power of cutting-edge OCR technology. Upload any handwritten or printed document 
            and watch as our AI instantly converts it into editable, searchable text with remarkable accuracy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/test-ocr">
              <Button size="lg" className="text-lg px-8 py-6 flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Try OCR Now</span>
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose DocuScan AI?</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our state-of-the-art OCR technology delivers unmatched performance for all your document processing needs.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => <Card key={index} className="text-center ocr-card-hover">
              <CardHeader>
                <div className="w-12 h-12 mx-auto mb-4 ocr-gradient rounded-lg flex items-center justify-center text-white">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardContent>
            </Card>)}
        </div>
      </section>

      {/* Services Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our OCR Services</h2>
              <p className="text-lg text-gray-600">
                Comprehensive document processing solutions for businesses and individuals
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">What We Offer</h3>
                <div className="space-y-4">
                  {services.map((service, index) => <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">{service}</span>
                    </div>)}
                </div>
              </div>
              
              <Card className="ocr-card-hover">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-6 w-6 text-primary" />
                    <span>Test Our OCR System</span>
                  </CardTitle>
                  <CardDescription>
                    Ready to see our OCR technology in action? Upload a document and experience the magic yourself.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to="/test-ocr">
                    <Button className="w-full" size="lg">
                      Start Testing
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-8 h-8 ocr-gradient rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">DocuScan AI</span>
            </div>
            <p className="text-gray-400 mb-4">
              Transforming documents with cutting-edge OCR technology
            </p>
            <p className="text-sm text-gray-500">
              © 2024 DocuScan AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>;
};
export default Index;