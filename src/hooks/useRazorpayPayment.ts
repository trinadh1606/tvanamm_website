import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentOptions {
  orderId: string;
  amount: number;
  currency?: string;
  orderNumber: string;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export const useRazorpayPayment = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [razorpayKey, setRazorpayKey] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Initialize Razorpay key on mount
  useEffect(() => {
    const initializeRazorpay = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-razorpay-key');
        
        if (error) {
          setError('Failed to initialize payment system');
          setIsInitialized(false);
          return;
        }
        
        if (!data || !data.success) {
          setError('Failed to initialize payment system');
          setIsInitialized(false);
          return;
        }
        setRazorpayKey(data.key);
        setIsInitialized(true);
      } catch (error) {
        setError('Error initializing payment system');
        setIsInitialized(false);
      }
    };

    initializeRazorpay();
  }, []);

  // Subscribe to payment transaction updates
  useEffect(() => {
    const channel = supabase
      .channel('payment-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'payment_transactions'
        },
        (payload) => {
          if (payload.new.status === 'completed') {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['pendingOrders'] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const createPaymentOrder = useMutation({
    mutationFn: async ({ orderId, amount, currency = 'INR', orderNumber }: PaymentOptions) => {
      // Convert amount from rupees to paise
      const amountInPaise = Math.round(amount * 100);

      const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
        body: { orderId, amount: amountInPaise, currency, orderNumber },
      });

      if (error) {
        throw error;
      }
      if (!data?.success) {
        throw new Error(data?.error || 'Unknown error');
      }

      return data;
    },
  });

  const verifyPayment = useMutation({
    mutationFn: async ({ 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      orderId 
    }: RazorpayResponse & { orderId: string }) => {
      const { data, error } = await supabase.functions.invoke('verify-razorpay-payment', {
        body: {
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          orderId,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['pendingOrders'] });
      toast({
        title: "Payment Successful",
        description: "Your payment has been processed successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Payment Verification Failed",
        description: "Please contact support if money was deducted.",
        variant: "destructive",
      });
    },
  });

  const initiatePayment = async ({ orderId, amount, currency = 'INR', orderNumber }: PaymentOptions) => {
    try {
      setIsProcessing(true);

      // Check if Razorpay key is available, if not try to get it
      let currentKey = razorpayKey;
      if (!currentKey) {
        const { data, error } = await supabase.functions.invoke('get-razorpay-key');
        
        if (error || !data.success) {
          throw new Error('Failed to get Razorpay key');
        }
        
        currentKey = data.key;
        setRazorpayKey(currentKey);
        setIsInitialized(true);
      }

      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });
      }

      // Create payment order
      const paymentData = await createPaymentOrder.mutateAsync({ orderId, amount, currency, orderNumber });
      
      const options = {
        key: currentKey,
        amount: paymentData.razorpayOrder.amount,
        currency: paymentData.razorpayOrder.currency,
        name: 'T VANAMM',
        description: `A PURITY OF TASTE | A UNIT OF JKSH PVT LTD | Payment for Order #${orderNumber}`,
        image: `${window.location.origin}/Uploads/e4d9c660-8cfa-4a85-82a9-a92de0445a63.png`,
        order_id: paymentData.razorpayOrder.id,
        handler: async (response: RazorpayResponse) => {
          try {
            await verifyPayment.mutateAsync({
              ...response,
              orderId,
            });
          } catch (error) {
            // Error handling is done in the mutation
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        notes: {
          order_id: orderId,
        },
        theme: {
          color: '#0f4f3c',
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            toast({
              title: "Payment Cancelled",
              description: "Payment was cancelled by user.",
              variant: "destructive",
            });
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    initiatePayment,
    isProcessing: isProcessing || createPaymentOrder.isPending || verifyPayment.isPending,
    isCreatingOrder: createPaymentOrder.isPending,
    isVerifying: verifyPayment.isPending,
    isInitialized,
    razorpayKey,
  };
};