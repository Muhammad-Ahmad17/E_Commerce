import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getProductDetails, getReviewsByProduct } from '@/services/api';
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
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  // Fetch product details
  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const response = await getProductDetails(id);
        const data = response.data;
        console.log('Product details response:', data);
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
          reviews: [],
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

  // Move fetchReviews outside useEffect so it can be reused
  const fetchReviews = async () => {
    if (!id) return;
    try {
      const response = await getReviewsByProduct(id);
      console.log('Reviews response:', response);
      const mappedReviews = (response.data || []).map((r: any) => ({
        id: r.reviewId?.toString(),
        userId: r.buyerId?.toString() || '',
        userName: r.reviewerName || 'Anonymous',
        rating: r.rating,
        comment: r.comment,
        createdAt: r.reviewDate,
      }));
      setReviews(mappedReviews);
    } catch (err) {
      setReviews([]);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [id]);

  // Now handleReviewAdded can call fetchReviews
  const handleReviewAdded = async () => {
    await fetchReviews();
    toast({
      title: 'Review added',
      description: 'Your review has been added successfully.',
    });
  };

  const handleAddToCart = () => {
    if (!product) return;
    addItem(Number(product.id), quantity);
  };

  const handleQuantityChange = (value: number) => {
    if (product && value >= 1 && value <= product.stock) {
      setQuantity(value);
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
      {/* Product Details Card */}
      <div className="flex flex-col md:flex-row gap-8 bg-white rounded-xl shadow-lg p-8">
        {/* Product Image */}
        <div className="md:w-1/2 flex items-center justify-center">
          <img
            src={product.imageUrl || "https://placehold.co/600x800?text=Product"}
            alt={product.name}
            className="w-full max-w-xs h-auto object-cover rounded-lg border border-gray-200 shadow"
          />
        </div>

        {/* Product Info */}
        <div className="md:w-1/2 space-y-6">
          <div>
            <span className="text-xs font-semibold text-white bg-brand px-3 py-1 rounded-full shadow-sm">
              {product.category}
            </span>
            <h1 className="text-4xl font-bold mt-3 mb-1">{product.name}</h1>
            <p className="text-gray-500 mb-2">by <span className="font-semibold text-brand">{product.vendorName}</span></p>
            <div className="flex items-center mt-2">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className={i < Math.round(product.averageRating)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                    }
                  />
                ))}
              </div>
              <span className="ml-3 text-gray-600 text-sm">
                {product.averageRating ? product.averageRating.toFixed(1) : "No ratings yet"} ({product.reviewCount} reviews)
              </span>
            </div>
          </div>

          <div className="text-3xl font-bold text-brand">${product.price.toFixed(2)}</div>

          <div className="border-t border-b border-gray-100 py-4">
            <p className="text-gray-700">{product.description}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">
              <span className={product.stock > 0 ? "text-green-600" : "text-red-500"}>
                {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
              </span>
            </p>

            {product.stock > 0 && (
              <div className="flex items-center space-x-3 mt-4">
                <div className="border rounded-lg flex items-center bg-gray-50">
                  <button
                    className="px-3 py-1 text-lg font-bold text-gray-600 hover:text-brand"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                  >
                    <Minus size={18} />
                  </button>
                  <span className="px-4 py-1 border-l border-r text-lg">{quantity}</span>
                  <button
                    className="px-3 py-1 text-lg font-bold text-gray-600 hover:text-brand"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= product.stock}
                  >
                    <Plus size={18} />
                  </button>
                </div>
                <Button onClick={handleAddToCart} className="flex-1 text-lg py-2 rounded-lg shadow bg-brand hover:bg-brand-dark transition">
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
        <div className="bg-white rounded-xl shadow p-6">
          {/* Review List */}
          {reviews && reviews.length > 0 ? (
            <div className="space-y-8">
              {reviews.map((review) => (
                <div key={review.id} className="flex items-start gap-4 border-b last:border-b-0 pb-6">
                  <div className="h-12 w-12 rounded-full bg-brand flex items-center justify-center text-white font-bold text-xl shadow">
                    {review.userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{review.userName}</p>
                        <div className="flex items-center mt-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className={i < review.rating
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                              }
                            />
                          ))}
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic mb-8">No reviews yet. Be the first to review this product!</p>
          )}

          {/* Review Form */}
          <div className="mt-10 bg-gray-50 p-6 rounded-lg border">
            <ReviewForm productId={Number(product.id)} onReviewAdded={handleReviewAdded} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
