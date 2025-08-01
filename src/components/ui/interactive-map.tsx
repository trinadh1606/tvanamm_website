import React from 'react';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InteractiveMapProps {
  address: string;
  googleMapsLink: string;
}

const InteractiveMap = ({ address, googleMapsLink }: InteractiveMapProps) => {
  return (
    <div className="relative w-full h-64 bg-gradient-to-br from-muted/50 to-muted rounded-lg overflow-hidden border">
      {/* Map placeholder with gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/10" />
      
      {/* Content overlay */}
      <div className="relative h-full flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-lg border">
          <h3 className="text-lg font-semibold text-foreground mb-2">Visit Our Office</h3>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            {address}
          </p>
          <Button 
            variant="brand" 
            size="sm"
            onClick={() => window.open(googleMapsLink, '_blank')}
            className="inline-flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Open in Google Maps
          </Button>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-4 left-4 w-2 h-2 bg-primary rounded-full animate-pulse" />
      <div className="absolute bottom-6 right-6 w-3 h-3 bg-accent rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
    </div>
  );
};

export default InteractiveMap;