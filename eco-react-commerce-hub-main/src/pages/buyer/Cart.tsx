
import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import CartItem from '@/components/CartItem';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Button } from "@/components/ui/button";
import { checkoutCart } from '@/services/api';
import { toast } from '@/components/ui/use-toast';

const Cart: React.FC = () => {
  const { cartItems, loading, totalItems, totalPrice, updateCart } = useCart();
  
  const handleCheckout = async () => {
    try {
      await checkoutCart();
      toast({
        title: 'Order placed successfully!',
        description: 'Thank you for your purchase.',
      });
      await updateCart(); // Refresh cart after checkout
    } catch (err: any) {
      toast({
        title: 'Checkout failed',
        description: err.response?.data?.message || 'Failed to process your order',
        variant: 'destructive',
      });
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Shopping Cart</h1>
      
      {cartItems.length === 0 ? (
        <div className="text-center py-16">
          <h3 className="text-xl font-medium text-gray-500">Your cart is empty</h3>
          <p className="mt-2 text-gray-500 mb-8">Looks like you haven't added any products to your cart yet.</p>
          <Link to="/buyer/dashboard">
            <Button>Browse Products</Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Cart Items ({totalItems})</h2>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Estimated tax</span>
                  <span>${(totalPrice * 0.08).toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 mt-3 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${(totalPrice + totalPrice * 0.08).toFixed(2)}</span>
                </div>
              </div>
              
              <Button className="w-full" onClick={handleCheckout}>
                Proceed to Checkout
              </Button>
              
              <div className="mt-4">
                <Link to="/buyer/dashboard" className="text-sm text-brand hover:underline flex justify-center">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
