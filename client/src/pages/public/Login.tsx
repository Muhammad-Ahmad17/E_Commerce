import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { loginUser } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';
import { Button } from "@/components/ui/button";
import LoadingSpinner from '@/components/LoadingSpinner';

type FormData = {
  email: string;
  password: string;
};

const Login: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const response = await loginUser({
        email: data.email,
        password: data.password,
      });
      console.log('Login API response:', response);

      // Map backend response to your UserType
      const userData = {
        id: response.data.userId,
        fullName: response.data.fullName || '', // or handle as needed
        email: response.data.email,
        role: response.data.role,
        preferences: response.data.preferences, // if exists
        vendorName: response.data.vendorName,   // if exists
      };
      const token = response.data.token;

      login(userData, token);

      toast({
        title: 'Login successful!',
        description: `Welcome back, ${userData.email}`,
      });
    } catch (error: any) {
      console.log('Login error:', error);
      toast({
        title: 'Login failed',
        description: error.response?.data?.message || 'Invalid email or password',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="py-8 px-6">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Login to Your Account</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  id="email"
                  type="email"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-brand focus:ring focus:ring-brand focus:ring-opacity-50"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Invalid email format'
                    }
                  })}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                  <a href="#" className="text-xs text-brand hover:text-purple-700">Forgot password?</a>
                </div>
                <input
                  id="password"
                  type="password"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-brand focus:ring focus:ring-brand focus:ring-opacity-50"
                  {...register('password', { required: 'Password is required' })}
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <LoadingSpinner size="small" /> : 'Login'}
              </Button>

              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link to="/register" className="font-medium text-brand hover:underline">
                    Register
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
