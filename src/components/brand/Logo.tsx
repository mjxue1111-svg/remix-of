import logoAsset from "@/assets/mixianyun-logo.png.asset.json";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: number;
  showWordmark?: boolean;
  className?: string;
  tone?: "default" | "light";
}

export function Logo({ size = 32, showWordmark = true, className, tone = "default" }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <img
        src={logoAsset.url}
        alt="米线云"
        style={{ width: size, height: size }}
        className="object-contain"
      />
      {showWordmark && (
        <div className="flex flex-col leading-none">
          <span
            className={cn(
              "text-lg font-semibold tracking-tight",
              tone === "light" ? "text-white" : "text-foreground",
            )}
          >
            米线云
          </span>
          <span
            className={cn(
              "mt-0.5 text-[10px] font-medium tracking-[0.18em]",
              tone === "light" ? "text-white/70" : "text-muted-foreground",
            )}
          >
            MIXIAN CLOUD
          </span>
        </div>
      )}
    </div>
  );
}