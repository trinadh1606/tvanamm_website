import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Mock products until database migration is complete
const mockProducts = [
  {
    id: '1',
    name: 'Premium Assam Black Tea',
    description: 'Rich and malty black tea from the finest Assam gardens',
    price: 299,
    stock_quantity: 50,
    category_id: 'black-tea',
    images: '["tea-placeholder.jpg"]',
    is_active: true
  },
  {
    id: '2',
    name: 'Himalayan Green Tea',
    description: 'Fresh green tea leaves from the high altitude Himalayan region',
    price: 399,
    stock_quantity: 30,
    category_id: 'green-tea',
    images: '["tea-placeholder.jpg"]',
    is_active: true
  },
  {
    id: '3',
    name: 'Masala Chai Blend',
    description: 'Traditional Indian spice blend with premium tea leaves',
    price: 249,
    stock_quantity: 75,
    category_id: 'black-tea',
    images: '["tea-placeholder.jpg"]',
    is_active: true
  },
  {
    id: '4',
    name: 'Herbal Chamomile Tea',
    description: 'Caffeine-free herbal tea perfect for relaxation',
    price: 199,
    stock_quantity: 40,
    category_id: 'herbal-tea',
    images: '["tea-placeholder.jpg"]',
    is_active: true
  },
  {
    id: '5',
    name: 'Earl Grey Special',
    description: 'Classic Earl Grey with bergamot oil and cornflower petals',
    price: 349,
    stock_quantity: 25,
    category_id: 'black-tea',
    images: '["tea-placeholder.jpg"]',
    is_active: true
  },
  {
    id: '6',
    name: 'Oolong Deluxe',
    description: 'Semi-fermented tea with complex flavors and aroma',
    price: 499,
    stock_quantity: 20,
    category_id: 'specialty-tea',
    images: '["tea-placeholder.jpg"]',
    is_active: true
  },
  {
    id: '7',
    name: 'Jasmine Green Tea',
    description: 'Delicate green tea scented with jasmine flowers',
    price: 299,
    stock_quantity: 35,
    category_id: 'green-tea',
    images: '["tea-placeholder.jpg"]',
    is_active: true
  },
  {
    id: '8',
    name: 'Turmeric Ginger Tea',
    description: 'Healing herbal blend with turmeric and ginger',
    price: 229,
    stock_quantity: 45,
    category_id: 'herbal-tea',
    images: '["tea-placeholder.jpg"]',
    is_active: true
  }
];

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      // Try to fetch from database first, fallback to mock data
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, description, price, stock_quantity, category_id, images, is_active, gst_rate, created_at')
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data.length > 0 ? data : mockProducts;
      } catch (error) {
        // Return mock data if database is not ready
        return mockProducts;
      }
    }
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });
};