import Container from "@/components/Container";
import React from "react";

const Skeleton = ({ className = "", ...props }) => {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-500 ${className}`}
      {...props}
    />
  );
};

const DetailsSkeleton = () => {
  return (
    <div className="w-full text-white">
      <Container className="px-6 py-8">
        <div className="mb-8 title-desc">
          <div className="flex title items-start justify-between mb-4 flex-col gap-2 md:flex-row md:items-center">
            <div className="flex items-center gap-3">
              <Skeleton className="w-2 h-2 rounded-full" />
              <Skeleton className="h-8 w-48" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-sm" />
              <Skeleton className="h-6 w-20 rounded-sm" />
            </div>
          </div>
          <div className="space-y-2 mb-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          <div className="flex gap-6 text-sm items-center flex-wrap">
            <div className="flex items-center gap-2">
              <Skeleton className="w-4 h-4" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="w-4 h-4" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="w-4 h-4" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>

        {/* Requirements Section */}
        <div className="mb-8">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Skeleton className="w-1 h-1 rounded-full mt-2 flex-shrink-0" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="flex items-start gap-2">
              <Skeleton className="w-1 h-1 rounded-full mt-2 flex-shrink-0" />
              <Skeleton className="h-4 w-5/6" />
            </div>
            <div className="flex items-start gap-2">
              <Skeleton className="w-1 h-1 rounded-full mt-2 flex-shrink-0" />
              <Skeleton className="h-4 w-4/5" />
            </div>
            <div className="flex items-start gap-2">
              <Skeleton className="w-1 h-1 rounded-full mt-2 flex-shrink-0" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="flex items-start gap-2">
              <Skeleton className="w-1 h-1 rounded-full mt-2 flex-shrink-0" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>

        {/* Contact Info Section */}
        <div className="mb-8">
          <Skeleton className="h-6 w-28 mb-4" />
          <div className="flex-col md:grid grid-cols-2 gap-4 mb-4">
            <div className="flex-col gap-4 mb-2">
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-10 w-full rounded-sm" />
            </div>
            <div>
              <Skeleton className="h-4 w-12 mb-2" />
              <Skeleton className="h-10 w-full rounded-sm" />
            </div>
          </div>
          <div className="flex-col md:grid grid-cols-2 gap-4 mb-4">
            <div className="flex-col gap-4 mb-2">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-10 w-full rounded-sm" />
            </div>
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-10 w-full rounded-sm" />
            </div>
          </div>
          <div className="flex-col md:grid grid-cols-2 gap-4">
            <div className="flex-col gap-4 mb-2">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-10 w-full rounded-sm" />
            </div>
            <div>
              <Skeleton className="h-4 w-18 mb-2" />
              <Skeleton className="h-10 w-full rounded-sm" />
            </div>
          </div>
        </div>

        {/* Position & Availability Section */}
        <div className="mb-8">
          <Skeleton className="h-6 w-44 mb-4" />
          <div className="flex-col md:grid grid-cols-2 gap-4">
            <div className="flex-col gap-4 mb-2">
              <Skeleton className="h-4 w-28 mb-2" />
              <Skeleton className="h-10 w-full rounded-sm" />
            </div>
            <div>
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-10 w-full rounded-sm" />
            </div>
          </div>
        </div>

        {/* Professional Background Section */}
        <div className="mb-8">
          <Skeleton className="h-6 w-44 mb-4" />
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-10 w-full rounded-sm" />
            </div>
            <div>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-10 w-full rounded-sm" />
            </div>
            <div>
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-10 w-full rounded-sm" />
            </div>
          </div>

          {/* Links Section */}
          <div className="mb-4">
            <Skeleton className="h-4 w-12 mb-2" />
            <div className="flex gap-2 items-center">
              <Skeleton className="h-10 flex-1 rounded-sm" />
              <Skeleton className="h-8 w-28 rounded-sm" />
            </div>
          </div>

          {/* CV Upload */}
          <Skeleton className="h-12 w-full rounded-sm" />
        </div>

        {/* Education Section */}
        <div className="mb-8">
          <Skeleton className="h-6 w-20 mb-4" />
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Skeleton className="h-4 w-36 mb-2" />
              <Skeleton className="h-10 w-full rounded-sm" />
            </div>
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-10 w-full rounded-sm" />
            </div>
            <div>
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-10 w-full rounded-sm" />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <Skeleton className="h-12 w-full rounded-sm bg-teal-500" />
      </Container>
    </div>
  );
};

export default DetailsSkeleton;
