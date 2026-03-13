'use client';

interface SkeletonLoaderProps {
  variant?: 'card' | 'chart' | 'list' | 'text';
  count?: number;
}

export default function SkeletonLoader({ variant = 'card', count = 1 }: SkeletonLoaderProps) {
  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return (
          <div className="border border-[#222222] rounded-lg p-6 bg-[#111111] animate-pulse">
            <div className="h-4 bg-[#222222] rounded w-1/3 mb-4"></div>
            <div className="h-8 bg-[#222222] rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-[#222222] rounded w-2/3"></div>
          </div>
        );

      case 'chart':
        return (
          <div className="border border-[#222222] rounded-lg p-6 bg-[#111111] animate-pulse">
            <div className="h-4 bg-[#222222] rounded w-1/3 mb-6"></div>
            <div className="space-y-3">
              <div className="h-32 bg-[#222222] rounded"></div>
              <div className="flex gap-4">
                <div className="h-3 bg-[#222222] rounded flex-1"></div>
                <div className="h-3 bg-[#222222] rounded flex-1"></div>
                <div className="h-3 bg-[#222222] rounded flex-1"></div>
              </div>
            </div>
          </div>
        );

      case 'list':
        return (
          <div className="border border-[#222222] rounded-lg p-6 bg-[#111111] animate-pulse">
            <div className="h-4 bg-[#222222] rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-[#222222] rounded"></div>
              ))}
            </div>
          </div>
        );

      case 'text':
        return (
          <div className="space-y-2 animate-pulse">
            {[...Array(count)].map((_, i) => (
              <div key={i} className="h-4 bg-[#222222] rounded w-full"></div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return <>{renderSkeleton()}</>;
}
