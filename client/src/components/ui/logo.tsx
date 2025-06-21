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
            filter: 'sepia(0.6) hue-rotate(280deg) saturate(2) brightness(1.1)',
            // Use sepia + hue-rotate for better green to orange conversion
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