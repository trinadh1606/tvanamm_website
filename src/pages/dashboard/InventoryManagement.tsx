import React, { useState } from 'react';
import { useProducts, useInventoryLogs, useUpdateProductStock, useUpdateProductGST } from '@/hooks/useInventory';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, AlertTriangle, Edit, History, TrendingUp, TrendingDown, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import ProductFormModal from '@/components/dashboard/ProductFormModal';
import DeleteProductModal from '@/components/dashboard/DeleteProductModal';

export default function InventoryManagement() {
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: inventoryLogs = [], isLoading: logsLoading } = useInventoryLogs();
  
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [productModalMode, setProductModalMode] = useState<'create' | 'edit'>('create');


  const getStockStatus = (stock: number, minimum: number) => {
    if (stock === 0) return { label: 'Out of Stock', color: 'destructive' };
    if (stock <= minimum) return { label: 'Low Stock', color: 'warning' };
    return { label: 'In Stock', color: 'success' };
  };

  if (productsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const lowStockProducts = products.filter(p => p.stock_quantity <= p.minimum_stock);
  const outOfStockProducts = products.filter(p => p.stock_quantity === 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">
            Manage product stock levels and track inventory changes
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => {
            setProductModalMode('create');
            setSelectedProduct(null);
            setIsProductModalOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
          <Badge variant="outline" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            {products.length} Products
          </Badge>
          {lowStockProducts.length > 0 && (
            <Badge variant="destructive" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {lowStockProducts.length} Low Stock
            </Badge>
          )}
        </div>
      </div>

      {/* Alert Cards */}
      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {outOfStockProducts.length > 0 && (
            <Card className="border-destructive">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Out of Stock ({outOfStockProducts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {outOfStockProducts.slice(0, 3).map(product => (
                    <div key={product.id} className="text-sm">
                      {product.name} - {product.sku}
                    </div>
                  ))}
                  {outOfStockProducts.length > 3 && (
                    <div className="text-sm text-muted-foreground">
                      +{outOfStockProducts.length - 3} more...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          
          {lowStockProducts.length > 0 && (
            <Card className="border-warning">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-warning">
                  <AlertTriangle className="h-5 w-5" />
                  Low Stock ({lowStockProducts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {lowStockProducts.slice(0, 3).map(product => (
                    <div key={product.id} className="text-sm">
                      {product.name} - {product.stock_quantity} left
                    </div>
                  ))}
                  {lowStockProducts.length > 3 && (
                    <div className="text-sm text-muted-foreground">
                      +{lowStockProducts.length - 3} more...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="logs">Activity Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Product Inventory</CardTitle>
              <CardDescription>
                Manage stock levels and GST rates for all products
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Min. Stock</TableHead>
                    <TableHead>GST Rate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => {
                    const status = getStockStatus(product.stock_quantity, product.minimum_stock);
                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.sku}</TableCell>
                        <TableCell>{product.categories?.name || 'Uncategorized'}</TableCell>
                        <TableCell>{product.stock_quantity}</TableCell>
                        <TableCell>{product.minimum_stock}</TableCell>
                        <TableCell>{product.gst_rate}%</TableCell>
                        <TableCell>
                          <Badge variant={status.color as any}>{status.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedProduct(product);
                                setProductModalMode('edit');
                                setIsProductModalOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedProduct(product);
                                setIsDeleteModalOpen(true);
                              }}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Inventory Activity Logs
              </CardTitle>
              <CardDescription>
                Track all inventory changes and movements
              </CardDescription>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Change</TableHead>
                      <TableHead>Previous</TableHead>
                      <TableHead>New</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Performed By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventoryLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm')}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{log.products?.name}</div>
                            <div className="text-sm text-muted-foreground">{log.products?.sku}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.change_type}</Badge>
                        </TableCell>
                        <TableCell className="flex items-center gap-1">
                          {log.quantity_change > 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          )}
                          {Math.abs(log.quantity_change)}
                        </TableCell>
                        <TableCell>{log.previous_stock}</TableCell>
                        <TableCell>{log.new_stock}</TableCell>
                        <TableCell>{log.reason}</TableCell>
                        <TableCell>System</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        product={selectedProduct}
        mode={productModalMode}
      />

      <DeleteProductModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        product={selectedProduct}
      />
    </div>
  );
}