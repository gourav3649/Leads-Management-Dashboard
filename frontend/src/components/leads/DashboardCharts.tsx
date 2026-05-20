import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

interface StatsData {
  totalLeads: number;
  statusCounts: {
    New: number;
    Contacted: number;
    Qualified: number;
    Converted: number;
    Lost: number;
  };
  sourceCounts: {
    Website: number;
    Instagram: number;
    Referral: number;
  };
}

interface DashboardChartsProps {
  stats: StatsData;
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ stats }) => {
  const statusData = [
    { name: 'New', value: stats.statusCounts.New, color: '#6366f1' },       // Indigo
    { name: 'Contacted', value: stats.statusCounts.Contacted, color: '#f59e0b' }, // Amber
    { name: 'Qualified', value: stats.statusCounts.Qualified, color: '#10b981' }, // Emerald
    { name: 'Converted', value: stats.statusCounts.Converted, color: '#06b6d4' }, // Cyan
    { name: 'Lost', value: stats.statusCounts.Lost, color: '#f43f5e' }         // Rose
  ].filter((d) => d.value > 0);

  const sourceData = [
    { name: 'Website', count: stats.sourceCounts.Website, color: '#6366f1' },   // Indigo
    { name: 'Instagram', count: stats.sourceCounts.Instagram, color: '#ec4899' }, // Pink
    { name: 'Referral', count: stats.sourceCounts.Referral, color: '#14b8a6' }    // Teal
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 rounded-xl border border-slate-200/50 dark:border-slate-800/40 bg-white/90 dark:bg-slate-900/90 shadow-lg text-xs font-semibold">
          <p className="text-slate-800 dark:text-slate-200">{payload[0].name}</p>
          <p className="text-indigo-600 dark:text-indigo-400 mt-0.5">
            Count: <span className="font-extrabold">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Status Distribution */}
      <div className="glass-card p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 shadow-xl flex flex-col">
        <div className="mb-4">
          <h3 className="font-extrabold text-lg text-slate-800 dark:text-slate-100 tracking-tight font-sans">
            Lead Status Distribution
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            Database totals grouped by current pipeline status.
          </p>
        </div>
        <div className="h-72 w-full flex-1 min-h-[280px]">
          {statusData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm font-semibold text-slate-400">
              No status data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 font-sans">
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Source Breakdown */}
      <div className="glass-card p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 shadow-xl flex flex-col">
        <div className="mb-4">
          <h3 className="font-extrabold text-lg text-slate-800 dark:text-slate-100 tracking-tight font-sans">
            Lead Source Breakdown
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            Comparing acquisition effectiveness per marketing channel.
          </p>
        </div>
        <div className="h-72 w-full flex-1 min-h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sourceData}
              margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:hidden" />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" className="hidden dark:block" />
              <XAxis 
                dataKey="name" 
                tickLine={false} 
                axisLine={false}
                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
              />
              <YAxis 
                tickLine={false} 
                axisLine={false}
                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} />
              <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={45}>
                {sourceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
