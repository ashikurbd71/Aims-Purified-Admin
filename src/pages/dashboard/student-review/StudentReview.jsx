import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Pen,
  Plus,
  Trash2,
  Search,
  MessageSquare,
  Video,
  Filter,
  SortAsc,
  SortDesc,
  Eye,
  CheckCircle,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import useStudentReviewData from "@/hooks/useStudentReviewData";
import useAxiosSecure from "@/hooks/useAxiosSecure";

const StudentReview = () => {
  const [studentReviews, studentReviewRefetch] = useStudentReviewData();
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewReview, setPreviewReview] = useState(null);

  const axiosSecure = useAxiosSecure();

  // Initialize filtered reviews
  useEffect(() => {
    if (studentReviews) {
      setFilteredReviews(studentReviews);
    }
  }, [studentReviews]);

  // Apply filters and sorting
  useEffect(() => {
    if (!studentReviews) return;

    let filtered = [...studentReviews];

    // Apply tab filter
    if (activeTab === "text") {
      filtered = filtered.filter((review) => review.reviewType === "TEXT");
    } else if (activeTab === "video") {
      filtered = filtered.filter((review) => review.reviewType === "VIDEO");
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (review) =>
          review.studentName?.toLowerCase().includes(query) ||
          review.courseName?.toLowerCase().includes(query) ||
          review.reviewText?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    if (sortOrder === "newest") {
      filtered.sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
    } else if (sortOrder === "oldest") {
      filtered.sort(
        (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
      );
    } else if (sortOrder === "nameAsc") {
      filtered.sort((a, b) => a.studentName?.localeCompare(b.studentName));
    } else if (sortOrder === "nameDesc") {
      filtered.sort((a, b) => b.studentName?.localeCompare(a.studentName));
    }

    setFilteredReviews(filtered);
  }, [studentReviews, activeTab, searchQuery, sortOrder]);

  // Handle review deletion
  const handleDeleteReview = async () => {
    if (!reviewToDelete) return;

    console.log(reviewToDelete._id)

    try {
      const response = await axiosSecure.delete(
        `/review/${reviewToDelete._id}`
      );

      if (response.status === 200) {
        toast.success("Review deleted successfully");
        studentReviewRefetch();
        setIsDeleteDialogOpen(false);
        setReviewToDelete(null);
      } else {
        toast.error("Failed to delete review");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "An error occurred while deleting the review"
      );
    }
  };

  // Count reviews by type
  const textReviewsCount =
    studentReviews?.filter((r) => r.reviewType === "TEXT").length || 0;
  const videoReviewsCount =
    studentReviews?.filter((r) => r.reviewType === "VIDEO").length || 0;
  const totalReviewsCount = studentReviews?.length || 0;

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Truncate text
  const truncateText = (text, maxLength = 100) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Get YouTube video ID from URL
  const getYouTubeVideoId = (url) => {
    if (!url) return null;

    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    return match && match[2].length === 11 ? match[2] : null;
  };

  // Get YouTube thumbnail URL
  const getYouTubeThumbnail = (url) => {
    const videoId = getYouTubeVideoId(url);
    if (!videoId) return null;
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Student Reviews</h1>
          <div className="flex items-center gap-2">
            <p className="text-gray-600">
              Manage all student testimonials in one place
            </p>
            <Badge variant="outline" className="ml-2">
              {totalReviewsCount} Total
            </Badge>
          </div>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="mt-4 md:mt-0 rounded-full bg-primary">
              <Plus className="mr-2 h-4 w-4" />
              Add Review
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
            <AddStudentReviews
              refetch={studentReviewRefetch}
              onClose={() => setIsModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            {/* Search */}
            <div className="relative w-full md:w-1/3">
              <Input
                type="text"
                placeholder="Search by name, course, or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Search className="h-4 w-4" />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {/* Sort Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    {sortOrder === "newest" || sortOrder === "oldest" ? (
                      sortOrder === "newest" ? (
                        <SortDesc className="h-4 w-4" />
                      ) : (
                        <SortAsc className="h-4 w-4" />
                      )
                    ) : (
                      <Filter className="h-4 w-4" />
                    )}
                    {sortOrder === "newest"
                      ? "Newest First"
                      : sortOrder === "oldest"
                        ? "Oldest First"
                        : sortOrder === "nameAsc"
                          ? "Name (A-Z)"
                          : "Name (Z-A)"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSortOrder("newest")}>
                    <SortDesc className="h-4 w-4 mr-2" />
                    Newest First
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortOrder("oldest")}>
                    <SortAsc className="h-4 w-4 mr-2" />
                    Oldest First
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setSortOrder("nameAsc")}>
                    Name (A-Z)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortOrder("nameDesc")}>
                    Name (Z-A)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs and Content */}
      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <div className="flex justify-between items-center mb-6">
          <TabsList className="grid grid-cols-3 w-[400px]">
            <TabsTrigger value="all" className="flex items-center gap-2">
              All Reviews
              <Badge variant="secondary">{totalReviewsCount}</Badge>
            </TabsTrigger>
            <TabsTrigger value="text" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Text
              <Badge variant="secondary">{textReviewsCount}</Badge>
            </TabsTrigger>
            <TabsTrigger value="video" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Video
              <Badge variant="secondary">{videoReviewsCount}</Badge>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReviews.map((review) => (
              <ReviewCard
                key={review._id}
                review={review}
                onEdit={() => {
                  setSelectedReview(review);
                  setIsUpdateModalOpen(true);
                }}
                onDelete={() => {
                  setReviewToDelete(review);
                  setIsDeleteDialogOpen(true);
                }}
                onPreview={() => {
                  setPreviewReview(review);
                  setIsPreviewModalOpen(true);
                }}
                formatDate={formatDate}
                truncateText={truncateText}
                getYouTubeThumbnail={getYouTubeThumbnail}
              />
            ))}
          </div>

          {filteredReviews.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">
                No reviews found
              </h3>
              <p className="text-gray-500 mt-2">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="text" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReviews
              .filter((review) => review.reviewType === "TEXT")
              .map((review) => (
                <ReviewCard
                  key={review._id}
                  review={review}
                  onEdit={() => {
                    setSelectedReview(review);
                    setIsUpdateModalOpen(true);
                  }}
                  onDelete={() => {
                    setReviewToDelete(review);
                    setIsDeleteDialogOpen(true);
                  }}
                  onPreview={() => {
                    setPreviewReview(review);
                    setIsPreviewModalOpen(true);
                  }}
                  formatDate={formatDate}
                  truncateText={truncateText}
                  getYouTubeThumbnail={getYouTubeThumbnail}
                />
              ))}
          </div>

          {filteredReviews.filter((review) => review.reviewType === "TEXT")
            .length === 0 && (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">
                  No text reviews found
                </h3>
                <p className="text-gray-500 mt-2">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
        </TabsContent>

        <TabsContent value="video" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReviews
              .filter((review) => review.reviewType === "VIDEO")
              .map((review) => (
                <ReviewCard
                  key={review._id}
                  review={review}
                  onEdit={() => {
                    setSelectedReview(review);
                    setIsUpdateModalOpen(true);
                  }}
                  onDelete={() => {
                    setReviewToDelete(review);
                    setIsDeleteDialogOpen(true);
                  }}
                  onPreview={() => {
                    setPreviewReview(review);
                    setIsPreviewModalOpen(true);
                  }}
                  formatDate={formatDate}
                  truncateText={truncateText}
                  getYouTubeThumbnail={getYouTubeThumbnail}
                />
              ))}
          </div>

          {filteredReviews.filter((review) => review.reviewType === "VIDEO")
            .length === 0 && (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Video className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">
                  No video reviews found
                </h3>
                <p className="text-gray-500 mt-2">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
        </TabsContent>
      </Tabs>

      {/* Update Modal */}
      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          {selectedReview && (
            <UpdateStudentReview
              refetch={studentReviewRefetch}
              reviewData={selectedReview}
              onClose={() => setIsUpdateModalOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          {previewReview && (
            <div className="p-4">
              <h2 className="text-2xl font-bold mb-2">Review Preview</h2>
              <div className="mb-4">
                <Badge variant="outline" className="mb-2">
                  {previewReview.reviewType === "TEXT"
                    ? "Text Review"
                    : "Video Review"}
                </Badge>
                <h3 className="text-xl font-semibold">
                  {previewReview.studentName}
                </h3>
                <p className="text-gray-500">{previewReview.courseName}</p>
                <p className="text-sm text-gray-400 mt-1">
                  Added on {formatDate(previewReview.createdAt)}
                </p>
              </div>

              {previewReview.reviewType === "TEXT" ? (
                <div className="bg-gray-50 p-6 rounded-lg border mt-4">
                  <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: previewReview.reviewText,
                    }}
                  />
                </div>
              ) : (
                <div className="mt-4">
                  <div className="aspect-video">
                    <iframe
                      className="w-full h-full rounded-lg"
                      src={previewReview.reviewVideoUrl}
                      title="Student Review Video"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              )}

              <div className="flex justify-end mt-6">
                <Button
                  variant="outline"
                  onClick={() => setIsPreviewModalOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              review from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteReview}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// Review Card Component
import PropTypes from "prop-types";
import AddStudentReviews from "./AddStudentReviews";
import UpdateStudentReview from "./UpdateStudentReview";

const ReviewCard = ({
  review,
  onEdit,
  onDelete,
  onPreview,
  formatDate,
  truncateText,
  getYouTubeThumbnail,
}) => {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{review.studentName}</CardTitle>
            <CardDescription>{review.courseName}</CardDescription>
          </div>
          <Badge
            variant={review.reviewType === "TEXT" ? "outline" : "secondary"}
          >
            {review.reviewType === "TEXT" ? (
              <MessageSquare className="h-3 w-3 mr-1" />
            ) : (
              <Video className="h-3 w-3 mr-1" />
            )}
            {review.reviewType}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-grow">
        {review.reviewType === "TEXT" ? (
          <div className="mt-2">
            <div
              className="text-gray-600 line-clamp-4"
              dangerouslySetInnerHTML={{
                __html: truncateText(review.reviewText, 150),
              }}
            />
          </div>
        ) : (
          <div className="mt-2 relative aspect-video bg-gray-100 rounded-md overflow-hidden">
            {getYouTubeThumbnail(review.reviewVideoUrl) ? (
              <img
                src={
                  getYouTubeThumbnail(review.reviewVideoUrl) ||
                  "/placeholder.svg"
                }
                alt="Video thumbnail"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Video className="h-8 w-8 text-gray-400" />
              </div>
            )}
            <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white bg-opacity-80 flex items-center justify-center">
                <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-red-600 border-b-8 border-b-transparent ml-1"></div>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-2 flex justify-between items-center border-t">
        <span className="text-xs text-gray-500">
          {formatDate(review.createdAt)}
        </span>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPreview}
            className="h-8 w-8"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            className="h-8 w-8"
          >
            <Pen className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
ReviewCard.propTypes = {
  review: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onPreview: PropTypes.func.isRequired,
  formatDate: PropTypes.func.isRequired,
  truncateText: PropTypes.func.isRequired,
  getYouTubeThumbnail: PropTypes.func.isRequired,
};

export default StudentReview;
