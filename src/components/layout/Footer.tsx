import React from 'react';
import { Phone, Mail, MapPin, Heart } from 'lucide-react';
import InteractiveMap from '@/components/ui/interactive-map';

const Footer = () => {
  return (
    <footer className="bg-tea-green/5 border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img src="/Uploads/e4d9c660-8cfa-4a85-82a9-a92de0445a63.png" alt="T VANAMM Logo" className="w-10 h-10" />
              <div>
                <h3 className="text-2xl font-bold text-tea-green">T VANAMM</h3>
                <p className="text-xs text-muted-foreground">A taste of purity</p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              A unit of JKSH United Pvt Ltd
            </p>
            <div className="flex items-center text-sm text-muted-foreground">
              <Heart className="h-4 w-4 mr-1 text-red-500" />
              Made with love in India
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="text-muted-foreground hover:text-tea-green transition-colors">Home</a></li>
              <li><a href="/about" className="text-muted-foreground hover:text-tea-green transition-colors">About Us</a></li>
              <li><a href="/order" className="text-muted-foreground hover:text-tea-green transition-colors">Order Now</a></li>
              <li><a href="/franchise" className="text-muted-foreground hover:text-tea-green transition-colors">Franchise</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Contact Info</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-tea-green" />
                <div className="text-muted-foreground">
                  <div>+91 93906 58544</div>
                  <div>+91 90000 08479</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-tea-green" />
                <span className="text-muted-foreground">tvanamm@gmail.com</span>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-tea-green mt-0.5" />
                <span className="text-muted-foreground">
                  Plot No. 12, Rd Number 8, Gayatri Nagar,<br />
                  Vivekananda Nagar, Kukatpally,<br />
                  Hyderabad, Telangana 500072
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Map */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Find Us</h4>
            <InteractiveMap 
              address="Plot No. 12, Rd Number 8, Gayatri Nagar, Vivekananda Nagar, Kukatpally, Hyderabad, Telangana 500072"
              googleMapsLink="https://share.google/oq0ibPT4H5TfWXDaI"
            />
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-muted-foreground">
              © 2025 T VANAMM. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-muted-foreground hover:text-tea-green transition-colors">Privacy Policy</a>
              <a href="#" className="text-muted-foreground hover:text-tea-green transition-colors">Terms of Service</a>
              <a href="/contact" className="text-muted-foreground hover:text-tea-green transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;