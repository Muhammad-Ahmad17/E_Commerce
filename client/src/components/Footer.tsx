import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const Footer: React.FC = () => {
  const { user } = useAuth();

  // Determine links and content based on role
  let quickLinks = [
    { to: '/', label: 'Home' },
    { to: '/buyer/dashboard', label: 'Shop' },
    { to: '/login', label: 'Login' },
    { to: '/register', label: 'Register' },
  ];
  let categories = [
    { to: '/buyer/dashboard?category=female', label: "Women's Clothing" },
    { to: '/buyer/dashboard?category=male', label: "Men's Clothing" },
    { to: '/buyer/dashboard?category=children', label: "Kids' Clothing" },
  ];
  let contactTitle = "Contact";
  let contactDetails = (
    <>
      <p>COMSATS University Islamabad</p>
      <p>FA23-BCE(B)</p>
      <p className="mt-3">Email: <a href="mailto:fa23-bce-113@cuilahore.edu.pk" className="hover:text-indigo-700">fa23-bce-113@cuilahore.edu.pk</a></p>
      <p>Phone: <a href="tel:+923371479474" className="hover:text-indigo-700">+92-3371479474</a></p>
    </>
  );

  if (user?.role === 'vendor') {
    quickLinks = [
      { to: '/', label: 'Home' },
      { to: '/vendor/dashboard', label: 'Vendor Dashboard' },
      { to: '/vendor/products', label: 'My Products' },
      { to: '/vendor/orders', label: 'Orders' },
    ];
    categories = [
      { to: '/vendor/dashboard', label: "Dashboard" },
      { to: '/vendor/products', label: "Products" },
      { to: '/vendor/orders', label: "Orders" },
    ];
    contactTitle = "Vendor Support";
    contactDetails = (
      <>
        <p>Vendor Help Desk</p>
        <p>Email: <a href="mailto:vendor-support@eshop.com" className="hover:text-indigo-700">vendor-support@eshop.com</a></p>
        <p>Phone: <a href="tel:+923371479474" className="hover:text-indigo-700">+92-3371479474</a></p>
      </>
    );
  }

  return (
    <footer className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 pt-10 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4 text-indigo-700">EShop</h3>
            <p className="text-gray-600 mb-4">
              {user?.role === 'vendor'
                ? "Manage your products, view orders, and grow your business with EShop."
                : "Your one-stop shop for all your clothing needs. Quality products at affordable prices."
              }
            </p>
            <div className="flex space-x-4 mt-2">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <svg className="w-6 h-6 text-indigo-500 hover:text-indigo-700" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 4.991 3.657 9.128 8.438 9.877v-6.987h-2.54v-2.89h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.261c-1.243 0-1.632.771-1.632 1.562v1.875h2.773l-.443 2.89h-2.33v6.987C18.343 21.128 22 16.991 22 12"/></svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <svg className="w-6 h-6 text-indigo-500 hover:text-indigo-700" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.58-2.47.69a4.3 4.3 0 0 0 1.88-2.37 8.59 8.59 0 0 1-2.72 1.04A4.28 4.28 0 0 0 16.11 4c-2.37 0-4.29 1.92-4.29 4.29 0 .34.04.67.11.99C7.69 9.13 4.07 7.38 1.64 4.7c-.37.63-.58 1.36-.58 2.14 0 1.48.75 2.78 1.89 3.54-.7-.02-1.36-.21-1.94-.53v.05c0 2.07 1.47 3.8 3.42 4.19-.36.1-.74.16-1.13.16-.28 0-.54-.03-.8-.08.54 1.69 2.11 2.92 3.97 2.95A8.6 8.6 0 0 1 2 19.54a12.13 12.13 0 0 0 6.56 1.92c7.88 0 12.2-6.53 12.2-12.2 0-.19 0-.39-.01-.58A8.72 8.72 0 0 0 24 4.59a8.48 8.48 0 0 1-2.54.7z"/></svg>
              </a>
              <a href="https://github.com/your-github-profile" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <svg className="w-6 h-6 text-indigo-500 hover:text-indigo-700" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.426 2.865 8.184 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.337 4.695-4.566 4.944.359.309.678.919.678 1.852 0 1.336-.012 2.417-.012 2.747 0 .267.18.577.688.48C19.138 20.2 22 16.447 22 12.021 22 6.484 17.523 2 12 2z"/></svg>
              </a>
              <a href="https://linkedin.com/in/your-linkedin-profile" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <svg className="w-6 h-6 text-indigo-500 hover:text-indigo-700" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-9h3v9zm-1.5-10.29c-.97 0-1.75-.79-1.75-1.76 0-.97.78-1.75 1.75-1.75s1.75.78 1.75 1.75c0 .97-.78 1.76-1.75 1.76zm13.5 10.29h-3v-4.5c0-1.08-.02-2.47-1.5-2.47-1.5 0-1.73 1.17-1.73 2.39v4.58h-3v-9h2.89v1.23h.04c.4-.75 1.38-1.54 2.84-1.54 3.04 0 3.6 2 3.6 4.59v4.72z"/></svg>
              </a>
              <a href="mailto:fa23-bce-113@cuilahore.edu.pk" aria-label="Email">
                <svg className="w-6 h-6 text-indigo-500 hover:text-indigo-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16v16H4z" stroke="none"/><polyline points="22,6 12,13 2,6" /></svg>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-indigo-700">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-gray-600 hover:text-indigo-700">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-indigo-700">Categories</h3>
            <ul className="space-y-2">
              {categories.map(cat => (
                <li key={cat.to}>
                  <Link to={cat.to} className="text-gray-600 hover:text-indigo-700">{cat.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-indigo-700">{contactTitle}</h3>
            <address className="text-gray-600 not-italic">
              {contactDetails}
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
