import { Card, CardContent } from "@/components/ui/card";

interface PropertyCardSkeletonProps {
  viewMode?: "grid" | "list";
  index?: number;
}

export default function PropertyCardSkeleton({ viewMode = "grid", index = 0 }: PropertyCardSkeletonProps) {
  const staggerClass = `skeleton-stagger-${Math.min(index + 1, 6)}`;
  if (viewMode === "list") {
    return (
      <Card className={`overflow-hidden staggered-fade-in ${staggerClass}`}>
        <div className="flex">
          <div className="relative w-64 h-48 flex-shrink-0 skeleton-shimmer"></div>
          <CardContent className="flex-1 p-6">
            <div className="space-y-3">
              {/* Title skeleton */}
              <div className="h-6 skeleton-shimmer rounded-md w-3/4"></div>
              
              {/* Address skeleton */}
              <div className="h-4 skeleton-shimmer rounded-md w-1/2"></div>
              
              {/* Features skeleton */}
              <div className="flex items-center space-x-6">
                <div className="h-4 skeleton-shimmer rounded-md w-16"></div>
                <div className="h-4 skeleton-shimmer rounded-md w-16"></div>
                <div className="h-4 skeleton-shimmer rounded-md w-20"></div>
              </div>
              
              {/* Description skeleton */}
              <div className="space-y-2">
                <div className="h-4 skeleton-shimmer rounded-md w-full"></div>
                <div className="h-4 skeleton-shimmer rounded-md w-2/3"></div>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden staggered-fade-in ${staggerClass}`}>
      <div className="relative">
        {/* Image skeleton */}
        <div className="w-full h-64 skeleton-shimmer"></div>
        
        {/* Badge skeletons */}
        <div className="absolute top-4 left-4 flex gap-2">
          <div className="h-6 w-16 bg-slate-300/80 dark:bg-slate-600/80 rounded-full animate-pulse"></div>
        </div>
        
        {/* Heart button skeleton */}
        <div className="absolute top-4 right-4 w-10 h-10 bg-slate-300/80 dark:bg-slate-600/80 rounded-md animate-pulse"></div>
        
        {/* Price skeleton */}
        <div className="absolute bottom-4 left-4">
          <div className="h-7 w-24 bg-slate-300/80 dark:bg-slate-600/80 rounded-full animate-pulse"></div>
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Title skeleton */}
          <div className="h-6 skeleton-shimmer rounded-md w-3/4"></div>
          
          {/* Address skeleton */}
          <div className="h-4 skeleton-shimmer rounded-md w-1/2"></div>
          
          {/* Features skeleton */}
          <div className="flex items-center space-x-4">
            <div className="h-4 skeleton-shimmer rounded-md w-16"></div>
            <div className="h-4 skeleton-shimmer rounded-md w-16"></div>
            <div className="h-4 skeleton-shimmer rounded-md w-20"></div>
          </div>
          
          {/* Button skeleton */}
          <div className="h-10 skeleton-shimmer rounded-md w-full"></div>
        </div>
      </CardContent>
    </Card>
  );
}