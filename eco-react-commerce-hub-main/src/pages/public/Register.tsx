
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '@/services/api';
import { toast } from '@/components/ui/use-toast';
import { Button } from "@/components/ui/button";
import LoadingSpinner from '@/components/LoadingSpinner';

type FormData = {
  fullName: string;
  email: string;
  password: string;
  role: 'buyer' | 'vendor';
  preferences?: string;
  vendorName?: string;
  addressLine1: string;
  city: string;
  postalCode: string;
  country: string;
};

const Register: React.FC = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>();
  const navigate = useNavigate();
  const role = watch('role');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await registerUser(data);
      toast({
        title: 'Registration successful!',
        description: 'You can now login with your credentials.',
      });
      navigate('/login');
    } catch (error: any) {
      toast({
        title: 'Registration failed',
        description: error.response?.data?.message || 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-10">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="py-4 px-6">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Create Account</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  id="fullName"
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-brand focus:ring focus:ring-brand focus:ring-opacity-50"
                  {...register('fullName', { required: 'Full Name is required' })}
                />
                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
              </div>

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
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  id="password"
                  type="password"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-brand focus:ring focus:ring-brand focus:ring-opacity-50"
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters'
                    }
                  })}
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                <select
                  id="role"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-brand focus:ring focus:ring-brand focus:ring-opacity-50"
                  {...register('role', { required: 'Role is required' })}
                >
                  <option value="">Select role</option>
                  <option value="buyer">Buyer</option>
                  <option value="vendor">Vendor</option>
                </select>
                {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>}
              </div>

              {role === 'buyer' && (
                <div>
                  <label htmlFor="preferences" className="block text-sm font-medium text-gray-700">Preferences</label>
                  <select
                    id="preferences"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-brand focus:ring focus:ring-brand focus:ring-opacity-50"
                    {...register('preferences', { required: 'Preferences is required for buyers' })}
                  >
                    <option value="">Select preference</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="children">Children</option>
                  </select>
                  {errors.preferences && <p className="text-red-500 text-xs mt-1">{errors.preferences.message}</p>}
                </div>
              )}

              {role === 'vendor' && (
                <div>
                  <label htmlFor="vendorName" className="block text-sm font-medium text-gray-700">Vendor Name</label>
                  <input
                    id="vendorName"
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-brand focus:ring focus:ring-brand focus:ring-opacity-50"
                    placeholder="Enter your store name"
                    {...register('vendorName', { required: 'Vendor name is required for vendors' })}
                  />
                  {errors.vendorName && <p className="text-red-500 text-xs mt-1">{errors.vendorName.message}</p>}
                </div>
              )}

              <div>
                <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700">Address</label>
                <input
                  id="addressLine1"
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-brand focus:ring focus:ring-brand focus:ring-opacity-50"
                  {...register('addressLine1', { required: 'Address is required' })}
                />
                {errors.addressLine1 && <p className="text-red-500 text-xs mt-1">{errors.addressLine1.message}</p>}
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                <input
                  id="city"
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-brand focus:ring focus:ring-brand focus:ring-opacity-50"
                  {...register('city', { required: 'City is required' })}
                />
                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
              </div>

              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">Postal Code</label>
                <input
                  id="postalCode"
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-brand focus:ring focus:ring-brand focus:ring-opacity-50"
                  {...register('postalCode', { required: 'Postal Code is required' })}
                />
                {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode.message}</p>}
              </div>

              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
                <input
                  id="country"
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-brand focus:ring focus:ring-brand focus:ring-opacity-50"
                  {...register('country', { required: 'Country is required' })}
                />
                {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <LoadingSpinner size="small" /> : 'Register'}
              </Button>

              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link to="/login" className="font-medium text-brand hover:underline">
                    Login
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

export default Register;
