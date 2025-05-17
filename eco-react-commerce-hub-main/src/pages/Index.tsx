
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// This page is only a redirect to the new home page
const Index: React.FC = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/');
  }, [navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Redirecting to homepage...</p>
    </div>
  );
};

export default Index;
