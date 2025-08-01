import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CartItem {
  id: string;
  name: string;
  basePrice: number; // GST-exclusive price
  price: number; // GST-inclusive final price (what customer pays)
  quantity: number;
  image?: string;
  gstRate: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: any) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('tea-cart');
    const savedExpiry = localStorage.getItem('tea-cart-expiry');
    
    if (savedCart && savedExpiry) {
      const now = Date.now();
      const expiry = parseInt(savedExpiry);
      
      if (now < expiry) {
        try {
          const parsedCart = JSON.parse(savedCart);
          setCart(parsedCart);
        } catch (error) {
          console.warn('Failed to parse saved cart:', error);
          localStorage.removeItem('tea-cart');
          localStorage.removeItem('tea-cart-expiry');
        }
      } else {
        // Cart expired, clear it
        localStorage.removeItem('tea-cart');
        localStorage.removeItem('tea-cart-expiry');
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('tea-cart', JSON.stringify(cart));
      // Set expiry to 24 hours from now
      const expiry = Date.now() + (24 * 60 * 60 * 1000);
      localStorage.setItem('tea-cart-expiry', expiry.toString());
    } else {
      localStorage.removeItem('tea-cart');
      localStorage.removeItem('tea-cart-expiry');
    }
  }, [cart]);

  const addToCart = (product: any) => {
    const gstRate = product.gst_rate || 18;
    const basePrice = Number(product.price); // Product price is now GST-exclusive
    const gstInclusivePrice = basePrice + (basePrice * gstRate / 100);
    
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        id: product.id,
        name: product.name,
        basePrice: basePrice,
        price: gstInclusivePrice, // Final price includes GST
        quantity: 1,
        image: product.images,
        gstRate: gstRate
      }]);
    }
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.id !== id));
    } else {
      setCart(cart.map(item => 
        item.id === id 
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('tea-cart');
    localStorage.removeItem('tea-cart-expiry');
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      cartCount,
      cartTotal
    }}>
      {children}
    </CartContext.Provider>
  );
};