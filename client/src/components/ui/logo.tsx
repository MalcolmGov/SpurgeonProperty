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
      {/* Purple-styled Spurgeon Property Logo */}
      <div className="bg-purple-600 rounded px-3 py-2 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-white rounded px-2 py-1">
            <span className="text-purple-600 font-bold text-lg">SP</span>
          </div>
          {showText && (
            <div className="flex flex-col leading-tight">
              <span className="text-white font-bold text-sm tracking-wide">SPURGEON</span>
              <span className="text-white/90 font-medium text-xs">Property</span>
            </div>
          )}
        </div>
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