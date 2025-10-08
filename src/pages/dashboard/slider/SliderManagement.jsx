import React, { useState } from 'react';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pen, Plus, Trash } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import SliderCreateForm from './SliderCreateForm';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '@/hooks/useAxiosSecure';
import { toast } from 'sonner';
import Loading from '@/components/global/Loading';
import CustomMetaTag from '@/components/global/CustomMetaTags';
import { Switch } from '@/components/ui/switch';

const SliderManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlider, setEditingSlider] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const axiosSecure = useAxiosSecure();

  const handleModalClose = () => setIsModalOpen(false);
  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setEditingSlider(null);
  };

  const handleEdit = (slider) => {
    setEditingSlider(slider);
    setIsEditModalOpen(true);
  };

  const { data: sliders, refetch, isLoading } = useQuery({
    queryKey: ['slidersManagement'],
    queryFn: async () => {
      const res = await axiosSecure.get('/slider');
      return res?.data;
    },
  });

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (id) => {
    setIsDeleting(true);
    try {
      await axiosSecure.delete(`/slider/${id}`);
      toast.success('Slider deleted successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to delete slider');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await axiosSecure.patch(`/slider/${id}/toggle`);
      toast.success('Slider status updated');
      refetch();
    } catch (error) {
      toast.error('Failed to update slider status');
    }
  };

  return (
    <div>
      <CustomMetaTag title="Slider Management" />
      <div className="flex items-center lg:flex-row flex-col lg:gap-0 gap-5 justify-between">
        <h1 className="text-2xl text-gray-600">Slider Management</h1>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-3xl">
              Add new Slider <Plus className="ml-2" />
            </Button>
          </DialogTrigger>
          <DialogContent className="p-8 min-w-[45%] max-h-screen overflow-auto">
            <SliderCreateForm refetch={refetch} onClose={handleModalClose} />
          </DialogContent>
        </Dialog>

        {/* Edit Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="p-8 min-w-[45%] max-h-screen overflow-auto">
            <SliderCreateForm
              refetch={refetch}
              onClose={handleEditModalClose}
              editingSlider={editingSlider}
              isEdit={true}
            />
          </DialogContent>
        </Dialog>
      </div>
      <div className="border rounded-3xl mt-6">
        <div className="p-4 md:px-6 py-4">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold">Total Sliders</h1>
            <span className="bg-gray-100 dark:text-gray-700 px-2 rounded-3xl text-sm font-semibold">
              {sliders?.length || 0} Total
            </span>
          </div>
          <p className="text-gray-600">Manage your website sliders here</p>
        </div>
        {isLoading ? <Loading /> : (
          <div className="overflow-x-auto">
            <Table className="table-auto w-full">
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-900">
                  <TableHead className="border-r">Image</TableHead>
                  <TableHead className="border-r">Title</TableHead>
                  <TableHead className="border-r">Price</TableHead>
                  <TableHead className="border-r">Order</TableHead>
                  <TableHead className="border-r">Active</TableHead>
                  <TableHead className="text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sliders?.map((slider) => (
                  <TableRow key={slider.id}>
                    <TableCell className="border-r">
                      <img src={slider.imageUrl} alt={slider.title} className="w-20 h-12 object-cover rounded" />
                    </TableCell>
                    <TableCell className="border-r">
                      <p className="font-semibold">{slider.title}</p>
                    </TableCell>
                    <TableCell className="border-r">
                      <div>
                        <p className="font-semibold">{slider.price}</p>
                        {slider.offer && <p className="text-sm text-green-600">Offer: {slider.offer}</p>}
                      </div>
                    </TableCell>
                    <TableCell className="border-r">{slider.order}</TableCell>
                    <TableCell className="border-r">
                      <Switch checked={slider.isActive} onCheckedChange={() => handleToggleActive(slider.id)} />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 items-center justify-center">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => handleEdit(slider)}
                                className="hover:text-blue-500"
                              >
                                <Pen className="p-1" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit Slider</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button className="hover:text-red-500">
                                    <Trash className="p-1" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Delete Slider</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(slider.id)} disabled={isDeleting}>
                                {isDeleting ? 'Deleting...' : 'Delete'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SliderManagement;
