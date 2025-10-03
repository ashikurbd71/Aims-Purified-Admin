import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FileUp } from 'lucide-react';
import useAxiosSecure from '@/hooks/useAxiosSecure';
import { toast } from 'sonner';
import ButtonLoader from '@/components/global/ButtonLoader';

const SliderCreateForm = ({ refetch, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
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

  // Handle image file change
  const handleImageChange = (event) => {
    const file = event.currentTarget.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      formik.setFieldValue('imageFile', file);
      // Clear the URL input when file is selected
      formik.setFieldValue('imageUrl', '');
      setUploadedImageUrl('');
    } else {
      setImagePreview(null);
      formik.setFieldValue('imageFile', null);
    }
  };

  // Upload image function
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axiosSecure.post('/upload/images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response?.status === 200 || response?.status === 201) {
        toast.success('Image uploaded successfully!');
        return response.data;
      } else {
        toast.error('Image upload failed: Invalid response');
        return null;
      }
    } catch (error) {
      console.error('Upload failed:', error.message || error);
      toast.error(
        'Image upload failed: ' +
        (error.response?.data?.message || 'Unknown error')
      );
      return null;
    }
  };

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      imageUrl: '',
      imageFile: null,
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
        let finalImageUrl = values.imageUrl;

        // If image file is selected, upload it first
        if (values.imageFile) {
          const uploadResult = await uploadImage(values.imageFile);
          if (uploadResult && uploadResult.url) {
            finalImageUrl = uploadResult.url;
          } else {
            toast.error('Failed to upload image. Please try again.');
            setIsSubmitting(false);
            return;
          }
        }

        // Create slider with the final image URL
        const sliderData = {
          ...values,
          imageUrl: finalImageUrl,
        };
        delete sliderData.imageFile; // Remove file from data

        const response = await axiosSecure.post('/slider', sliderData);

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
    setImagePreview(null);
    setUploadedImageUrl('');
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

        {/* Image Upload Section */}
        <div>
          <Label className='text-sm font-medium'>
            Slider Image<span className='text-red-500'>*</span>
          </Label>

          {/* File Upload Option */}
          <div className='mt-2'>
            <Label htmlFor='imageFile' className='block text-sm text-gray-600 mb-2'>
              Upload Image File
            </Label>
            <label
              htmlFor='imageFile'
              className='border border-dashed border-gray-300 p-6 rounded-md text-center cursor-pointer flex flex-col items-center justify-center gap-2'
            >
              <span className='bg-gray-200 dark:text-gray-800 p-3 rounded-full'>
                <FileUp />
              </span>
              <p>
                <span className='text-sm text-blue-600 font-medium'>
                  Click here
                </span>{' '}
                to upload your file or drag.
              </p>
              <span className='text-xs text-gray-500'>
                Supported Format: JPG, PNG, SVG (Max 10MB)
              </span>
              <Input
                id='imageFile'
                name='imageFile'
                type='file'
                accept='.jpg, .png, .svg'
                className='hidden'
                onChange={handleImageChange}
                onBlur={() => formik.setFieldTouched('imageFile', true)}
              />
            </label>
            {imagePreview && (
              <div className='mt-2 text-center'>
                <img
                  src={imagePreview}
                  alt='Image Preview'
                  className='max-w-xs mx-auto h-auto rounded-md object-cover'
                />
                <p className='text-sm text-gray-600 mt-1'>
                  {formik.values.imageFile?.name} ({(formik.values.imageFile?.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              </div>
            )}
          </div>

          {/* OR Divider */}
          <div className='flex items-center my-4'>
            <div className='flex-1 border-t border-gray-300'></div>
            <span className='px-3 text-sm text-gray-500'>OR</span>
            <div className='flex-1 border-t border-gray-300'></div>
          </div>

          {/* URL Input Option */}
          <div>
            <Label htmlFor='imageUrl' className='block text-sm text-gray-600 mb-2'>
              Enter Image URL
            </Label>
            <Input
              id='imageUrl'
              name='imageUrl'
              type='text'
              placeholder='Enter image URL'
              className='mt-1'
              {...formik.getFieldProps('imageUrl')}
              disabled={!!formik.values.imageFile}
            />
            {formik.touched.imageUrl && formik.errors.imageUrl && (
              <p className='text-red-500 text-sm mt-1'>{formik.errors.imageUrl}</p>
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
