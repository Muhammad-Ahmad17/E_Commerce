import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { Button } from "@/components/ui/button";

type ProductCardProps = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  description?: string;
  vendorName?: string;
};

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  price,
  imageUrl,
  category,
  description,
  vendorName,
}) => {
  const { addItem } = useCart();
  const { user } = useAuth();

  const handleAddToCart = () => {
    addItem(Number(id), 1);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
      <Link to={`/buyer/product/${id}`} className="block overflow-hidden h-48">
        <img 
          src={imageUrl || "https://placehold.co/400x300?text=Product"} 
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </Link>
      <div className="p-4">
        <span className="text-xs font-semibold text-brand bg-purple-100 px-2 py-1 rounded-full">{category}</span>
        <Link to={`/buyer/product/${id}`}>
          <h3 className="mt-2 text-lg font-medium text-gray-900 hover:text-brand truncate">{name}</h3>
        </Link>
        {description && (
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">{description}</p>
        )}
        <div className="mt-3 flex items-center justify-between">
          <p className="text-lg font-semibold">${price.toFixed(2)}</p>
          {user?.role === 'buyer' && (
            <Button onClick={handleAddToCart} variant="default" size="sm">
              Add to Cart
            </Button>
          )}
        </div>
        {vendorName && (
          <div className="mt-2 text-xs text-gray-500">Sold by: {vendorName}</div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
