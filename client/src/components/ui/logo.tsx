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
        <span className={cn(
          variant === "compact" ? "text-lg" : "text-xl",
          "font-bold tracking-tight leading-tight",
          variant === "white" 
            ? "text-white drop-shadow-sm" 
            : "bg-gradient-to-r from-purple-700 via-purple-800 to-purple-900 bg-clip-text text-transparent dark:from-purple-400 dark:via-purple-500 dark:to-purple-600"
        )}>
          SPURGEON
        </span>
        <span className={cn(
          variant === "compact" ? "text-xs" : "text-sm",
          "font-semibold -mt-1 tracking-wide",
          variant === "white" 
            ? "text-white/90 drop-shadow-sm" 
            : "bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent dark:from-purple-400 dark:to-purple-500"
        )}>
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