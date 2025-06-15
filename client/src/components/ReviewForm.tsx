import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { addProductReview } from '@/services/api';
import { toast } from '@/components/ui/use-toast';

type ReviewFormProps = {
  productId: number;
  onReviewAdded: () => void;
};

type FormData = {
  rating: number;
  comment: string;
};

const ReviewForm: React.FC<ReviewFormProps> = ({ productId, onReviewAdded }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      await addProductReview({
        productId,
        rating: Number(data.rating),
        comment: data.comment,
      });
      toast({
        title: 'Success',
        description: 'Your review has been submitted',
      });
      reset();
      onReviewAdded();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to submit review',
        variant: 'destructive',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h3 className="text-lg font-medium">Write a Review</h3>
      <div className="space-y-2">
        <label htmlFor="rating" className="block text-sm font-medium">
          Rating (1-5)
        </label>
        <select
          id="rating"
          className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand focus:border-brand"
          {...register('rating', { required: 'Rating is required' })}
        >
          <option value="">Select Rating</option>
          <option value="1">1 - Poor</option>
          <option value="2">2 - Fair</option>
          <option value="3">3 - Good</option>
          <option value="4">4 - Very Good</option>
          <option value="5">5 - Excellent</option>
        </select>
        {errors.rating && (
          <p className="text-red-500 text-sm">{errors.rating.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="comment" className="block text-sm font-medium">
          Comment
        </label>
        <textarea
          id="comment"
          rows={4}
          className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand focus:border-brand"
          placeholder="Share your thoughts about the product"
          {...register('comment', { required: 'Comment is required' })}
        />
        {errors.comment && (
          <p className="text-red-500 text-sm">{errors.comment.message}</p>
        )}
      </div>

      <Button type="submit" className="mt-3">
        Submit Review
      </Button>
    </form>
  );
};

export default ReviewForm;
