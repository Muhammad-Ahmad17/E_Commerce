
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, Menu, X, LogOut } from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { totalItems } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-brand">EShopify</Link>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={toggleMenu}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <ul className="flex space-x-8 items-center">
              <li>
                <Link to="/" className="text-gray-700 hover:text-brand">Home</Link>
              </li>
              {isAuthenticated ? (
                <>
                  {user?.role === 'buyer' && (
                    <>
                      <li>
                        <Link to="/buyer/dashboard" className="text-gray-700 hover:text-brand">Shop</Link>
                      </li>
                      <li>
                        <Link to="/buyer/orders" className="text-gray-700 hover:text-brand">Orders</Link>
                      </li>
                    </>
                  )}
                  {user?.role === 'vendor' && (
                    <>
                      <li>
                        <Link to="/vendor/dashboard" className="text-gray-700 hover:text-brand">Dashboard</Link>
                      </li>
                      <li>
                        <Link to="/vendor/products" className="text-gray-700 hover:text-brand">Products</Link>
                      </li>
                      <li>
                        <Link to="/vendor/orders" className="text-gray-700 hover:text-brand">Orders</Link>
                      </li>
                    </>
                  )}
                </>
              ) : (
                <>
                  <li>
                    <Link to="/login" className="text-gray-700 hover:text-brand">Login</Link>
                  </li>
                  <li>
                    <Link to="/register" className="text-gray-700 hover:text-brand">Register</Link>
                  </li>
                </>
              )}
            </ul>
          </nav>

          {/* User controls */}
          <div className="hidden md:flex items-center space-x-6">
            {isAuthenticated && (
              <>
                <div className="text-sm text-gray-600">
                  Hello, {user?.fullName} ({user?.role})
                </div>
                
                {user?.role === 'buyer' && (
                  <Link to="/buyer/cart" className="relative">
                    <ShoppingCart className="text-gray-700 hover:text-brand" size={24} />
                    {totalItems > 0 && (
                      <span className="absolute -top-2 -right-2 bg-brand text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {totalItems}
                      </span>
                    )}
                  </Link>
                )}
                
                <div className="flex items-center space-x-4">
                  <Link to={`/${user?.role}/profile`}>
                    <User className="text-gray-700 hover:text-brand" size={24} />
                  </Link>
                  <Button onClick={logout} variant="ghost" size="sm">
                    <LogOut size={20} className="mr-2" /> Logout
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4">
            <ul className="flex flex-col space-y-4 pb-4">
              <li>
                <Link to="/" className="text-gray-700 hover:text-brand" onClick={toggleMenu}>Home</Link>
              </li>
              {isAuthenticated ? (
                <>
                  {user?.role === 'buyer' && (
                    <>
                      <li>
                        <Link to="/buyer/dashboard" className="text-gray-700 hover:text-brand" onClick={toggleMenu}>Shop</Link>
                      </li>
                      <li>
                        <Link to="/buyer/cart" className="text-gray-700 hover:text-brand flex items-center" onClick={toggleMenu}>
                          Cart <ShoppingCart size={18} className="ml-1" />
                          {totalItems > 0 && (
                            <span className="ml-1 bg-brand text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                              {totalItems}
                            </span>
                          )}
                        </Link>
                      </li>
                      <li>
                        <Link to="/buyer/orders" className="text-gray-700 hover:text-brand" onClick={toggleMenu}>Orders</Link>
                      </li>
                    </>
                  )}
                  {user?.role === 'vendor' && (
                    <>
                      <li>
                        <Link to="/vendor/dashboard" className="text-gray-700 hover:text-brand" onClick={toggleMenu}>Dashboard</Link>
                      </li>
                      <li>
                        <Link to="/vendor/products" className="text-gray-700 hover:text-brand" onClick={toggleMenu}>Products</Link>
                      </li>
                      <li>
                        <Link to="/vendor/orders" className="text-gray-700 hover:text-brand" onClick={toggleMenu}>Orders</Link>
                      </li>
                    </>
                  )}
                  <li>
                    <Link to={`/${user?.role}/profile`} className="text-gray-700 hover:text-brand flex items-center" onClick={toggleMenu}>
                      Profile <User size={18} className="ml-1" />
                    </Link>
                  </li>
                  <li>
                    <Button onClick={logout} variant="ghost" size="sm" className="flex items-center">
                      <LogOut size={18} className="mr-2" /> Logout
                    </Button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/login" className="text-gray-700 hover:text-brand" onClick={toggleMenu}>Login</Link>
                  </li>
                  <li>
                    <Link to="/register" className="text-gray-700 hover:text-brand" onClick={toggleMenu}>Register</Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
