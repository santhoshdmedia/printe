import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);
  const [guestId, setGuestId] = useState(null);

  useEffect(() => {
    // Initialize guest ID on app start
    const initializeGuestId = () => {
      let storedGuestId = localStorage.getItem('guestId');
      if (!storedGuestId) {
        storedGuestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('guestId', storedGuestId);
      }
      setGuestId(storedGuestId);
    };

    initializeGuestId();
  }, []);

  const updateCartCount = (count) => {
    setCartCount(count);
  };

  const refreshGuestId = () => {
    const newGuestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('guestId', newGuestId);
    setGuestId(newGuestId);
    return newGuestId;
  };

  const clearCartData = () => {
    localStorage.removeItem('guestId');
    setCartCount(0);
    setGuestId(null);
  };

  const value = {
    cartCount,
    guestId,
    updateCartCount,
    refreshGuestId,
    clearCartData
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};