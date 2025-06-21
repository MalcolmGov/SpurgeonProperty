import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  variant?: "default" | "white" | "compact";
}

export function Logo({ className, showText = true, variant = "default" }: LogoProps) {
  const logoHeight = variant === "compact" ? "h-8" : "h-12";
  
  return (
    <div className={cn("flex items-center", className)}>
      {/* Spurgeon Property Logo with Purple Filter */}
      <div className="bg-white rounded px-2 py-1 shadow-sm">
        <img 
          src="/spurgeon-property-logo.png" 
          alt="Spurgeon Property" 
          className={cn(
            logoHeight,
            "object-contain",
            variant === "compact" ? "max-w-[140px]" : "max-w-[180px]",
            "logo-color-enhanced"
          )}
          style={{
            filter: 'hue-rotate(60deg) saturate(1.4) brightness(1.1) contrast(1.2)',
            // Enhanced color mapping for purple and orange
            mixBlendMode: 'normal'
          }}
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