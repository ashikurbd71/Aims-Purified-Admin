import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import useAxiosSecure from '@/hooks/useAxiosSecure';
import { toast } from 'sonner';
import ButtonLoader from '@/components/global/ButtonLoader';

const SliderCreateForm = ({ refetch, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const axiosSecure = useAxiosSecure();

  const validationSchema = Yup.object({
    title: Yup.string().required('Title is required'),
    description: Yup.string().required('Description is required'),
    imageUrl: Yup.string().url('Must be a valid URL').required('Image URL is required'),
    rating: Yup.number().min(0).max(5).optional(),
    link: Yup.string().url('Must be a valid URL').optional(),
    price: Yup.number().required('Price is required').min(0),
    offer: Yup.number().min(0).optional(),
    order: Yup.number().min(0).optional(),
  });

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      imageUrl: '',
      rating: 0,
      link: '',
      price: 0,
      offer: 0,
      order: 0,
      isActive: true,
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        const response = await axiosSecure.post('/slider', values);

        if (response?.status === 201) {
          toast.success('Slider created successfully!');
          handleReset();
          refetch();
          if (onClose) onClose();
        }
      } catch (error) {
        console.error('Error creating slider:', error);
        toast.error('Failed to create slider. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const handleReset = () => {
    formik.resetForm();
  };

  return (
    <div>
      <form onSubmit={formik.handleSubmit} className='space-y-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {/* Title */}
          <div>
            <Label htmlFor='title' className='text-sm font-medium'>
              Title<span className='text-red-500'>*</span>
            </Label>
            <Input
              id='title'
              name='title'
              type='text'
              placeholder='Enter title'
              className='mt-1'
              {...formik.getFieldProps('title')}
            />
            {formik.touched.title && formik.errors.title && (
              <p className='text-red-500 text-sm mt-1'>{formik.errors.title}</p>
            )}
          </div>

          {/* Image URL */}
          <div>
            <Label htmlFor='imageUrl' className='text-sm font-medium'>
              Image URL<span className='text-red-500'>*</span>
            </Label>
            <Input
              id='imageUrl'
              name='imageUrl'
              type='text'
              placeholder='Enter image URL'
              className='mt-1'
              {...formik.getFieldProps('imageUrl')}
            />
            {formik.touched.imageUrl && formik.errors.imageUrl && (
              <p className='text-red-500 text-sm mt-1'>{formik.errors.imageUrl}</p>
            )}
          </div>

          {/* Price */}
          <div>
            <Label htmlFor='price' className='text-sm font-medium'>
              Price<span className='text-red-500'>*</span>
            </Label>
            <Input
              id='price'
              name='price'
              type='number'
              placeholder='Enter price'
              className='mt-1'
              {...formik.getFieldProps('price')}
            />
            {formik.touched.price && formik.errors.price && (
              <p className='text-red-500 text-sm mt-1'>{formik.errors.price}</p>
            )}
          </div>

          {/* Offer */}
          <div>
            <Label htmlFor='offer' className='text-sm font-medium'>
              Offer Price
            </Label>
            <Input
              id='offer'
              name='offer'
              type='number'
              placeholder='Enter offer price'
              className='mt-1'
              {...formik.getFieldProps('offer')}
            />
            {formik.touched.offer && formik.errors.offer && (
              <p className='text-red-500 text-sm mt-1'>{formik.errors.offer}</p>
            )}
          </div>

          {/* Rating */}
          <div>
            <Label htmlFor='rating' className='text-sm font-medium'>
              Rating
            </Label>
            <Input
              id='rating'
              name='rating'
              type='number'
              step='0.1'
              min='0'
              max='5'
              placeholder='Enter rating (0-5)'
              className='mt-1'
              {...formik.getFieldProps('rating')}
            />
            {formik.touched.rating && formik.errors.rating && (
              <p className='text-red-500 text-sm mt-1'>{formik.errors.rating}</p>
            )}
          </div>

          {/* Order */}
          <div>
            <Label htmlFor='order' className='text-sm font-medium'>
              Display Order
            </Label>
            <Input
              id='order'
              name='order'
              type='number'
              placeholder='Enter display order'
              className='mt-1'
              {...formik.getFieldProps('order')}
            />
            {formik.touched.order && formik.errors.order && (
              <p className='text-red-500 text-sm mt-1'>{formik.errors.order}</p>
            )}
          </div>
        </div>

        {/* Link */}
        <div>
          <Label htmlFor='link' className='text-sm font-medium'>
            Link (Optional)
          </Label>
          <Input
            id='link'
            name='link'
            type='text'
            placeholder='Enter link URL'
            className='mt-1'
            {...formik.getFieldProps('link')}
          />
          {formik.touched.link && formik.errors.link && (
            <p className='text-red-500 text-sm mt-1'>{formik.errors.link}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <Label htmlFor='description' className='text-sm font-medium'>
            Description<span className='text-red-500'>*</span>
          </Label>
          <textarea
            rows={4}
            id='description'
            name='description'
            placeholder='Enter description'
            className='mt-1 w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            {...formik.getFieldProps('description')}
          />
          {formik.touched.description && formik.errors.description && (
            <p className='text-red-500 text-sm mt-1'>{formik.errors.description}</p>
          )}
        </div>

        {/* Buttons */}
        <div className='flex flex-col items-center gap-2 space-y-3 justify-between space-x-4'>
          <Button
            type='submit'
            className='w-full lg:w-48'
            disabled={isSubmitting}
          >
            {isSubmitting ? <ButtonLoader /> : 'Create Slider'}
          </Button>
          <Button
            type='button'
            variant='secondary'
            onClick={handleReset}
            className='w-full lg:w-48'
            disabled={isSubmitting}
          >
            Reset
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SliderCreateForm;
