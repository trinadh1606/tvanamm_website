import React from 'react';
import { Award, Leaf, Users, Globe, Shield, Coffee } from 'lucide-react';
import { Card } from '@/components/ui/card';
const features = [{
  icon: Leaf,
  title: "Premium Quality",
  description: "Handpicked from the finest tea gardens in the mountains of India, ensuring exceptional quality in every cup."
}, {
  icon: Coffee,
  title: "Expert Blends",
  description: "Crafted by master tea blenders with decades of experience, creating unique flavors that captivate your senses."
}, {
  icon: Award,
  title: "Award Winning",
  description: "Recognized internationally for our commitment to quality and sustainable tea farming practices."
}, {
  icon: Shield,
  title: "100% Natural",
  description: "No artificial additives or preservatives. Pure, natural tea that preserves the authentic flavors of nature."
}, {
  icon: Users,
  title: "Family Legacy",
  description: "Three generations of tea expertise passed down through our family, maintaining traditional methods."
}, {
  icon: Globe,
  title: "Global Reach",
  description: "Serving tea lovers worldwide while supporting local communities and sustainable farming practices."
}];
const FeaturesSection: React.FC = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Why Choose Our Tea</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Experience the perfect blend of tradition and quality that makes our tea exceptional
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <feature.icon className="h-8 w-8 text-primary mr-3" />
                <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
              </div>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
export default FeaturesSection;