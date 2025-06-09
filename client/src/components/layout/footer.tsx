import { Link } from "wouter";
import { Home, Facebook, Instagram, Linkedin, Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-800 dark:bg-slate-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="flex items-center space-x-2">
                {/* Modern Property Icon */}
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-orange-500 rounded-lg flex items-center justify-center shadow-lg">
                    <Home className="w-4 h-4 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-400 rounded-full border border-white"></div>
                </div>
                {/* Enhanced Text Logo */}
                <div className="flex flex-col">
                  <span className="text-lg font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent leading-tight">
                    PropertyHub
                  </span>
                  <span className="text-xs font-semibold text-gray-400 -mt-1 tracking-wider">
                    REAL ESTATE
                  </span>
                </div>
              </div>
            </div>
            <p className="text-slate-300 mb-6">
              Your trusted partner in South African real estate. Expert guidance, exceptional service.
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center hover:bg-purple-primary transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center hover:bg-purple-primary transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center hover:bg-purple-primary transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3 text-slate-300">
              <li>
                <Link href="/properties" className="hover:text-white transition-colors">
                  Properties
                </Link>
              </li>
              <li>
                <Link href="/agents" className="hover:text-white transition-colors">
                  Agents
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-6">Services</h4>
            <ul className="space-y-3 text-slate-300">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Buy Property
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Sell Property
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Rent Property
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Property Management
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-6">Contact Info</h4>
            <div className="space-y-3 text-slate-300">
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-orange-primary" />
                <span>(555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-orange-primary" />
                <span>info@spurgeonproperty.com</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-orange-primary mt-1" />
                <span>
                  South Africa<br />
                  Property Services
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-slate-700 mt-12 pt-8 text-center text-slate-400">
          <p>&copy; 2024 SpurgeonProperty. All rights reserved. | Privacy Policy | Terms of Service</p>
        </div>
      </div>
    </footer>
  );
}
