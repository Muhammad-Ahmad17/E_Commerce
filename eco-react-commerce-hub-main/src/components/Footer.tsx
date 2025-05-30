
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 pt-10 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">EShop</h3>
            <p className="text-gray-600">
              Your one-stop shop for all your clothing needs. Quality products at affordable prices.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-brand">Home</Link>
              </li>
              <li>
                <Link to="/buyer/dashboard" className="text-gray-600 hover:text-brand">Shop</Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-600 hover:text-brand">Login</Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-600 hover:text-brand">Register</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/buyer/dashboard?category=female" className="text-gray-600 hover:text-brand">Women's Clothing</Link>
              </li>
              <li>
                <Link to="/buyer/dashboard?category=male" className="text-gray-600 hover:text-brand">Men's Clothing</Link>
              </li>
              <li>
                <Link to="/buyer/dashboard?category=children" className="text-gray-600 hover:text-brand">Kids' Clothing</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <address className="text-gray-600 not-italic">
              <p>COMSATS University Islamabad</p>
              <p>FA23-BCE(B)</p>
              <p className="mt-3">Email: fa23-bce-113@cuilahore.edu.pk</p>
              <p>Phone: +92-3371479474</p>
            </address>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-6">
          <p className="text-center text-gray-600 text-sm">
            &copy; {new Date().getFullYear()} EShop. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
