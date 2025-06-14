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
      {/* SpurgeonProperty Logo - Complete Logo Image */}
      <img
        src="/attached_assets/image_1749870704531.png"
        alt="SpurgeonProperty"
        className={cn(
          "object-contain",
          logoHeight,
          variant === "white" && "brightness-0 invert"
        )}
        style={{
          filter: variant === "white" 
            ? "brightness(0) invert(1) contrast(1.2) saturate(1.1)" 
            : "contrast(1.15) saturate(1.1) brightness(1.1) drop-shadow(0 1px 3px rgba(0,0,0,0.1))"
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