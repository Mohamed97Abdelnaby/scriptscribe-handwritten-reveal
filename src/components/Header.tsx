
import { Link, useLocation } from "react-router-dom";
import { FileText, Scan } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  const location = useLocation();
  
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Company Name */}
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/d3159c3c-9488-486e-8abf-290f61435c78.png" 
              alt="RAYA Logo" 
              className="h-12 w-auto"
            />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Raya Intelligent Document</h1>
              <p className="text-xs text-gray-500">OCR Solutions</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center space-x-6">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === "/" ? "text-primary" : "text-gray-600"
              }`}
            >
              Home
            </Link>
            <Link to="/test-ocr">
              <Button 
                variant={location.pathname === "/test-ocr" ? "default" : "outline"} 
                className="flex items-center space-x-2"
              >
                <FileText className="h-4 w-4" />
                <span>Test OCR</span>
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
