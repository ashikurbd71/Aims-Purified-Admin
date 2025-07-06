import { useState } from "react";
import PropTypes from "prop-types";
import { toast } from "sonner";
import { MessageSquare, Video, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import { Textarea } from "@/components/ui/textarea";

const AddStudentReviews = ({ refetch, onClose }) => {
  const [formData, setFormData] = useState({
    studentName: "",
    courseName: "",
    reviewType: "TEXT",
    reviewText: "",
    reviewVideoUrl: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const axiosSecure = useAxiosSecure();

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  // Handle review type change
  const handleReviewTypeChange = (value) => {
    setFormData((prev) => ({ ...prev, reviewType: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form data
      if (!formData.studentName.trim()) {
        toast.error("Student name is required");
        setIsSubmitting(false);
        return;
      }

      if (!formData.courseName.trim()) {
        toast.error("Course name is required");
        setIsSubmitting(false);
        return;
      }

      if (formData.reviewType === "TEXT" && !formData.reviewText.trim()) {
        toast.error("Review text is required");
        setIsSubmitting(false);
        return;
      }

      if (formData.reviewType === "VIDEO" && !formData.reviewVideoUrl.trim()) {
        toast.error("Video URL is required");
        setIsSubmitting(false);
        return;
      }

      // Validate YouTube URL if review type is VIDEO
      if (formData.reviewType === "VIDEO") {
        const youtubeRegex =
          /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
        if (!youtubeRegex.test(formData.reviewVideoUrl)) {
          toast.error("Please enter a valid YouTube URL");
          setIsSubmitting(false);
          return;
        }
      }

      // Send create request
      const response = await axiosSecure.post("/review", formData);

      if (response.status === 201 || response.status === 200) {
        toast.success("Review added successfully");
        refetch();
        onClose();
      } else {
        toast.error("Failed to add review");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "An error occurred while adding the review"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get YouTube video ID from URL
  const getYouTubeVideoId = (url) => {
    if (!url) return null;

    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    return match && match[2].length === 11 ? match[2] : null;
  };

  // Convert YouTube URL to embed URL
  const getYouTubeEmbedUrl = (url) => {
    const videoId = getYouTubeVideoId(url);
    if (!videoId) return "";
    return `https://www.youtube.com/embed/${videoId}`;
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Add Student Review</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <Label htmlFor="studentName">Student Name</Label>
            <Input
              id="studentName"
              name="studentName"
              value={formData.studentName}
              onChange={handleChange}
              className="mt-1"
              placeholder="Enter student name"
            />
          </div>

          <div>
            <Label htmlFor="courseName">Course Name</Label>
            <Input
              id="courseName"
              name="courseName"
              value={formData.courseName}
              onChange={handleChange}
              className="mt-1"
              placeholder="Enter course name"
            />
          </div>
        </div>

        <div className="mb-6">
          <Label>Review Type</Label>
          <RadioGroup
            value={formData.reviewType}
            onValueChange={handleReviewTypeChange}
            className="flex space-x-4 mt-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="TEXT" id="text-review" />
              <Label htmlFor="text-review" className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-2" />
                Text Review
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="VIDEO" id="video-review" />
              <Label htmlFor="video-review" className="flex items-center">
                <Video className="h-4 w-4 mr-2" />
                Video Review
              </Label>
            </div>
          </RadioGroup>
        </div>

        <Tabs value={formData.reviewType} className="mb-6">
          <TabsContent value="TEXT" className="mt-0">
            <div>
              <Label htmlFor="reviewText">Review Text</Label>
              <div className="mt-1">
                <Textarea
                  name='reviewText'
                  value={formData.reviewText}
                  onChange={handleChange}
                  placeholder="Enter student review text..."
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Use the formatting toolbar to style your text, add links, and
                more.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="VIDEO" className="mt-0">
            <div>
              <Label htmlFor="reviewVideoUrl">YouTube Video URL</Label>
              <Input
                id="reviewVideoUrl"
                name="reviewVideoUrl"
                value={formData.reviewVideoUrl}
                onChange={handleChange}
                className="mt-1"
                placeholder="Enter YouTube video URL"
              />

              {formData.reviewVideoUrl &&
                getYouTubeVideoId(formData.reviewVideoUrl) && (
                  <div className="mt-4 aspect-video">
                    <iframe
                      className="w-full h-full rounded-lg"
                      src={getYouTubeEmbedUrl(formData.reviewVideoUrl)}
                      title="YouTube Video Preview"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 mt-8">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Review"}
          </Button>
        </div>
      </form>
    </div>
  );
};
AddStudentReviews.propTypes = {
  refetch: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default AddStudentReviews;
