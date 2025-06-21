import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change: string;
  icon: LucideIcon;
  trend: "up" | "down" | "neutral";
}

export default function StatsCard({ title, value, change, icon: Icon, trend }: StatsCardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-emerald-500";
      case "down":
        return "text-red-500";
      default:
        return "text-slate-400";
    }
  };

  const getCardStyle = () => {
    switch (title.toLowerCase()) {
      case "active properties":
        return {
          gradient: "bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-700",
          iconBg: "bg-white/20 backdrop-blur-sm",
          iconColor: "text-white",
          textColor: "text-white",
          valueColor: "text-white",
          changeColor: "text-purple-100"
        };
      case "total leads":
        return {
          gradient: "bg-gradient-to-br from-orange-500 via-red-500 to-pink-600",
          iconBg: "bg-white/20 backdrop-blur-sm",
          iconColor: "text-white",
          textColor: "text-white",
          valueColor: "text-white",
          changeColor: "text-orange-100"
        };
      case "new leads":
        return {
          gradient: "bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600",
          iconBg: "bg-white/20 backdrop-blur-sm",
          iconColor: "text-white",
          textColor: "text-white",
          valueColor: "text-white",
          changeColor: "text-emerald-100"
        };
      case "active agents":
        return {
          gradient: "bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600",
          iconBg: "bg-white/20 backdrop-blur-sm",
          iconColor: "text-white",
          textColor: "text-white",
          valueColor: "text-white",
          changeColor: "text-blue-100"
        };
      default:
        return {
          gradient: "bg-gradient-to-br from-slate-600 to-slate-700",
          iconBg: "bg-white/20 backdrop-blur-sm",
          iconColor: "text-white",
          textColor: "text-white",
          valueColor: "text-white",
          changeColor: "text-slate-100"
        };
    }
  };

  const cardStyle = getCardStyle();

  return (
    <div className={`relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${cardStyle.gradient}`}>
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 bg-white/5 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)]" style={{backgroundSize: '20px 20px'}}></div>
      
      <CardContent className="p-6 relative z-10">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className={`text-sm font-medium ${cardStyle.textColor} opacity-90`}>{title}</p>
            <p className={`text-3xl font-bold ${cardStyle.valueColor} tracking-tight`}>{value}</p>
          </div>
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${cardStyle.iconBg} shadow-lg`}>
            <Icon className={`w-7 h-7 ${cardStyle.iconColor}`} />
          </div>
        </div>
        <div className="flex items-center mt-4 text-sm">
          <div className="flex items-center space-x-1">
            <span className={`font-semibold ${getTrendColor()} bg-white/20 px-2 py-1 rounded-full text-xs`}>
              {change}
            </span>
            <span className={`${cardStyle.changeColor} opacity-75 text-xs`}>from last month</span>
          </div>
        </div>
      </CardContent>
    </div>
  );
}
