import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Save, X, Star } from 'lucide-react';
import { toast } from 'sonner';

interface Testimonial {
  id: string;
  customer_name: string;
  customer_location: string;
  testimonial_text: string;
  rating: number;
  is_featured: boolean;
  order_id?: string;
  created_at: string;
  updated_at: string;
}

const TestimonialsManagement = () => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_location: '',
    testimonial_text: '',
    rating: 5,
    is_featured: false
  });

  const queryClient = useQueryClient();

  const { data: testimonials, isLoading } = useQuery({
    queryKey: ['admin-testimonials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Testimonial[];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (newTestimonial: Omit<Testimonial, 'id' | 'created_at' | 'updated_at' | 'order_id'>) => {
      const { data, error } = await supabase
        .from('testimonials')
        .insert([newTestimonial])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-testimonials'] });
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      queryClient.invalidateQueries({ queryKey: ['featured-testimonials'] });
      toast.success('Testimonial created successfully');
      resetForm();
    },
    onError: (error) => {
      toast.error('Failed to create testimonial');
      console.error('Error:', error);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Testimonial> & { id: string }) => {
      const { data, error } = await supabase
        .from('testimonials')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-testimonials'] });
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      queryClient.invalidateQueries({ queryKey: ['featured-testimonials'] });
      toast.success('Testimonial updated successfully');
      setEditingId(null);
    },
    onError: (error) => {
      toast.error('Failed to update testimonial');
      console.error('Error:', error);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-testimonials'] });
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      queryClient.invalidateQueries({ queryKey: ['featured-testimonials'] });
      toast.success('Testimonial deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete testimonial');
      console.error('Error:', error);
    }
  });

  const resetForm = () => {
    setFormData({
      customer_name: '',
      customer_location: '',
      testimonial_text: '',
      rating: 5,
      is_featured: false
    });
    setEditingId(null);
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingId(testimonial.id);
    setFormData({
      customer_name: testimonial.customer_name,
      customer_location: testimonial.customer_location,
      testimonial_text: testimonial.testimonial_text,
      rating: testimonial.rating,
      is_featured: testimonial.is_featured
    });
  };

  const handleSave = () => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-32 bg-muted rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {editingId ? 'Edit Testimonial' : 'Add New Testimonial'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customer_name">Customer Name</Label>
              <Input
                id="customer_name"
                value={formData.customer_name}
                onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label htmlFor="customer_location">Customer Location</Label>
              <Input
                id="customer_location"
                value={formData.customer_location}
                onChange={(e) => setFormData(prev => ({ ...prev, customer_location: e.target.value }))}
                placeholder="Mumbai, India"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="testimonial_text">Testimonial</Label>
            <Textarea
              id="testimonial_text"
              value={formData.testimonial_text}
              onChange={(e) => setFormData(prev => ({ ...prev, testimonial_text: e.target.value }))}
              placeholder="Share your wonderful experience..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rating">Rating</Label>
              <Select
                value={formData.rating.toString()}
                onValueChange={(value) => setFormData(prev => ({ ...prev, rating: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <SelectItem key={rating} value={rating.toString()}>
                      <div className="flex items-center gap-2">
                        <span>{rating}</span>
                        {renderStars(rating)}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2 mt-6">
              <Switch
                id="is_featured"
                checked={formData.is_featured}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
              />
              <Label htmlFor="is_featured">Featured Testimonial</Label>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleSave} 
              disabled={!formData.customer_name || !formData.testimonial_text || !formData.customer_location}
            >
              <Save className="h-4 w-4 mr-2" />
              {editingId ? 'Update' : 'Create'}
            </Button>
            {editingId && (
              <Button variant="outline" onClick={resetForm}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {testimonials?.map((testimonial) => (
          <Card key={testimonial.id}>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{testimonial.customer_name}</h3>
                      <Badge variant={testimonial.is_featured ? "default" : "secondary"}>
                        {testimonial.is_featured ? "Featured" : "Regular"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{testimonial.customer_location}</p>
                    {renderStars(testimonial.rating)}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(testimonial)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteMutation.mutate(testimonial.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <blockquote className="text-sm italic border-l-4 border-primary pl-4">
                  "{testimonial.testimonial_text}"
                </blockquote>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TestimonialsManagement;