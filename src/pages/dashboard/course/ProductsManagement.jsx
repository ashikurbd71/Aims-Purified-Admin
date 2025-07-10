"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Grid,
  List,
  SortAsc,
  BookOpen,
  Layers,
  Clock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import CourseCard from "./components/CourseCard";

import User from "@/hooks/userData";
import useCourseData from "@/hooks/useCourseData";
import CustomMetaTag from "@/components/global/CustomMetaTags";
import ProductCreateForm from "../components/forms/course/ProductCreateForm";

const ProductsManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [sortOrder, setSortOrder] = useState("newest");
  const [isLoading, setIsLoading] = useState(true);

  const [courseData, courseDataRefetch] = useCourseData();
  const { userData } = User();

  // Initialize filtered courses
  useEffect(() => {
    if (courseData) {
      setFilteredCourses(courseData);
      setIsLoading(false);
    }
  }, [courseData]);

  // Handle search
  useEffect(() => {
    if (!courseData) return;

    if (!searchQuery.trim()) {
      setFilteredCourses(courseData);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = courseData.filter(
      (course) =>
        course.name?.toLowerCase().includes(query) ||
        course?.description?.toLowerCase().includes(query)
    );

    setFilteredCourses(filtered);
  }, [searchQuery, courseData]);

  // Handle sort
  const handleSort = (order) => {
    setSortOrder(order);

    let sorted = [...filteredCourses];

    switch (order) {
      case "newest":
        sorted.sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
        break;
      case "oldest":
        sorted.sort(
          (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
        );
        break;
      case "nameAsc":
        sorted.sort((a, b) => a.name?.localeCompare(b.name));
        break;
      case "nameDesc":
        sorted.sort((a, b) => b.name?.localeCompare(a.name));
        break;
      default:
        break;
    }

    setFilteredCourses(sorted);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  // Get course stats
  const getCourseStats = () => {
    if (!courseData) return { total: 0 };

    return {
      total: courseData.length,
      active: courseData.filter(
        (course) => !course.status || course.status === "active"
      ).length,
      draft: courseData.filter(
        (course) => course.status === "draft"
      ).length,
    };
  };

  const stats = getCourseStats();

  return (
    <div className="container mx-auto px-4 py-6">
      <CustomMetaTag title="Course Management" />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Products Management</h1>
          <p className="text-gray-600">Create and manage your products</p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>

            <Button className="mt-4 md:mt-0 rounded-full bg-black shadow-md">
              <Plus className="mr-2 h-4 w-4" />
              Create Product
            </Button>

          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                Create New Product
              </DialogTitle>
            </DialogHeader>
            <ProductCreateForm
              refetch={courseDataRefetch}
              onClose={handleModalClose}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Total Products
                </p>
                <p className="text-3xl font-bold text-purple-700">
                  {stats.total}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Active Products
                </p>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.active || 0}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Layers className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between mb-6">
        {/* Search */}
        <div className="relative w-full md:w-1/3">
          <Input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Search className="h-4 w-4" />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* View Toggle */}
          <div className="bg-gray-100 rounded-md p-1 flex">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              className={`rounded-md ${viewMode === "grid" ? "bg-white shadow-sm" : ""
                }`}
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              className={`rounded-md ${viewMode === "list" ? "bg-white shadow-sm" : ""
                }`}
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <SortAsc className="h-4 w-4" />
                {sortOrder === "newest"
                  ? "Newest"
                  : sortOrder === "oldest"
                    ? "Oldest"
                    : sortOrder === "nameAsc"
                      ? "A-Z"
                      : "Z-A"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleSort("newest")}>
                <Clock className="h-4 w-4 mr-2" />
                Newest First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort("oldest")}>
                <Clock className="h-4 w-4 mr-2" />
                Oldest First
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleSort("nameAsc")}>
                Name (A-Z)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort("nameDesc")}>
                Name (Z-A)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Course Content */}
      {isLoading ? (
        <div
          className={`grid grid-cols-1 ${viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-3" : ""
            } gap-6`}
        >
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Card key={item} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex gap-2 mt-4">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : courseData?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg">
          <BookOpen className="h-16 w-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            No Courses Yet
          </h2>
          <p className="text-gray-500 mb-6 text-center max-w-md">
            Get started by creating your first course. Your courses will appear
            here.
          </p>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              {["ADMIN", "DEVELOPER"].includes(userData?.role) && (
                <Button className="rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Course
                </Button>
              )}
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">

              <ProductCreateForm
                refetch={courseDataRefetch}
                onClose={handleModalClose}
              />
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "flex flex-col gap-4"
          }
        >
          <CourseCard
            refetch={courseDataRefetch}
            course={filteredCourses}
            viewMode={viewMode}
          />
        </div>
      )}

      {/* No Results */}
      {!isLoading && courseData?.length > 0 && filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">
            No courses found
          </h3>
          <p className="text-gray-500 mt-2">Try adjusting your search query</p>
        </div>
      )}
    </div>
  );
};

export default ProductsManagement;
