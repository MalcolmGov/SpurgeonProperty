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
        return "text-green-500";
      case "down":
        return "text-red-500";
      default:
        return "text-slate-500";
    }
  };

  const getIconBgColor = () => {
    switch (title.toLowerCase()) {
      case "total properties":
        return "bg-purple-100 dark:bg-purple-900/20 text-purple-primary";
      case "active leads":
        return "bg-orange-100 dark:bg-orange-900/20 text-orange-primary";
      case "this month":
        return "bg-green-100 dark:bg-green-900/20 text-green-500";
      case "conversion rate":
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-500";
      default:
        return "bg-slate-100 dark:bg-slate-700 text-slate-500";
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-600 dark:text-slate-400 text-sm">{title}</p>
            <p className="text-3xl font-bold text-slate-800 dark:text-white">{value}</p>
          </div>
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getIconBgColor()}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
        <div className="flex items-center mt-4 text-sm">
          <span className={`font-medium ${getTrendColor()}`}>{change}</span>
          <span className="text-slate-600 dark:text-slate-400 ml-1">from last month</span>
        </div>
      </CardContent>
    </Card>
  );
}
