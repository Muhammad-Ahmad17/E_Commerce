import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getRecommendedProducts, getProductsByCategory } from '@/services/api';
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
  description?: string;
  vendorName?: string;
};

const BuyerDashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const location = useLocation();
  
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const category = queryParams.get('category');
    
    if (category) {
      setActiveCategory(category);
      fetchProductsByCategory(category);
    } else {
      setActiveCategory('all');
      fetchRecommendedProducts();
    }
  }, [location.search]);
  
  const fetchRecommendedProducts = async () => {
    setLoading(true);
    try {
      const response = await getRecommendedProducts();
      console.log('Recommended Products API response:', response);

      // Map API response to Product type expected by ProductCard
const mappedProducts = (response.data || []).map((item: any, idx: number) => ({
  id: item.productId?.toString() || idx.toString(),
  name: item.productName,
  price: item.price,
  imageUrl: item.imageUrl || '',
  category: item.categoryName,
  description: item.description,
  vendorName: item.vendorName,
}));

      setProducts(mappedProducts);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchProductsByCategory = async (category: string) => {
    setLoading(true);
    try {
      const response = await getProductsByCategory(category);
      console.log('Products by Category API response:', response);
      console.log('Category:', category);
      // Map API response to Product type expected by ProductCard
      const mappedProducts = (response.data || []).map((item: any, idx: number) => ({
        id: item.productId?.toString() || idx.toString(), // Use productId from API
        name: item.productName,
        price: item.price,
        imageUrl: item.imageUrl || '',
        category: item.categoryName,
        description: item.description,
        vendorName: item.vendorName, // <-- add this line!

      }));

      setProducts(mappedProducts);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCategoryChange = (category: string) => {
    const newUrl = category === 'all' 
      ? '/buyer/dashboard'
      : `/buyer/dashboard?category=${category}`;
    
    window.history.pushState({}, '', newUrl);
    
    if (category === 'all') {
      fetchRecommendedProducts();
    } else {
      fetchProductsByCategory(category);
    }
    
    setActiveCategory(category);
  };
  
  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Browse Products</h1>
        
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Button 
            onClick={() => handleCategoryChange('all')}
            variant={activeCategory === 'all' ? 'default' : 'outline'}
          >
            All Products
          </Button>
          <Button 
            onClick={() => handleCategoryChange('female')}
            variant={activeCategory === 'female' ? 'default' : 'outline'}
          >
            Women's
          </Button>
          <Button 
            onClick={() => handleCategoryChange('male')}
            variant={activeCategory === 'male' ? 'default' : 'outline'}
          >
            Men's
          </Button>
          <Button 
            onClick={() => handleCategoryChange('children')}
            variant={activeCategory === 'children' ? 'default' : 'outline'}
          >
            Kids'
          </Button>
        </div>
        
        {/* Search and Sort (UI only for now) */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-brand"
            />
          </div>
          <div>
            <select className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-brand">
              <option value="popularity">Sort by Popularity</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>
        
        
        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="large" />
          </div>
        ) : error ? (
          <ErrorMessage message={error} />
        ) : (
          <>
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    imageUrl={product.imageUrl}
                    category={product.category}
                    description={product.description}
                    vendorName={product.vendorName}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <h3 className="text-xl font-medium text-gray-500">No products found</h3>
                <p className="mt-2 text-gray-500">Try changing category or search term</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BuyerDashboard;
