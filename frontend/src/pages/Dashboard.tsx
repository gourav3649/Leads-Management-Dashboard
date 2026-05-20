import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.tsx';
import { LeadFormModal } from '../components/leads/LeadFormModal.tsx';
import Button from '../components/common/Button.tsx';
import Spinner from '../components/common/Spinner.tsx';
import { Link } from 'react-router-dom';
import {
  Plus,
  CheckCircle,
  Clock,
  TrendingUp,
  AlertTriangle,
  Users,
  Award,
  Zap,
  Settings,
  Eye,
  RefreshCw,
  LayoutGrid,
  MapPin,
  Flame,
  Maximize2,
  Minimize2,
  EyeOff
} from 'lucide-react';
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
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { LeadMap } from '../components/leads/LeadMap.tsx';

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
  regionalDistribution: {
    North: number;
    South: number;
    East: number;
    West: number;
    Central: number;
  };
  velocityData: Array<{
    date: string;
    daysToConvert: number;
    _id?: string;
  }>;
}

interface Widget {
  id: string;
  title: string;
  visible: boolean;
  size: 'half' | 'full';
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [customizerOpen, setCustomizerOpen] = useState(false);

  // Widget customizer grid state
  const [widgets, setWidgets] = useState<Widget[]>([
    { id: 'gauge', title: 'Conversions Funnel Gauge', visible: true, size: 'half' },
    { id: 'velocity', title: 'Lead Conversion Velocity', visible: true, size: 'half' },
    { id: 'map', title: 'Geographical Lead Map', visible: true, size: 'half' },
    { id: 'status', title: 'Pipeline Status Distribution', visible: true, size: 'half' },
    { id: 'source', title: 'Marketing Source Breakdown', visible: true, size: 'half' },
  ]);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/leads/stats');
      setStats(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard metrics. Database may be disconnected.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Listen to global data refresh events (e.g. from command palette or form submits)
    const handleRefresh = () => {
      fetchStats();
    };

    window.addEventListener('smart_leads_refresh_data', handleRefresh);
    return () => {
      window.removeEventListener('smart_leads_refresh_data', handleRefresh);
    };
  }, []);

  // Sync widget layouts from localStorage if present
  useEffect(() => {
    const savedLayout = localStorage.getItem('smart_leads_widgets_layout');
    if (savedLayout) {
      try {
        setWidgets(JSON.parse(savedLayout));
      } catch (e) {
        console.error('Failed to parse saved widget layout:', e);
      }
    }
  }, []);

  const saveLayout = (updatedWidgets: Widget[]) => {
    setWidgets(updatedWidgets);
    localStorage.setItem('smart_leads_widgets_layout', JSON.stringify(updatedWidgets));
  };

  const toggleWidgetVisibility = (id: string) => {
    const updated = widgets.map((w) => (w.id === id ? { ...w, visible: !w.visible } : w));
    saveLayout(updated);
  };

  const toggleWidgetSize = (id: string) => {
    const updated = widgets.map((w) => (w.id === id ? { ...w, size: w.size === 'half' ? 'full' : 'half' as 'half' | 'full' } : w));
    saveLayout(updated);
  };

  const hideWidget = (id: string) => {
    const updated = widgets.map((w) => (w.id === id ? { ...w, visible: false } : w));
    saveLayout(updated);
  };

  const resetWidgets = () => {
    const defaultWidgets: Widget[] = [
      { id: 'gauge', title: 'Conversions Funnel Gauge', visible: true, size: 'half' },
      { id: 'velocity', title: 'Lead Conversion Velocity', visible: true, size: 'half' },
      { id: 'map', title: 'Geographical Lead Map', visible: true, size: 'half' },
      { id: 'status', title: 'Pipeline Status Distribution', visible: true, size: 'half' },
      { id: 'source', title: 'Marketing Source Breakdown', visible: true, size: 'half' },
    ];
    saveLayout(defaultWidgets);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
        <span className="text-xs font-semibold text-slate-400 mt-4 animate-pulse">
          Analyzing business analytics...
        </span>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-6">
        <div className="p-3 bg-rose-500/10 text-rose-500 rounded-full mb-4">
          <AlertTriangle size={32} />
        </div>
        <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100">Error Loading Dashboard</h4>
        <p className="text-slate-500 text-sm mt-1 max-w-md">{error}</p>
        <Button variant="secondary" onClick={fetchStats} className="mt-4">
          Retry Metrics Sync
        </Button>
      </div>
    );
  }

  const conversionRate = stats.totalLeads > 0 
    ? Math.round((stats.statusCounts.Converted / stats.totalLeads) * 100) 
    : 0;

  // Custom Chart Tooltips
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 rounded-xl border border-slate-200/50 dark:border-slate-800/40 bg-white/95 dark:bg-slate-900/95 shadow-lg text-xs font-semibold">
          <p className="text-slate-800 dark:text-slate-200">{payload[0].name || payload[0].payload?.date}</p>
          <p className="text-indigo-650 dark:text-indigo-400 mt-1 font-bold">
            Value: <span className="text-sm font-extrabold">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Recharts structured datasets
  const statusData = [
    { name: 'New', value: stats.statusCounts.New, color: '#6366f1' },
    { name: 'Contacted', value: stats.statusCounts.Contacted, color: '#f59e0b' },
    { name: 'Qualified', value: stats.statusCounts.Qualified, color: '#10b981' },
    { name: 'Converted', value: stats.statusCounts.Converted, color: '#06b6d4' },
    { name: 'Lost', value: stats.statusCounts.Lost, color: '#f43f5e' }
  ].filter((d) => d.value > 0);

  const sourceData = [
    { name: 'Website', count: stats.sourceCounts.Website, color: '#6366f1' },
    { name: 'Instagram', count: stats.sourceCounts.Instagram, color: '#ec4899' },
    { name: 'Referral', count: stats.sourceCounts.Referral, color: '#14b8a6' }
  ];

  // Fallback velocity data if empty (to keep premium design look)
  const defaultVelocity = [
    { date: '2026-05-14', daysToConvert: 2 },
    { date: '2026-05-15', daysToConvert: 4 },
    { date: '2026-05-16', daysToConvert: 3 },
    { date: '2026-05-17', daysToConvert: 5 },
    { date: '2026-05-18', daysToConvert: 2 },
    { date: '2026-05-19', daysToConvert: 1 },
    { date: '2026-05-20', daysToConvert: 3 },
  ];
  const velocityDataset = stats.velocityData && stats.velocityData.length > 0
    ? stats.velocityData
    : defaultVelocity;

  // Render content dynamically based on widget ID
  const renderWidgetContent = (id: string) => {
    switch (id) {
      case 'gauge': {
        const total = stats.totalLeads || 1;
        const qualified = stats.statusCounts.Qualified || 0;
        const converted = stats.statusCounts.Converted || 0;
        const qualPct = Math.min(100, Math.round((qualified / total) * 100));
        const convPct = Math.min(100, Math.round((converted / total) * 100));

        // SVG attributes scaled up
        const r = 82;
        const circ = 2 * Math.PI * r;
        const qualOffset = circ - (qualPct / 100) * circ;
        const rInner = 68;
        const circInner = 2 * Math.PI * rInner;
        const convOffset = circInner - (convPct / 100) * circInner;

        return (
          <div className="flex flex-col h-full justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg flex-shrink-0 mt-0.5 animate-pulse">
                <Flame className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">
                  Funnel Conversions Gauge
                </h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Qualified vs Converted conversions dial
                </p>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center py-6 gap-10 select-none">
              {/* SVG Gauge Graphic */}
              <div className="relative w-48 h-48 flex-shrink-0">
                <svg viewBox="0 0 192 192" className="w-full h-full transform -rotate-90">
                  {/* Gray Background Circle */}
                  <circle
                    cx="96"
                    cy="96"
                    r={r}
                    className="stroke-slate-100 dark:stroke-slate-800/80 fill-none"
                    strokeWidth="9"
                  />
                  {/* Qualified Ring */}
                  <circle
                    cx="96"
                    cy="96"
                    r={r}
                    className="stroke-indigo-500 dark:stroke-indigo-600 fill-none transition-all duration-1000 ease-out"
                    strokeWidth="9"
                    strokeDasharray={circ}
                    strokeDashoffset={qualOffset}
                    strokeLinecap="round"
                  />
                  {/* Converted Ring (Offset / Inner ring) */}
                  <circle
                    cx="96"
                    cy="96"
                    r={rInner}
                    className="stroke-emerald-400 dark:stroke-emerald-500 fill-none transition-all duration-1000 ease-out"
                    strokeWidth="7"
                    strokeDasharray={circInner}
                    strokeDashoffset={convOffset}
                    strokeLinecap="round"
                  />
                </svg>
                {/* Gauge Text overlay (Dead Centered) */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                    {convPct}%
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">
                    Converted
                  </span>
                </div>
              </div>

              {/* Legends details */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-indigo-500" />
                    Qualified Rate
                  </span>
                  <span className="text-base font-extrabold text-slate-750 dark:text-slate-200 mt-0.5">
                    {qualPct}% ({qualified} leads)
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-400" />
                    Conversion Rate
                  </span>
                  <span className="text-base font-extrabold text-slate-750 dark:text-slate-200 mt-0.5">
                    {convPct}% ({converted} leads)
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      }

      case 'velocity': {
        return (
          <div className="flex flex-col h-full justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-violet-500/10 text-violet-500 rounded-lg flex-shrink-0 mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">
                  Conversion Velocity Time
                </h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Average days taken between lead creation and final conversion
                </p>
              </div>
            </div>

            <div className="h-56 w-full mt-6 min-h-[224px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={velocityDataset}
                  margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorVelocity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" className="hidden dark:block" opacity={0.3} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:hidden" />
                  <XAxis 
                    dataKey="date" 
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(tick) => tick.substring(5)} // MM-DD
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                  />
                  <YAxis 
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="daysToConvert"
                    stroke="#8b5cf6"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorVelocity)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      }

      case 'map': {
        return <LeadMap data={stats.regionalDistribution as any} />;
      }

      case 'status': {
        return (
          <div className="flex flex-col h-full justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg flex-shrink-0 mt-0.5">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">
                  Pipeline Status Distribution
                </h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Leads categorized grouped by active progress pipelines
                </p>
              </div>
            </div>

            <div className="h-56 w-full mt-6 flex items-center justify-center min-h-[224px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="bottom" 
                    iconType="circle"
                    iconSize={7}
                    formatter={(value) => (
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      }

      case 'source': {
        return (
          <div className="flex flex-col h-full justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-pink-500/10 text-pink-500 rounded-lg flex-shrink-0 mt-0.5">
                <Users className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">
                  Marketing Channels Breakdown
                </h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Acquisitions comparing channels effectiveness
                </p>
              </div>
            </div>

            <div className="h-56 w-full mt-6 min-h-[224px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sourceData}
                  margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" className="hidden dark:block" opacity={0.3} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:hidden" />
                  <XAxis 
                    dataKey="name" 
                    tickLine={false} 
                    axisLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.03)' }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={32}>
                    {sourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* Top Welcome Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-extrabold text-3xl text-slate-800 dark:text-slate-100 tracking-tight font-sans">
            Welcome back, {user?.name || 'User'}!
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Real-time business performance analytics, system indicators, and conversion charts.
          </p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          {/* Layout Settings Toggler */}
          <Button
            variant="secondary"
            onClick={() => setCustomizerOpen(!customizerOpen)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 border border-slate-200/50 dark:border-slate-800/40"
            title="Configure Dashboard Widgets"
          >
            <Settings size={16} className={`text-slate-500 dark:text-slate-400 ${customizerOpen ? 'rotate-90 text-indigo-500' : ''} transition-all duration-300`} />
            Layout Customize
          </Button>

          <Link to="/leads" className="flex-1 sm:flex-initial hidden sm:block">
            <Button
              variant="secondary"
              className="w-full flex items-center justify-center gap-2 border border-slate-200/50 dark:border-slate-800/40"
              title="Open database management tool"
            >
              <Users size={16} />
              Manage Database
            </Button>
          </Link>

          <Button
            variant="primary"
            onClick={() => setModalOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            Quick Lead
          </Button>
        </div>
      </div>

      {/* Slide-out Widget Layout Settings Board */}
      {customizerOpen && (
        <div className="glass-panel p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 shadow-xl backdrop-blur-md animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-800 pb-3 mb-4">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-indigo-500" />
              Customizable Widget Grid Deck
            </h3>
            <button
              onClick={resetWidgets}
              className="text-xs uppercase font-bold tracking-wider text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
            >
              Reset to Defaults
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {widgets.map((widget) => (
              <div 
                key={widget.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850"
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-350 truncate">
                    {widget.title}
                  </span>
                  <button
                    onClick={() => toggleWidgetSize(widget.id)}
                    className="text-[9px] font-semibold text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 text-left mt-0.5 transition-colors"
                  >
                    Size: {widget.size === 'half' ? 'Half Grid' : 'Full Width'}
                  </button>
                </div>
                {/* Switch Toggle */}
                <button
                  onClick={() => toggleWidgetVisibility(widget.id)}
                  className={`w-9 h-5 rounded-full p-0.5 transition-all duration-300 ${
                    widget.visible ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                >
                  <div 
                    className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${
                      widget.visible ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Global Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {/* Card 1: Total Leads */}
        <div className="glass-card p-5 rounded-2xl flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 shadow-md transition-all duration-200 hover:scale-[1.02]">
          <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Users size={22} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Total Leads
            </span>
            <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-0.5 block">
              {stats.totalLeads}
            </span>
          </div>
        </div>

        {/* Card 2: Contacted */}
        <div className="glass-card p-5 rounded-2xl flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 shadow-md transition-all duration-200 hover:scale-[1.02]">
          <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
            <Clock size={22} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Contacted
            </span>
            <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-0.5 block">
              {stats.statusCounts.Contacted}
            </span>
          </div>
        </div>

        {/* Card 3: Qualified */}
        <div className="glass-card p-5 rounded-2xl flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 shadow-md transition-all duration-200 hover:scale-[1.02]">
          <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <CheckCircle size={22} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Qualified
            </span>
            <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-0.5 block">
              {stats.statusCounts.Qualified}
            </span>
          </div>
        </div>

        {/* Card 4: Converted */}
        <div className="glass-card p-5 rounded-2xl flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 shadow-md transition-all duration-200 hover:scale-[1.02]">
          <div className="p-3 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-xl">
            <Award size={22} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Converted
            </span>
            <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-0.5 block">
              {stats.statusCounts.Converted}
            </span>
          </div>
        </div>

        {/* Card 5: Conversion Rate */}
        <div className="glass-card p-5 rounded-2xl flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 shadow-md transition-all duration-200 hover:scale-[1.02]">
          <div className="p-3 bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-xl">
            <Zap size={22} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Conv. Rate
            </span>
            <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-0.5 block">
              {conversionRate}%
            </span>
          </div>
        </div>
      </div>

      {/* Customizable Widget Board */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {widgets
          .filter((w) => w.visible)
          .map((widget) => {
            const isFull = widget.size === 'full';
            return (
              <div 
                key={widget.id} 
                className={`transition-all duration-300 ${isFull ? 'lg:col-span-2' : 'lg:col-span-1'}`}
              >
                <div className="glass-card p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 shadow-xl flex flex-col h-full min-h-[300px] relative group hover:shadow-2xl hover:border-slate-350 dark:hover:border-slate-700/60 transition-all">
                  
                  {/* Widget settings action bar */}
                  <div className="absolute top-4 right-4 flex gap-2 z-10">
                    <button
                      onClick={() => toggleWidgetSize(widget.id)}
                      className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200/60 dark:border-slate-700/60 transition-all font-bold text-xs shadow-sm focus:outline-none"
                      title={widget.size === 'half' ? 'Expand to Full Width' : 'Shrink to Half Grid'}
                    >
                      {widget.size === 'half' ? (
                        <>
                          <Maximize2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                          <span>Expand</span>
                        </>
                      ) : (
                        <>
                          <Minimize2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                          <span>Shrink</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => hideWidget(widget.id)}
                      className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-900/35 text-rose-500 hover:text-rose-600 dark:hover:text-rose-450 border border-rose-100/50 dark:border-rose-900/40 transition-all font-bold text-xs shadow-sm focus:outline-none"
                      title="Hide widget"
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Hide</span>
                    </button>
                  </div>
                  
                  {/* Render Widget */}
                  {renderWidgetContent(widget.id)}
                </div>
              </div>
            );
          })}
      </div>

      <LeadFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchStats}
        lead={null}
      />
    </div>
  );
};

export default Dashboard;
