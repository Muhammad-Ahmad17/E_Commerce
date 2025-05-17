import React, { createContext, ReactNode, useState, useEffect, useContext } from 'react';
import { getCart, addToCart, removeFromCart } from '@/services/api';
import { AuthContext } from './AuthContext';
import { toast } from '@/components/ui/use-toast';

export type CartItemType = {
  id: string;
  cartId: string;
  buyerId: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  totalPrice: number;
  imageUrl: string;
  availabilityStatus: string;
};

type CartContextType = {
  cartItems: CartItemType[];
  loading: boolean;
  error: string | null;
  addItem: (productId: number, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateCart: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
};

const defaultValue: CartContextType = {
  cartItems: [],
  loading: false,
  error: null,
  addItem: async () => { },
  removeItem: async () => { },
  updateCart: async () => { },
  totalItems: 0,
  totalPrice: 0,
};

export const CartContext = createContext<CartContextType>(defaultValue);

type CartProviderProps = {
  children: ReactNode;
};

export const CartProvider = ({ children }: CartProviderProps) => {
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useContext(AuthContext);

  const updateCart = async () => {
    if (!isAuthenticated || user?.role !== 'buyer') return;

    setLoading(true);
    setError(null);

    try {
      const response = await getCart();
      console.log('cart API response:', response);

      const mappedCartItems = (response.data || []).map((item: any) => ({
        id: item.cartId?.toString() || item.productId?.toString(),
        cartId: item.cartId?.toString(),
        buyerId: item.buyerId?.toString(),
        productId: item.productId?.toString(),
        name: item.productName,
        price: item.unitPrice,
        quantity: item.quantity,
        totalPrice: item.totalPrice,
        imageUrl: item.imageUrl || "",
        availabilityStatus: item.availabilityStatus || "",
      }));

      setCartItems(mappedCartItems);
    } catch (err: any) {
      // If error message is "No items found in cart...", treat as empty cart
      if (
        err.response?.data?.message &&
        err.response.data.message.includes('No items found in cart')
      ) {
        setCartItems([]); // Set cart to empty
      } else {
        setError(err.response?.data?.message || 'Failed to fetch cart');
        toast({
          title: 'Error',
          description: 'Failed to fetch cart items',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === 'buyer') {
      updateCart();
    }
  }, [isAuthenticated, user]);

  const addItem = async (productId: number, quantity: number) => {
    setLoading(true);
    setError(null);

    try {
      await addToCart({ productId, quantity });
      await updateCart();
      toast({
        title: 'Success',
        description: 'Product added to cart',
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add item to cart');
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to add item to cart',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (productId: string) => {
    setLoading(true);
    setError(null);

    try {
      await removeFromCart({ productId });
      await updateCart();
      toast({
        title: 'Success',
        description: 'Product removed from cart',
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove item from cart');
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to remove item from cart',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        error,
        addItem,
        removeItem,
        updateCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};