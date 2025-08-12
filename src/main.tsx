import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import App from "./App.tsx";
import "./index.css";
import { CartProvider } from "./contexts/CartContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CartProvider>
      <App />
    </CartProvider>
  </StrictMode>
);
