"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { Trash2, Upload, Eye, MoreVertical, Calendar } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TooltipProvider } from "@/components/ui/tooltip"

import useAxiosSecure from "@/hooks/useAxiosSecure"

import User from "@/hooks/userData"
import PropTypes from "prop-types"

const CourseCard = ({ course, refetch, viewMode = "grid" }) => {
  const axiosSecure = useAxiosSecure()
  const [isModalOpen, setIsModalOpen] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { userData } = User()

  const handleModalOpen = (id) => {
    setIsModalOpen(id)
  }


  const handleModalClose = () => {
    setIsModalOpen(null)
  }

  const handleDelete = async (id) => {
    setIsDeleting(true)
    try {
      const response = await axiosSecure.delete(`/course/${id}`)
      if (response.status === 200) {
        toast.success("Course deleted successfully!")
        refetch()
      } else {
        toast.error("Something went wrong. Please try again.")
      }
    } catch (error) {
      console.error("Error deleting course:", error)
      toast.error("Failed to delete course. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (!course.length) {
    return <p className="text-center items-center justify-center text-2xl text-gray-500">No courses available</p>
  }

  // Grid View
  if (viewMode === "grid") {
    return (
      <>
        {course?.map((item) => (
          <Card
            key={item._id}
            className="overflow-hidden group transition-all duration-300 hover:shadow-lg border border-gray-200 hover:border-purple-200 bg-white"
          >
            <div className="relative">
              <img
                src={item?.metadata?.featuredImage || "/placeholder.svg?height=200&width=400"}
                alt={item?.name || "Course Image"}
                className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-3 right-3 flex gap-2">
                <Badge variant="secondary" className="bg-white/90 text-purple-700 shadow-sm">
                  {!item?.metadata?.isEnrollmentDisabled === true ? "Active" : "Disabled"}
                </Badge>
              </div>
            </div>

            <CardContent className="p-5">
              <Link to={`/course/${item?._id}`} className="block group-hover:text-purple-700 transition-colors">
                <h2 className="text-xl font-bold line-clamp-1">{item?.name}</h2>
              </Link>

              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{formatDate(item?.createdAt)}</span>
                </div>
              </div>

              <p className="text-gray-600 mt-3 line-clamp-2">
                {item?.metadata?.description || "No description available"}
              </p>
            </CardContent>

            <CardFooter className="px-5 py-4 bg-gray-50 flex justify-between items-center">
              <Link to={`/course/${item?._id}`}>
                <Button variant="outline" size="sm" className="text-purple-700 border-purple-200 hover:bg-purple-50">
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
              </Link>

              <div className="flex gap-2">
                {/* Upload Class Button */}
                <Dialog
                  open={isModalOpen === item?._id}
                  onOpenChange={(open) => {
                    if (open) {
                      handleModalOpen(item?._id)
                    } else {
                      handleModalClose()
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-purple-700 hover:bg-purple-800">
                      <Upload className="h-4 w-4 mr-1" />
                      Upload Class
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-screen overflow-auto min-w-[45%]">
                    <UploadClass courseId={item?._id} onClose={handleModalClose} />
                  </DialogContent>
                </Dialog>

                {/* Delete Course Button */}
                {["ADMIN", "DEVELOPER"].includes(userData?.role) && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-200 text-red-600 hover:bg-red-50"
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. It will permanently delete this course and remove its data from
                          your servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(item?._id)}
                          disabled={isDeleting}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {isDeleting ? "Deleting..." : "Yes, Delete it!"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </CardFooter>
          </Card>
        ))}
      </>
    )
  }

  // List View
  return (
    <>
      {course?.map((item) => (
        <Card
          key={item._id}
          className="overflow-hidden group transition-all duration-300 hover:shadow-md border border-gray-200 hover:border-purple-200 bg-white"
        >
          <div className="flex flex-col md:flex-row">
            <div className="relative md:w-64 h-48">
              <img
                src={item?.metadata?.featuredImage || "/placeholder.svg?height=200&width=400"}
                alt={item?.name || "Course Image"}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3 flex gap-2">
                <Badge variant="secondary" className="bg-white/90 text-purple-700 shadow-sm">
                  {!item?.isEnrollmentDisabled ? "Active" : "Disabled"}
                </Badge>
              </div>
            </div>

            <div className="flex-1 p-5">
              <div className="flex justify-between items-start">
                <div>
                  <Link to={`/course/${item?._id}`} className="block group-hover:text-purple-700 transition-colors">
                    <h2 className="text-xl font-bold">{item?.name}</h2>
                  </Link>

                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{formatDate(item?.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <TooltipProvider>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/course/${item?._id}`} className="cursor-pointer">
                          <Eye className="h-4 w-4 mr-2" />
                          View Course
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem onClick={() => handleModalOpen(item?._id)}>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Class
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      {["ADMIN", "DEVELOPER"].includes(userData?.role) && (
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => {
                            const dialog = document.getElementById(`delete-dialog-${item._id}`)
                            if (dialog) {
                              dialog.click()
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Course
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TooltipProvider>
              </div>

              <p className="text-gray-600 mt-3 line-clamp-2">
                {item?.metadata?.description || "No description available"}
              </p>

              <div className="flex gap-2 mt-4">
                <Link to={`/course/${item?._id}`}>
                  <Button variant="outline" size="sm" className="text-purple-700 border-purple-200 hover:bg-purple-50">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </Link>

                <Dialog
                  open={isModalOpen === item?._id}
                  onOpenChange={(open) => {
                    if (open) {
                      handleModalOpen(item?._id)
                    } else {
                      handleModalClose()
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-purple-700 hover:bg-purple-800">
                      <Upload className="h-4 w-4 mr-1" />
                      Upload Class
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-screen overflow-auto min-w-[45%]">
                    <UploadClass courseId={item?._id} onClose={handleModalClose} />
                  </DialogContent>
                </Dialog>

                {/* Hidden trigger for delete dialog */}
                {["ADMIN", "DEVELOPER"].includes(userData?.role) && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        id={`delete-dialog-${item._id}`}
                        size="sm"
                        variant="outline"
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. It will permanently delete this course and remove its data from
                          your servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(item?._id)}
                          disabled={isDeleting}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {isDeleting ? "Deleting..." : "Yes, Delete it!"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </>
  )
}

CourseCard.propTypes = {
  course: PropTypes.array.isRequired,
  refetch: PropTypes.func.isRequired,
  viewMode: PropTypes.oneOf(["grid", "list"]),
}

export default CourseCard

