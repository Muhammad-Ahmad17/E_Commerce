import React from 'react';
import { Button } from "@/components/ui/button";
import { useCart } from '@/hooks/useCart';
import { CartItemType } from '@/contexts/CartContext';

type CartItemProps = {
  item: CartItemType;
};

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { removeItem } = useCart();

  const handleRemove = () => {
    removeItem(item.productId);
  };

  return (
    <div className="flex items-center py-4 border-b">
      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
        <img
          src={item.imageUrl || "https://placehold.co/200x200?text=Product"}
          alt={item.name}
          className="h-full w-full object-cover object-center"
        />
      </div>

      <div className="ml-4 flex flex-1 flex-col">
        <div>
          <div className="flex justify-between text-base font-medium text-gray-900">
            <h3>{item.name}</h3>
            <p className="ml-4">${item.totalPrice?.toFixed(2) ?? (item.price * item.quantity).toFixed(2)}</p>
          </div>
          <p className="mt-1 text-sm text-gray-500">Qty: {item.quantity}</p>
          <p className="mt-1 text-sm text-gray-500">Unit Price: ${item.price}</p>
          <p className="mt-1 text-sm text-gray-500">Status: {item.availabilityStatus}</p>
        </div>
        <div className="flex flex-1 items-end justify-end">
          <Button onClick={handleRemove} variant="destructive" size="sm">
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
