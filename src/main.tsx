import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.tsx'
import './index.css'
import { CartProvider } from './contexts/CartContext.tsx'

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <CartProvider>
      <App />
    </CartProvider>
  </HelmetProvider>
);
