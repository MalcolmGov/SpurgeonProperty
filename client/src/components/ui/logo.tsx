import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  variant?: "default" | "white" | "compact";
}

export function Logo({ className, showText = true, variant = "default" }: LogoProps) {
  const iconSize = variant === "compact" ? "h-8 w-8" : "h-10 w-10";
  const textColor = variant === "white" ? "text-white" : "text-gray-900 dark:text-white";
  
  return (
    <div className={cn("flex items-center space-x-3", className)}>
      {/* Modern Property Icon */}
      <div className={cn("relative", iconSize)}>
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Gradient Definitions */}
          <defs>
            <linearGradient id="buildingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#6366F1" />
            </linearGradient>
            <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#EF4444" />
            </linearGradient>
          </defs>
          
          {/* Main Building */}
          <path
            d="M8 35V18L20 8L32 18V35H8Z"
            fill="url(#buildingGradient)"
            stroke="white"
            strokeWidth="1.5"
          />
          
          {/* Roof accent */}
          <path
            d="M6 20L20 6L34 20L32 18L20 8L8 18L6 20Z"
            fill="url(#accentGradient)"
          />
          
          {/* Windows */}
          <rect x="12" y="15" width="3" height="4" fill="white" opacity="0.9" rx="0.5" />
          <rect x="17" y="15" width="3" height="4" fill="white" opacity="0.9" rx="0.5" />
          <rect x="22" y="15" width="3" height="4" fill="white" opacity="0.9" rx="0.5" />
          
          <rect x="12" y="22" width="3" height="4" fill="white" opacity="0.9" rx="0.5" />
          <rect x="17" y="22" width="3" height="4" fill="white" opacity="0.9" rx="0.5" />
          <rect x="22" y="22" width="3" height="4" fill="white" opacity="0.9" rx="0.5" />
          
          <rect x="12" y="29" width="3" height="4" fill="white" opacity="0.9" rx="0.5" />
          <rect x="22" y="29" width="3" height="4" fill="white" opacity="0.9" rx="0.5" />
          
          {/* Door */}
          <rect x="17" y="29" width="3" height="6" fill="white" opacity="0.95" rx="1.5" />
          <circle cx="19.5" cy="32" r="0.3" fill="url(#accentGradient)" />
          
          {/* Decorative elements */}
          <circle cx="20" cy="12" r="1.5" fill="url(#accentGradient)" />
          <rect x="27" y="25" width="2" height="10" fill="url(#accentGradient)" opacity="0.8" rx="1" />
        </svg>
      </div>
      
      {/* Company Text */}
      {showText && (
        <div className="flex flex-col">
          <span className={cn(
            "text-xl font-bold tracking-tight",
            variant === "white" ? "logo-spurgeon-gradient-white" : "logo-spurgeon-gradient"
          )}>
            Spurgeon
          </span>
          <span className={cn(
            "text-sm font-medium -mt-1",
            variant === "white" ? "logo-property-gradient-white" : "logo-property-gradient"
          )}>
            Property
          </span>
        </div>
      )}
    </div>
  );
}

export function LogoIcon({ className }: { className?: string }) {
  return <Logo className={className} showText={false} />;
}

export function LogoCompact({ className }: { className?: string }) {
  return <Logo className={className} variant="compact" />;
}