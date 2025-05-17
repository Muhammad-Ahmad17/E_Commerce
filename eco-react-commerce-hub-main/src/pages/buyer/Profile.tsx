import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { getBuyerProfile } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { Button } from "@/components/ui/button";
import { toast } from '@/components/ui/use-toast';

type BuyerProfile = {
  id: string;
  fullName: string;
  email: string;
  preferences: string;
  addressLine1: string;
  city: string;
  postalCode: string;
  country: string;
};

type FormData = Omit<BuyerProfile, 'id' | 'email'>;

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<BuyerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getBuyerProfile();
        console.log('Profile API response:', response);

        const data = response.data;

        // Split address into parts (very basic split, adjust as needed)
        const [addressLine1 = '', city = '', postalCode = '', country = ''] =
          (data.address || '').split(',').map(s => s.trim());

        // Map API response to your form and profile state
        const mappedProfile = {
          id: '', // If you have an id, set it here
          fullName: data.fullName || '',
          email: data.emailAddress || '',
          preferences: data.preferences || '',
          addressLine1,
          city,
          postalCode,
          country,
        };
        setProfile(mappedProfile);
        //setProfile(response.data);
        reset({
          fullName: mappedProfile.fullName,
          preferences: mappedProfile.preferences,
          addressLine1: mappedProfile.addressLine1,
          city: mappedProfile.city,
          postalCode: mappedProfile.postalCode,
          country: mappedProfile.country,
        });
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [reset]);

  const onSubmit = async (data: FormData) => {
    console.log(data);
    setIsSubmitting(true);
    try {
      // API endpoint for updating profile doesn't exist in the requirements, 
      // so we'll just simulate a successful update
      setProfile({ ...profile!, ...data });
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
    } catch (err: any) {
      toast({
        title: 'Update failed',
        description: err.response?.data?.message || 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage message={error || 'Profile data not found'} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand focus:border-brand"
                {...register('fullName', { required: 'Full Name is required' })}
              />
              {errors.fullName && (
                <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={profile.email}
                disabled
                className="w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label htmlFor="preferences" className="block text-sm font-medium text-gray-700 mb-1">
                Preferences
              </label>
              <select
                id="preferences"
                className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand focus:border-brand"
                {...register('preferences', { required: 'Preferences is required' })}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="children">Children</option>
              </select>
            </div>

            <div>
              <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                id="addressLine1"
                type="text"
                className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand focus:border-brand"
                {...register('addressLine1', { required: 'Address is required' })}
              />
              {errors.addressLine1 && (
                <p className="text-red-500 text-xs mt-1">{errors.addressLine1.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  id="city"
                  type="text"
                  className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand focus:border-brand"
                  {...register('city', { required: 'City is required' })}
                />
                {errors.city && (
                  <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Postal Code
                </label>
                <input
                  id="postalCode"
                  type="text"
                  className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand focus:border-brand"
                  {...register('postalCode', { required: 'Postal Code is required' })}
                />
                {errors.postalCode && (
                  <p className="text-red-500 text-xs mt-1">{errors.postalCode.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <input
                  id="country"
                  type="text"
                  className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand focus:border-brand"
                  {...register('country', { required: 'Country is required' })}
                />
                {errors.country && (
                  <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>
                )}
              </div>
            </div>

            <div className="pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <LoadingSpinner size="small" /> : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
