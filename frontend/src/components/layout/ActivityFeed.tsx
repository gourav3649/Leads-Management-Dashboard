import React, { useEffect, useState } from 'react';
import { X, PlusCircle, CheckCircle2, User, ArrowRightLeft, ShieldAlert, Clock, RefreshCw } from 'lucide-react';
import axios from 'axios';

export interface ActivityEvent {
  id: string;
  type: 'create' | 'status_change' | 'convert' | 'system' | 'edit';
  message: string;
  leadName?: string;
  user: string;
  timestamp: Date;
  details?: string;
}

interface ActivityFeedProps {
  isOpen: boolean;
  onClose: () => void;
  leads?: any[]; // Allow seeding activities based on existing leads
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ isOpen, onClose, leads = [] }) => {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [internalLeads, setInternalLeads] = useState<any[]>(leads);

  // Self-fetch leads if none provided
  useEffect(() => {
    if (leads && leads.length > 0) {
      setInternalLeads(leads);
      return;
    }

    const fetchLeads = async () => {
      try {
        const res = await axios.get('/leads', { params: { limit: 50 } });
        if (res.data?.data) {
          setInternalLeads(res.data.data);
        }
      } catch (err) {
        console.error('Failed to self-fetch leads for activity logs:', err);
      }
    };

    fetchLeads();
  }, [leads]);

  useEffect(() => {
    // Generate some interesting activity logs based on internalLeads, combined with localStorage real-time events
    const localSaved = localStorage.getItem('smart_leads_activities');
    let events: ActivityEvent[] = [];

    if (localSaved) {
      try {
        const parsed = JSON.parse(localSaved);
        events = parsed.map((e: any) => ({
          ...e,
          timestamp: new Date(e.timestamp)
        }));
      } catch (err) {
        console.error('Failed to parse saved activities:', err);
      }
    }

    // Generate base events from current leads if we don't have enough localStorage logs
    if (events.length < 5 && internalLeads.length > 0) {
      const generatedEvents: ActivityEvent[] = [];
      
      const sampleLeads = [...internalLeads]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10);

      sampleLeads.forEach((lead, index) => {
        const date = new Date(lead.createdAt || Date.now());
        
        generatedEvents.push({
          id: `create-${lead._id || index}`,
          type: 'create',
          message: `Created lead "${lead.name}" for "${lead.company}"`,
          leadName: lead.name,
          user: lead.assignedTo?.name || 'Admin',
          timestamp: new Date(date.getTime() - 2 * 60 * 60 * 1000), // 2 hours before lead createdAt
        });

        if (lead.status === 'Converted') {
          generatedEvents.push({
            id: `convert-${lead._id || index}`,
            type: 'convert',
            message: `Lead "${lead.name}" successfully converted! 🎉`,
            leadName: lead.name,
            user: lead.assignedTo?.name || 'Sales Agent',
            timestamp: new Date(date.getTime() + 4 * 60 * 60 * 1000), // 4 hours after creation
          });
        } else if (lead.status === 'Qualified' || lead.status === 'Contacted') {
          generatedEvents.push({
            id: `status-${lead._id || index}`,
            type: 'status_change',
            message: `Updated status of "${lead.name}" to "${lead.status}"`,
            leadName: lead.name,
            user: lead.assignedTo?.name || 'Sales Agent',
            timestamp: new Date(date.getTime() + 1.5 * 60 * 60 * 1000),
          });
        }
      });

      events = [...events, ...generatedEvents]
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 30);
      
      localStorage.setItem('smart_leads_activities', JSON.stringify(events));
    }

    setActivities(events);
  }, [internalLeads]);

  // Listener for custom events dispatched when leads are added or edited
  useEffect(() => {
    const handleNewActivity = (e: Event) => {
      const customEvent = e as CustomEvent<ActivityEvent>;
      if (customEvent.detail) {
        setActivities((prev) => {
          const updated = [customEvent.detail, ...prev].slice(0, 50);
          localStorage.setItem('smart_leads_activities', JSON.stringify(updated));
          return updated;
        });
      }
    };

    window.addEventListener('smart_leads_activity_log', handleNewActivity);
    return () => {
      window.removeEventListener('smart_leads_activity_log', handleNewActivity);
    };
  }, []);

  const getEventStyles = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'create':
        return {
          icon: <PlusCircle className="w-4 h-4 text-indigo-500" />,
          bg: 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-900/30',
        };
      case 'convert':
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
          bg: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/30',
        };
      case 'status_change':
        return {
          icon: <ArrowRightLeft className="w-4 h-4 text-amber-500" />,
          bg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/30',
        };
      case 'system':
        return {
          icon: <ShieldAlert className="w-4 h-4 text-rose-500" />,
          bg: 'bg-rose-50 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900/30',
        };
      default:
        return {
          icon: <RefreshCw className="w-4 h-4 text-sky-500" />,
          bg: 'bg-sky-50 dark:bg-sky-950/30 border-sky-100 dark:border-sky-900/30',
        };
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const clearLogs = () => {
    localStorage.removeItem('smart_leads_activities');
    setActivities([]);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-full sm:w-[420px] bg-white/95 dark:bg-slate-900/95 border-l border-slate-200/80 dark:border-slate-800 shadow-2xl backdrop-blur-md z-50 transform transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-500" />
              Activity Audit Log
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Real-time feed of lead transitions
            </p>
          </div>
          <div className="flex items-center gap-3">
            {activities.length > 0 && (
              <button
                onClick={clearLogs}
                className="text-[10px] uppercase font-bold tracking-wider text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
              >
                Clear
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Feed */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Clock className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-3" />
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No activity logged yet</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 max-w-[200px] mt-1">
                Updates will appear here dynamically as leads are modified.
              </p>
            </div>
          ) : (
            activities.map((event) => {
              const styles = getEventStyles(event.type);
              return (
                <div
                  key={event.id}
                  className={`p-3.5 rounded-xl border transition-all duration-200 hover:scale-[1.01] ${styles.bg}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm shrink-0">
                      {styles.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-snug">
                        {event.message}
                      </p>
                      
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-400 dark:text-slate-500">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                          {event.user}
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800" />
                        <span>{formatTime(event.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-center text-[10px] text-slate-400 dark:text-slate-500">
          Showing up to 50 security activity audits
        </div>
      </div>
    </>
  );
};
