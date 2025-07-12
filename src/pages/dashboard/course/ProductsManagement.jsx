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

import CourseCard from "./components/ProductCard"; // Assuming CourseCard is used for products

// import User from "@/hooks/userData";
import useCourseData from "@/hooks/useProductData"; // Assuming this hook fetches product data
import CustomMetaTag from "@/components/global/CustomMetaTags";
import ProductCreateForm from "../components/forms/products/ProductCreateForm";

const ProductsManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  // Renamed to be more explicit about its content
  const [filteredAndSortedProducts, setFilteredAndSortedProducts] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [sortOrder, setSortOrder] = useState("newest"); // Default sort order
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(""); // State for category filter

  // Fetch product data (assuming useCourseData fetches products)
  const [courseData, courseDataRefetch] = useCourseData();
  // const { userData } = User();

  // Dynamically get unique categories from the fetched product data
  // Ensures that your category filter always reflects available categories
  const categories = courseData
    ? [...new Set(courseData.map((product) => product.category?.name))]
      .filter(Boolean) // Remove any undefined/null entries if a product has no category
    : [];

  // This effect runs whenever courseData, searchQuery, selectedCategory, or sortOrder changes.
  // It applies all filters and sorting to the raw data.
  useEffect(() => {
    if (!courseData) return; // Don't proceed if data isn't loaded yet

    let currentProducts = [...courseData]; // Start with a copy of the raw data

    // 1. Apply Search Filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      currentProducts = currentProducts.filter(
        (product) =>
          product.name?.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query)
      );
    }

    // 2. Apply Category Filter
    if (selectedCategory) {
      currentProducts = currentProducts.filter(
        (product) => product.category?.name === selectedCategory
      );
    }

    // 3. Apply Sorting
    let sortedProducts = [...currentProducts]; // Copy for sorting
    if (sortOrder === "newest") {
      sortedProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortOrder === "oldest") {
      sortedProducts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortOrder === "price_asc") {
      sortedProducts.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (sortOrder === "price_desc") {
      sortedProducts.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    }

    setFilteredAndSortedProducts(sortedProducts);
    setIsLoading(false); // Set loading to false once processing is done
  }, [courseData, searchQuery, selectedCategory, sortOrder]); // Dependencies for this effect

  // Handles closing the product creation modal
  const handleModalClose = () => {
    setIsModalOpen(false);
    courseDataRefetch(); // Refetch products to show the newly added one
  };

  // Calculates and returns product statistics
  const getProductStats = () => {
    if (!courseData) return { total: 0, active: 0, draft: 0 };

    return {
      total: courseData.length,
      active: courseData.filter(
        (product) => product.status == "active"
      ).length,
      draft: courseData.filter(
        (product) => product.status === "draft"
      ).length,
    };
  };

  const stats = getProductStats();

  // Check if the current user has admin or developer role
  // const canCreateProduct = ["ADMIN", "DEVELOPER"].includes(userData?.role);

  return (
    <div className="container mx-auto px-4 py-6">
      <CustomMetaTag title="Product Management" />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Products Management</h1>
          <p className="text-gray-600">Create and manage your products</p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            {/* "Create Product" button is now correctly displayed based on user role */}
            { }
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

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Draft Products
                </p>
                <p className="text-3xl font-bold text-orange-600">
                  {stats.draft || 0}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <Clock className="h-6 w-6 text-orange-600" />
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

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border px-3 py-2 rounded-md"
          >
            <option value="">-- All Categories --</option>
            {/* Render categories dynamically */}
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <SortAsc className="h-4 w-4" />
                <span>
                  {sortOrder === "newest"
                    ? "Newest"
                    : sortOrder === "oldest"
                      ? "Oldest"
                      : sortOrder === "price_asc"
                        ? "Price: Low to High"
                        : "Price: High to Low"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortOrder("newest")}>
                Newest
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOrder("oldest")}>
                Oldest
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSortOrder("price_asc")}>
                Price: Low to High
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOrder("price_desc")}>
                Price: High to Low
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Product Content */}
      {isLoading ? (
        // Loading skeleton when data is being fetched
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
        // Message when no products exist at all
        <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg">
          <BookOpen className="h-16 w-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            No Product Yet
          </h2>
          <p className="text-gray-500 mb-6 text-center max-w-md">
            Get started by creating your first product. Your products will
            appear here.
          </p>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              { }
              <Button className="rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Product
              </Button>

            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
              <ProductCreateForm
                refetch={courseDataRefetch}
                onClose={handleModalClose}
              />
            </DialogContent>
          </Dialog>
        </div>
      ) : filteredAndSortedProducts.length === 0 ? (
        // Message when filters/search yield no results
        <div className="text-center py-12">
          <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">
            No Product found
          </h3>
          <p className="text-gray-500 mt-2">Try adjusting your search query or filters.</p>
        </div>
      ) : (
        // Display products in grid or list view
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "flex flex-col gap-4"
          }
        >
          <CourseCard
            refetch={courseDataRefetch}
            course={filteredAndSortedProducts} // Pass the entire array
            viewMode={viewMode}
          />

        </div>
      )
      }
    </div >
  );
};

export default ProductsManagement;