
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getRecommendedProducts } from '@/services/api';
import ProductCard from '@/components/ProductCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { Button } from "@/components/ui/button";

type Product = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
};

const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await getRecommendedProducts();
        setFeaturedProducts(response.data.data || []);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch featured products');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-100 to-indigo-100 py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 md:pr-10">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Find Your Perfect Style with EShopify
              </h1>
              <p className="mt-4 text-xl text-gray-700">
                Discover trendy clothing for men, women, and kids. Quality fashion at affordable prices.
              </p>
              <div className="mt-8">
                <Link to="/register">
                  <Button className="mr-4">Sign Up Now</Button>
                </Link>
                <Link to="/buyer/dashboard">
                  <Button variant="outline">Explore Collection</Button>
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 mt-10 md:mt-0">
              <img 
                src="https://placehold.co/600x400?text=Fashion+Collection" 
                alt="Fashion Collection" 
                className="rounded-lg shadow-lg w-full" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Featured Products</h2>
          
          {loading ? (
            <div className="flex justify-center py-10">
              <LoadingSpinner size="large" />
            </div>
          ) : error ? (
            <ErrorMessage message={error} />
          ) : (
            <>
              {featuredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {featuredProducts.slice(0, 8).map((product) => (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      name={product.name}
                      price={product.price}
                      imageUrl={product.imageUrl}
                      category={product.category}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500">No featured products available.</p>
              )}

              <div className="text-center mt-10">
                <Link to="/buyer/dashboard">
                  <Button>View All Products</Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Shop by Category</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link to="/buyer/dashboard?category=female" className="group">
              <div className="relative overflow-hidden rounded-lg h-80">
                <img 
                  src="https://placehold.co/600x800?text=Women's+Fashion" 
                  alt="Women's Fashion"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                  <h3 className="text-white text-2xl font-bold">Women's Collection</h3>
                </div>
              </div>
            </Link>
            
            <Link to="/buyer/dashboard?category=male" className="group">
              <div className="relative overflow-hidden rounded-lg h-80">
                <img 
                  src="https://placehold.co/600x800?text=Men's+Fashion" 
                  alt="Men's Fashion"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                  <h3 className="text-white text-2xl font-bold">Men's Collection</h3>
                </div>
              </div>
            </Link>
            
            <Link to="/buyer/dashboard?category=children" className="group">
              <div className="relative overflow-hidden rounded-lg h-80">
                <img 
                  src="https://placehold.co/600x800?text=Kids'+Fashion" 
                  alt="Kids' Fashion"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                  <h3 className="text-white text-2xl font-bold">Kids' Collection</h3>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
