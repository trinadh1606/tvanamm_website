import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });
};

export const useInventoryLogs = () => {
  return useQuery({
    queryKey: ['inventory-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_logs')
        .select(`
          *,
          products (
            name,
            sku
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data;
    }
  });
};

export const useUpdateProductStock = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      productId, 
      newStock, 
      reason 
    }: {
      productId: string;
      newStock: number;
      reason: string;
    }) => {
      // Get current stock
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', productId)
        .single();
      
      if (fetchError) throw fetchError;
      
      const previousStock = product.stock_quantity;
      const quantityChange = newStock - previousStock;
      
      // Update product stock
      const { error: updateError } = await supabase
        .from('products')
        .update({ stock_quantity: newStock })
        .eq('id', productId);
      
      if (updateError) throw updateError;
      
      // Log the change
      const { error: logError } = await supabase
        .from('inventory_logs')
        .insert({
          product_id: productId,
          change_type: quantityChange > 0 ? 'restock' : 'adjustment',
          quantity_change: quantityChange,
          previous_stock: previousStock,
          new_stock: newStock,
          reason,
          performed_by: (await supabase.auth.getUser()).data.user?.id
        });
      
      if (logError) throw logError;
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-logs'] });
      toast.success('Inventory updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update inventory: ${error.message}`);
    }
  });
};

export const useUpdateProductGST = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      productId, 
      gstRate 
    }: {
      productId: string;
      gstRate: number;
    }) => {
      const { error } = await supabase
        .from('products')
        .update({ gst_rate: gstRate })
        .eq('id', productId);
      
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('GST rate updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update GST rate: ${error.message}`);
    }
  });
};