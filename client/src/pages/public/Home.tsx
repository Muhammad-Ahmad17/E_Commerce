import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getRecommendedProducts } from '@/services/api';
import ProductCard from '@/components/ProductCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/hooks/useAuth';

type Product = {
  productId: string;
  productName: string;
  price: number;
  imageUrl: string;
  categoryName: string;
};

const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token, user } = useAuth();


  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 py-20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 md:pr-12">
            <h1 className="text-5xl font-extrabold text-gray-900 mb-6 leading-tight drop-shadow">
              Welcome to <span className="text-indigo-600">EShop</span>
            </h1>
            <p className="text-xl text-gray-700 mb-8">
              {user?.role === 'vendor'
                ? "Grow your business by selling to thousands of customers. Manage your products, view orders, and track your sales easily."
                : "Discover trendy clothing for men, women, and kids. Quality fashion at affordable prices."}
            </p>
            <div className="flex flex-wrap gap-4">
              {!token && (
                <>
                  <Link to="/register">
                    <Button size="lg" className="shadow-md">Sign Up</Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="outline" size="lg" className="shadow-md">Login</Button>
                  </Link>
                </>
              )}
              {token && user?.role === 'buyer' && (
                <Link to="/buyer/dashboard">
                  <Button variant="outline" size="lg" className="shadow-md">Go to Dashboard</Button>
                </Link>
              )}
              {token && user?.role === 'vendor' && (
                <Link to="/vendor/dashboard">
                  <Button variant="outline" size="lg" className="shadow-md">Vendor Dashboard</Button>
                </Link>
              )}
            </div>
          </div>
          <div className="md:w-1/2 mt-12 md:mt-0 flex justify-center">
            <img
              src="/images/fashioncollectionPlaceholder.webp"
              alt="Fashion Collection"
              className="rounded-2xl shadow-2xl w-full max-w-md object-cover"
            />
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none" />
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Shop by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <Link to="/buyer/dashboard?category=female" className="group">
              <div className="relative overflow-hidden rounded-2xl h-80 shadow-lg">
                <img
                  src="/images/womenPlaceholder.webp"
                  alt="Women's Fashion"
  style={{ width: 'auto', height: 'auto', objectFit: 'contain' }} 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                  <h3 className="text-white text-2xl font-bold">Women's Collection</h3>
                </div>
              </div>
            </Link>
            <Link to="/buyer/dashboard?category=male" className="group">
              <div className="relative overflow-hidden rounded-2xl h-80 shadow-lg">
                <img
                  src="/images/menPlaceholder.webp"
                  alt="Men's Fashion"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  style={{ width: '100%', height: 'auto', objectFit: 'contain' }} 

                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                  <h3 className="text-white text-2xl font-bold">Men's Collection</h3>
                </div>
              </div>
            </Link>
            <Link to="/buyer/dashboard?category=children" className="group">
              <div className="relative overflow-hidden rounded-2xl h-80 shadow-lg">
                <img
                  src="/images/kidPlaceholder.webp"
                  alt="Kids' Fashion"
                    style={{ width: '100%', height: 'auto', objectFit: 'contain' }} 

                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                  <h3 className="text-white text-2xl font-bold">Kids' Collection</h3>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Vendor Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-12">
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold mb-6 text-indigo-700">Are you a Vendor?</h2>
              <p className="text-lg text-gray-700 mb-8">
                Join EShop as a vendor and reach thousands of customers. List your products, manage orders, and grow your business with our easy-to-use dashboard.
              </p>
              {!token || user?.role !== 'vendor' ? (
                <Link to="/register">
                  <Button size="lg" className="shadow-md">Become a Vendor</Button>
                </Link>
              ) : (
                <Link to="/vendor/dashboard">
                  <Button variant="outline" size="lg" className="shadow-md">Go to Vendor Dashboard</Button>
                </Link>
              )}
            </div>
            <div className="md:w-1/2 flex justify-center">
              <img
                src="/images/vendorbannerPlaceholder.webp"
                alt="Vendor Banner"
                className="rounded-2xl shadow-2xl w-full max-w-md object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
