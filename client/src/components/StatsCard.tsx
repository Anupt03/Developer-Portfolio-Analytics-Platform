import { ReactNode, ComponentType, SVGProps } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ComponentType<SVGProps<SVGSVGElement> & { className?: string }>;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  children?: ReactNode;
}

const StatsCard = ({ title, value, icon: Icon, trend, children }: StatsCardProps) => {
  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-white">{value}</h3>
          
          {trend && (
            <p className={`text-xs mt-2 font-medium ${trend.isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </p>
          )}
        </div>
        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
          <Icon className="w-5 h-5 text-indigo-400" />
        </div>
      </div>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
};

export default StatsCard;
