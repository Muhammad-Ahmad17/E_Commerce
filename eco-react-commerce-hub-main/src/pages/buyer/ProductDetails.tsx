import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getProductDetails } from '@/services/api';
import { useCart } from '@/hooks/useCart';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import ReviewForm from '@/components/ReviewForm';
import { Button } from "@/components/ui/button";
import { toast } from '@/components/ui/use-toast';
import { Minus, Plus, Star } from 'lucide-react';

type ProductDetails = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
  vendorName: string;
  averageRating: number;
  reviewCount: number;
  reviews: Review[];
};

type Review = {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const response = await getProductDetails(id);
        const data = response.data;
        console.log('ProductDetails page id param:', id);
        console.log('Productasd API response:', data);
        // Map backend fields to frontend type
        const mappedProduct: ProductDetails = {
          id: data.productId.toString(),
          name: data.productName,
          description: data.description,
          price: data.price,
          imageUrl: data.imageUrl,
          category: data.categoryName,
          stock: data.stockQuantity ?? 0,
          vendorName: data.vendorName,
          averageRating: data.averageRating ?? 0,
          reviewCount: data.reviewCount ?? 0,
          reviews: data.reviews ?? [],
        };

        setProduct(mappedProduct);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch product details');
        toast({
          title: 'Error',
          description: 'Failed to load product details',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem(Number(product.id), quantity);
  };

  const handleQuantityChange = (value: number) => {
    if (product && value >= 1 && value <= product.stock) {
      setQuantity(value);
    }
  };

  const handleReviewAdded = async () => {
    if (!id) return;
    try {
      const response = await getProductDetails(id);
      const data = response.data;
      setProduct((prev) =>
        prev
          ? {
              ...prev,
              reviews: data.reviews ?? [],
              averageRating: data.averageRating ?? prev.averageRating,
              reviewCount: data.reviewCount ?? prev.reviewCount,
            }
          : prev
      );
    } catch (err) {
      console.error('Failed to refresh product details', err);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage message={error || 'Product not found'} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Product Details */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Product Image */}
        <div className="md:w-1/2">
          <img
            src={product.imageUrl || "https://placehold.co/600x800?text=Product"}
            alt={product.name}
            className="w-full h-auto object-cover rounded-lg"
          />
        </div>

        {/* Product Info */}
        <div className="md:w-1/2 space-y-4">
          <div>
            <span className="text-sm font-semibold text-brand bg-purple-100 px-2 py-1 rounded-full">
              {product.category}
            </span>
            <h1 className="text-3xl font-bold mt-2">{product.name}</h1>
            <p className="text-gray-600 mt-1">by <span className="font-semibold">{product.vendorName}</span></p>

            <div className="flex items-center mt-2">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className={i < Math.round(product.averageRating)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                    }
                  />
                ))}
              </div>
              <span className="ml-2 text-gray-600">
                {product.averageRating ? product.averageRating.toFixed(1) : "No ratings yet"} ({product.reviewCount} reviews)
              </span>
            </div>
          </div>

          <div className="text-2xl font-bold text-gray-900">${product.price.toFixed(2)}</div>

          <div className="border-t border-b border-gray-200 py-4">
            <p className="text-gray-700">{product.description}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">
              Availability: {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
            </p>

            {product.stock > 0 && (
              <div className="flex items-center space-x-2 mt-4">
                <div className="border rounded-md flex items-center">
                  <button
                    className="px-3 py-1"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                  >
                    <Minus size={16} className={quantity <= 1 ? "text-gray-400" : "text-gray-600"} />
                  </button>
                  <span className="px-3 py-1 border-l border-r">{quantity}</span>
                  <button
                    className="px-3 py-1"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= product.stock}
                  >
                    <Plus size={16} className={quantity >= product.stock ? "text-gray-400" : "text-gray-600"} />
                  </button>
                </div>

                <Button onClick={handleAddToCart} className="flex-1">
                  Add to Cart
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

        {/* Review List */}
        {product.reviews && product.reviews.length > 0 ? (
          <div className="space-y-6">
            {product.reviews.map((review) => (
              <div key={review.id} className="border-b pb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      {review.userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-3">
                      <p className="font-medium">{review.userName}</p>
                      <div className="flex items-center mt-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={i < review.rating
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300"
                            }
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic mb-8">No reviews yet. Be the first to review this product!</p>
        )}

        {/* Review Form */}
        <div className="mt-8 bg-gray-50 p-6 rounded-lg">
          <ReviewForm productId={Number(product.id)} onReviewAdded={handleReviewAdded} />
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
