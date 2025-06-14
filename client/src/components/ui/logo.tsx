import { cn } from "@/lib/utils";
import logoImage from "@assets/image_1749870704531.png";

interface LogoProps {
  className?: string;
  showText?: boolean;
  variant?: "default" | "white" | "compact";
}

export function Logo({ className, showText = true, variant = "default" }: LogoProps) {
  const logoHeight = variant === "compact" ? "h-8" : "h-12";
  
  return (
    <div className={cn("flex items-center", className)}>
      {/* SpurgeonProperty Logo - Complete Logo Image */}
      <img
        src={logoImage}
        alt="SpurgeonProperty"
        className={cn(
          "object-contain w-auto",
          logoHeight,
          variant === "white" && "brightness-0 invert"
        )}
        style={{
          filter: variant === "white" 
            ? "brightness(0) invert(1) contrast(1.2) saturate(1.1)" 
            : "contrast(1.2) saturate(1.15) brightness(1.1) drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
          maxWidth: "200px"
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