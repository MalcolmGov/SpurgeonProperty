import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  variant?: "default" | "white" | "compact";
}

export function Logo({ className, showText = true, variant = "default" }: LogoProps) {
  const logoHeight = variant === "compact" ? "h-8" : "h-10";
  
  return (
    <div className={cn("flex items-center", className)}>
      {/* Authentic Spurgeon Property Logo */}
      <img 
        src="/spurgeon-logo.png" 
        alt="Spurgeon Property" 
        className={cn(
          logoHeight,
          "object-contain",
          variant === "compact" ? "max-w-[120px]" : "max-w-[150px]"
        )}
        style={{
          filter: variant === "white" ? "brightness(0) invert(1)" : "none"
        }}
      />
    </div>
  );
}

export function LogoIcon({ className }: { className?: string }) {
  return <Logo className={className} showText={false} />;
}

export function LogoCompact({ className }: { className?: string }) {
  return <Logo className={className} variant="compact" />;
}