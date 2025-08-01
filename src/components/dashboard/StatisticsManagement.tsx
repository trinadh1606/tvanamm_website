import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface Statistic {
  id: string;
  stat_key: string;
  display_label: string;
  stat_value: number;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const StatisticsManagement = () => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    stat_key: '',
    display_label: '',
    stat_value: 0,
    sort_order: 0,
    is_active: true
  });

  const queryClient = useQueryClient();

  const { data: statistics, isLoading } = useQuery({
    queryKey: ['admin-statistics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_statistics')
        .select('*')
        .order('sort_order');
      
      if (error) throw error;
      return data as Statistic[];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (newStat: Omit<Statistic, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('site_statistics')
        .insert([newStat])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-statistics'] });
      queryClient.invalidateQueries({ queryKey: ['site-statistics'] });
      toast.success('Statistic created successfully');
      resetForm();
    },
    onError: (error) => {
      toast.error('Failed to create statistic');
      console.error('Error:', error);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Statistic> & { id: string }) => {
      const { data, error } = await supabase
        .from('site_statistics')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-statistics'] });
      queryClient.invalidateQueries({ queryKey: ['site-statistics'] });
      toast.success('Statistic updated successfully');
      setEditingId(null);
    },
    onError: (error) => {
      toast.error('Failed to update statistic');
      console.error('Error:', error);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('site_statistics')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-statistics'] });
      queryClient.invalidateQueries({ queryKey: ['site-statistics'] });
      toast.success('Statistic deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete statistic');
      console.error('Error:', error);
    }
  });

  const resetForm = () => {
    setFormData({
      stat_key: '',
      display_label: '',
      stat_value: 0,
      sort_order: 0,
      is_active: true
    });
    setEditingId(null);
  };

  const handleEdit = (stat: Statistic) => {
    setEditingId(stat.id);
    setFormData({
      stat_key: stat.stat_key,
      display_label: stat.display_label,
      stat_value: stat.stat_value,
      sort_order: stat.sort_order,
      is_active: stat.is_active
    });
  };

  const handleSave = () => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-24 bg-muted rounded"></div>
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
            {editingId ? 'Edit Statistic' : 'Add New Statistic'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="stat_key">Statistic Key</Label>
              <Input
                id="stat_key"
                value={formData.stat_key}
                onChange={(e) => setFormData(prev => ({ ...prev, stat_key: e.target.value }))}
                placeholder="e.g., total_customers"
              />
            </div>
            <div>
              <Label htmlFor="display_label">Display Label</Label>
              <Input
                id="display_label"
                value={formData.display_label}
                onChange={(e) => setFormData(prev => ({ ...prev, display_label: e.target.value }))}
                placeholder="e.g., Happy Customers"
              />
            </div>
            <div>
              <Label htmlFor="stat_value">Value</Label>
              <Input
                id="stat_value"
                type="number"
                value={formData.stat_value}
                onChange={(e) => setFormData(prev => ({ ...prev, stat_value: parseInt(e.target.value) || 0 }))}
                placeholder="e.g., 1000"
              />
            </div>
            <div>
              <Label htmlFor="sort_order">Sort Order</Label>
              <Input
                id="sort_order"
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                placeholder="e.g., 1"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
            <Label htmlFor="is_active">Active</Label>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={!formData.stat_key || !formData.display_label}>
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
        {statistics?.map((stat) => (
          <Card key={stat.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{stat.display_label}</h3>
                    <Badge variant={stat.is_active ? "default" : "secondary"}>
                      {stat.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Key: {stat.stat_key}</p>
                  <p className="text-2xl font-bold text-primary">{stat.stat_value.toLocaleString()}</p>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(stat)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteMutation.mutate(stat.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StatisticsManagement;