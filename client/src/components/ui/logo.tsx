import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  variant?: "default" | "white" | "compact";
}

export function Logo({ className, showText = true, variant = "default" }: LogoProps) {
  const logoHeight = variant === "compact" ? "h-8" : "h-10";
  
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {/* SpurgeonProperty Logo - Styled Text Version */}
      <div className="flex flex-col">
        <span 
          className={cn(
            variant === "compact" ? "text-lg" : "text-xl",
            "font-bold tracking-tight leading-tight",
            variant === "white" 
              ? "text-white drop-shadow-sm" 
              : ""
          )}
          style={variant !== "white" ? {
            background: "linear-gradient(135deg, #7c3aed 0%, #8b5cf6 50%, #a855f7 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          } : {}}
        >
          SPURGEON
        </span>
        <span 
          className={cn(
            variant === "compact" ? "text-xs" : "text-sm",
            "font-semibold -mt-1 tracking-wide",
            variant === "white" 
              ? "text-white/90 drop-shadow-sm" 
              : ""
          )}
          style={variant !== "white" ? {
            background: "linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          } : {}}
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