
import { Link, useLocation } from "react-router-dom";
import { FileText, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const Header = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Company Name */}
          <Link to="/" className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            <img 
              src="/lovable-uploads/2ad1b136-a3ee-417b-b7ef-58127b986ccc.png" 
              alt="Raya Information Technology" 
              className="h-8 sm:h-10 md:h-12 w-auto"
            />
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">Raya Intelligent Document</h1>
              <p className="text-xs text-gray-500">OCR Solutions</p>
            </div>
            <div className="block sm:hidden">
              <h1 className="text-sm font-bold text-gray-900">RAYA OCR</h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
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

          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            size="sm"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t pt-4">
            <nav className="flex flex-col space-y-3">
              <Link 
                to="/" 
                className={`text-base font-medium transition-colors hover:text-primary ${
                  location.pathname === "/" ? "text-primary" : "text-gray-600"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link to="/test-ocr" onClick={() => setIsMobileMenuOpen(false)}>
                <Button 
                  variant={location.pathname === "/test-ocr" ? "default" : "outline"} 
                  className="flex items-center space-x-2 w-full justify-start"
                  size="sm"
                >
                  <FileText className="h-4 w-4" />
                  <span>Test OCR</span>
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
