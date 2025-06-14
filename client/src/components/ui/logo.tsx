import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  variant?: "default" | "white" | "compact";
}

export function Logo({ className, showText = true, variant = "default" }: LogoProps) {
  const logoSize = variant === "compact" ? "h-8" : "h-12";
  
  return (
    <div className={cn("flex items-center space-x-3", className)}>
      {/* SpurgeonProperty Logo */}
      <div className={cn("relative flex items-center", logoSize)}>
        <img
          src="/attached_assets/image_1749870704531.png"
          alt="SpurgeonProperty Logo"
          className={cn(
            "object-contain brightness-110 contrast-110 saturate-110",
            logoSize,
            variant === "white" && "filter brightness-0 invert"
          )}
          style={{
            filter: variant === "white" 
              ? "brightness(0) invert(1) contrast(1.2) saturate(1.1)" 
              : "contrast(1.15) saturate(1.1) brightness(1.05) drop-shadow(0 1px 2px rgba(0,0,0,0.1))"
          }}
        />
      </div>
      
      {/* Enhanced Text Display for smaller screens */}
      {showText && variant !== "compact" && (
        <div className="flex flex-col">
          <span className={cn(
            "text-xl font-bold tracking-tight leading-tight",
            variant === "white" 
              ? "text-white drop-shadow-sm" 
              : "bg-gradient-to-r from-blue-700 via-blue-800 to-purple-700 bg-clip-text text-transparent dark:from-blue-400 dark:via-blue-500 dark:to-purple-500"
          )}>
            SPURGEON
          </span>
          <span className={cn(
            "text-sm font-semibold -mt-1 tracking-wide",
            variant === "white" 
              ? "text-white/90 drop-shadow-sm" 
              : "bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-blue-400"
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