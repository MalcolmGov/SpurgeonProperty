import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  variant?: "default" | "white" | "compact";
}

export function Logo({ className, showText = true, variant = "default" }: LogoProps) {
  const logoHeight = variant === "compact" ? "h-6" : "h-8";
  
  return (
    <div className={cn("flex items-center", className)}>
      {/* Authentic Spurgeon Property Logo */}
      <div className="bg-white rounded px-1 py-0.5 shadow-sm">
        <img 
          src="/spurgeon-property-logo.png" 
          alt="Spurgeon Property" 
          className={cn(
            logoHeight,
            "object-contain",
            variant === "compact" ? "max-w-[100px]" : "max-w-[120px]"
          )}
        />
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