import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, Search } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useCreateLead } from '@/hooks/useLeads';

const ProductCatalogSection = () => {
  const { data: products, isLoading } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [downloadForm, setDownloadForm] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const createLeadMutation = useCreateLead();

  const categories = ['all', 'black-tea', 'green-tea', 'herbal-tea', 'specialty-tea'];
  
  const filteredProducts = products?.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
      product.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDownloadRequest = (e: React.FormEvent) => {
    e.preventDefault();
    createLeadMutation.mutate({
      ...downloadForm,
      message: 'Requested product catalog download',
      source: 'catalog_download'
    });
    setIsDownloadModalOpen(false);
    setDownloadForm({ name: '', email: '', phone: '' });
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Our Tea Collection
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-muted rounded-t-lg"></div>
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Our Premium Tea Collection
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Discover our carefully curated selection of authentic teas sourced from the finest tea gardens across India
            </p>
            
            <Button 
              onClick={() => setIsDownloadModalOpen(true)}
              className="mb-8"
              size="lg"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Full Catalog
            </Button>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search teas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="capitalize"
                >
                  {category.replace('-', ' ')}
                </Button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts?.slice(0, 8).map((product) => (
              <Card key={product.id} className="border-border hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-foreground text-lg">
                      {product.name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {product.description}
                    </p>
                    <div className="space-y-2 pt-2">
                      <div className="flex flex-col space-y-1">
                        <div className="text-sm text-muted-foreground">
                          Base Price: ₹{product.price} (Excl. GST)
                        </div>
                        <div className="text-xs text-muted-foreground">
                          + GST ({(product as any).gst_rate || 18}%): ₹{(Number(product.price) * (((product as any).gst_rate || 18) / 100)).toFixed(2)}
                        </div>
                        <div className="text-lg font-bold text-primary">
                          Total: ₹{(Number(product.price) + (Number(product.price) * (((product as any).gst_rate || 18) / 100))).toFixed(2)}
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {(product.stock_quantity || 0) > 0 ? 'In Stock' : 'Out of Stock'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              Showing {Math.min(8, filteredProducts?.length || 0)} of {filteredProducts?.length || 0} products
            </p>
            <Button variant="outline" size="lg">
              View Complete Collection
            </Button>
          </div>
        </div>
      </section>

      {/* Download Modal */}
      <Dialog open={isDownloadModalOpen} onOpenChange={setIsDownloadModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Download Product Catalog</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleDownloadRequest} className="space-y-4">
            <div>
              <Label htmlFor="download-name">Full Name *</Label>
              <Input
                id="download-name"
                value={downloadForm.name}
                onChange={(e) => setDownloadForm(prev => ({ ...prev, name: e.target.value }))}
                required
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <Label htmlFor="download-email">Email Address *</Label>
              <Input
                id="download-email"
                type="email"
                value={downloadForm.email}
                onChange={(e) => setDownloadForm(prev => ({ ...prev, email: e.target.value }))}
                required
                placeholder="Enter your email"
              />
            </div>
            <div>
              <Label htmlFor="download-phone">Phone Number</Label>
              <Input
                id="download-phone"
                value={downloadForm.phone}
                onChange={(e) => setDownloadForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter your phone number"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button 
                type="submit" 
                className="flex-1"
                disabled={createLeadMutation.isPending}
              >
                {createLeadMutation.isPending ? 'Sending...' : 'Download Catalog'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDownloadModalOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductCatalogSection;