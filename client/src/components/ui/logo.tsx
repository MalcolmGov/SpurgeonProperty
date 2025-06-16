import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  variant?: "default" | "white" | "compact";
}

export function Logo({ className, showText = true, variant = "default" }: LogoProps) {
  const logoHeight = variant === "compact" ? "h-8" : "h-10";
  
  return (
    <div className={cn("flex items-center space-x-3", className)}>
      {/* Colorful accent icon */}
      <div className="w-2 h-8 bg-gradient-to-b from-orange-400 to-yellow-500 rounded-full shadow-lg"></div>
      
      {/* SpurgeonProperty Logo - Styled Text Version */}
      <div className="flex flex-col">
        <span 
          className={cn(
            variant === "compact" ? "text-lg" : "text-xl",
            "font-bold tracking-tight leading-tight",
            variant === "white" 
              ? "text-white drop-shadow-lg" 
              : "text-white"
          )}
          style={{
            textShadow: variant === "white" 
              ? "0 2px 4px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.3)"
              : "0 3px 6px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.2)",
            fontWeight: "800"
          }}
        >
          Spurgeon
        </span>
        <span 
          className={cn(
            variant === "compact" ? "text-xs" : "text-sm",
            "font-semibold -mt-1 tracking-wide",
            variant === "white" 
              ? "text-orange-200 drop-shadow-md" 
              : "text-orange-200"
          )}
          style={{
            textShadow: variant === "white"
              ? "0 2px 4px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.2)"
              : "0 2px 4px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.15)",
            fontWeight: "600"
          }}
        >
          Property
        </span>
      </div>
    </div>
  );
}

export function LogoIcon({ className }: { className?: string }) {
  return <Logo className={className} showText={false} />;
}

export function LogoCompact({ className }: { className?: string }) {
  return <Logo className={className} variant="compact" />;
}