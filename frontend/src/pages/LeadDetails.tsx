import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.tsx';
import { LeadFormModal } from '../components/leads/LeadFormModal.tsx';
import Button from '../components/common/Button.tsx';
import Spinner from '../components/common/Spinner.tsx';
import ConfirmDialog from '../components/common/ConfirmDialog.tsx';
import {
  ArrowLeft,
  Mail,
  Calendar,
  User,
  Edit2,
  Trash2,
  Copy,
  Check,
  Clock,
  TrendingUp,
  Tag,
  AlertTriangle,
  Activity
} from 'lucide-react';

interface Lead {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Converted' | 'Lost';
  source: 'Website' | 'Instagram' | 'Referral';
  createdBy: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
}

const LeadDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);

  const fetchLeadDetails = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/leads/${id}`);
      setLead(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch lead details. Lead may not exist or database connection lost.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeadDetails();
  }, [id]);

  const handleCopyEmail = () => {
    if (!lead) return;
    navigator.clipboard.writeText(lead.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeleteLead = async () => {
    if (!lead) return;
    try {
      await axios.delete(`/leads/${lead._id}`);
      navigate('/dashboard');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete lead.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
        <span className="text-sm font-semibold text-slate-400 mt-4 animate-pulse">
          Retrieving lead profile...
        </span>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-6">
        <div className="p-4 bg-rose-500/10 text-rose-500 rounded-full mb-4">
          <AlertTriangle size={36} />
        </div>
        <h4 className="font-extrabold text-xl text-slate-800 dark:text-slate-100">Error Loading Lead Details</h4>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 max-w-md">
          {error || 'The requested lead record could not be located.'}
        </p>
        <Link to="/dashboard" className="mt-6">
          <Button variant="secondary" className="flex items-center gap-2 border border-slate-200/50 dark:border-slate-800/40">
            <ArrowLeft size={16} />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  // Visual highlights configurations
  const statusConfig = {
    New: {
      color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20',
      progress: 'w-1/5 bg-indigo-500',
      percentage: '20%'
    },
    Contacted: {
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
      progress: 'w-2/5 bg-amber-500',
      percentage: '40%'
    },
    Qualified: {
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
      progress: 'w-3/5 bg-emerald-500',
      percentage: '60%'
    },
    Converted: {
      color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20',
      progress: 'w-4/5 bg-cyan-500',
      percentage: '80%'
    },
    Lost: {
      color: 'bg-rose-500/10 text-rose-600 dark:text-rose-45 border border-rose-500/20',
      progress: 'w-full bg-rose-500',
      percentage: '100%'
    }
  };

  const sourceColors = {
    Website: 'bg-slate-100 text-slate-650 dark:bg-slate-800 dark:text-slate-350',
    Instagram: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/10',
    Referral: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/10',
  };

  const initials = lead.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Link to="/dashboard">
          <button className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition-colors">
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
        </Link>
        <div className="flex gap-3 w-full sm:w-auto">
          <Button
            variant="secondary"
            onClick={() => setModalOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 border border-slate-200/50 dark:border-slate-800/40"
          >
            <Edit2 size={16} />
            Edit Profile
          </Button>
          {user?.role === 'admin' ? (
            <Button
              variant="secondary"
              onClick={() => setDeleteConfirmOpen(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 border border-rose-200/50 dark:border-rose-900/30 text-rose-600 dark:text-rose-455 hover:bg-rose-50 dark:hover:bg-rose-950/20"
            >
              <Trash2 size={16} />
              Delete Record
            </Button>
          ) : (
            <Button
              disabled
              variant="secondary"
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-85 text-slate-300 dark:text-slate-700 cursor-not-allowed"
              title="Deletions restricted to Admin roles"
            >
              <Trash2 size={16} />
              Delete Record
            </Button>
          )}
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Card & Basic Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card p-8 rounded-2xl relative overflow-hidden">
            {/* Visual background ambient glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 dark:bg-indigo-500/3 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Profile Avatar Initials */}
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 tracking-wider">
                {initials}
              </div>

              <div className="space-y-4 text-center sm:text-left flex-1">
                <div>
                  <h3 className="font-extrabold text-3xl text-slate-800 dark:text-slate-100 tracking-tight">
                    {lead.name}
                  </h3>
                  {lead.company && (
                    <p className="text-indigo-600 dark:text-indigo-400 font-extrabold text-sm mt-0.5">
                      {lead.company}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${statusConfig[lead.status].color}`}>
                      {lead.status}
                    </span>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-lg ${sourceColors[lead.source]}`}>
                      {lead.source}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2 text-sm text-slate-555 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-slate-400" />
                    <span>{lead.email}</span>
                    <button
                      onClick={handleCopyEmail}
                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-650 dark:hover:text-slate-300 transition-all inline-flex"
                      title="Copy email to clipboard"
                    >
                      {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    </button>
                  </div>
                  {lead.phone && (
                    <>
                      <span className="hidden sm:inline text-slate-300 dark:text-slate-800">•</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-400 dark:text-slate-550">Phone:</span>
                        <span>{lead.phone}</span>
                      </div>
                    </>
                  )}
                  <span className="hidden sm:inline text-slate-300 dark:text-slate-800">•</span>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-slate-400" />
                    <span>Added on {new Date(lead.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Progression Visualizer */}
            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800/60">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Lead Conversion Pipeline
                </span>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  {statusConfig[lead.status].percentage} Processed
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-200/20 dark:border-slate-800/20">
                <div className={`h-2.5 rounded-full transition-all duration-500 ease-out ${statusConfig[lead.status].progress}`} />
              </div>
              <div className="grid grid-cols-5 text-center mt-3 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                <span className={lead.status === 'New' ? 'text-indigo-500 dark:text-indigo-400 font-black' : ''}>New</span>
                <span className={lead.status === 'Contacted' ? 'text-amber-500 dark:text-amber-400 font-black' : ''}>Contacted</span>
                <span className={lead.status === 'Qualified' ? 'text-emerald-500 dark:text-emerald-400 font-black' : ''}>Qualified</span>
                <span className={lead.status === 'Converted' ? 'text-cyan-500 dark:text-cyan-400 font-black' : ''}>Converted</span>
                <span className={lead.status === 'Lost' ? 'text-rose-500 dark:text-rose-455 font-black' : ''}>Lost</span>
              </div>
            </div>
          </div>

          {/* Timeline / Activities */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 space-y-6">
            <div className="flex items-center gap-2.5">
              <Activity size={18} className="text-indigo-500 dark:text-indigo-400" />
              <h4 className="font-extrabold text-lg text-slate-800 dark:text-slate-100">
                Timeline & Event logs
              </h4>
            </div>

            <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-800/80 space-y-6">
              {/* Event 2: Updated */}
              {lead.updatedAt !== lead.createdAt && (
                <div className="relative">
                  <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-amber-500/10 border-2 border-amber-500 flex items-center justify-center bg-white dark:bg-slate-900">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 dark:text-slate-500 block mb-1">
                      {new Date(lead.updatedAt).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })}
                    </span>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Lead record edited/updated
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Status has transitioned or user metadata was adjusted.
                    </p>
                  </div>
                </div>
              )}

              {/* Event 1: Created */}
              <div className="relative">
                <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-indigo-500/10 border-2 border-indigo-500 flex items-center justify-center bg-white dark:bg-slate-900">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 dark:text-slate-500 block mb-1">
                    {new Date(lead.createdAt).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </span>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Lead entered system via {lead.source}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Lead assigned to sales agent {lead.createdBy?.name || 'Unknown'}.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info - Creator / Ownership */}
        <div className="space-y-8">
          <div className="glass-panel p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 space-y-6">
            <div className="flex items-center gap-2.5">
              <User size={18} className="text-indigo-500 dark:text-indigo-400" />
              <h4 className="font-extrabold text-lg text-slate-800 dark:text-slate-100">
                Lead Ownership
              </h4>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center">
                  {lead.createdBy?.name.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 block">
                    {lead.createdBy?.name || 'System Seeder'}
                  </span>
                  <span className="text-xs text-slate-555 dark:text-slate-400 capitalize block">
                    {lead.createdBy?.role || 'sales'} Agent
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 dark:text-slate-500 font-semibold">Agent Email:</span>
                  <span className="text-slate-700 dark:text-slate-350 font-bold">{lead.createdBy?.email || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 dark:text-slate-500 font-semibold">User Role:</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-extrabold capitalize">{lead.createdBy?.role || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Lead Stats */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 space-y-4">
            <div className="flex items-center gap-2.5">
              <Tag size={18} className="text-indigo-500 dark:text-indigo-400" />
              <h4 className="font-extrabold text-lg text-slate-800 dark:text-slate-100">
                System Identifiers
              </h4>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 dark:text-slate-500 font-semibold font-sans">Lead ID:</span>
                <span className="text-slate-650 dark:text-slate-350 font-mono select-all bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">{lead._id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 dark:text-slate-500 font-semibold">Creation Sync:</span>
                <span className="text-slate-700 dark:text-slate-350 font-bold">Success</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <LeadFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchLeadDetails}
        lead={
          lead
            ? {
                id: lead._id,
                name: lead.name,
                email: lead.email,
                phone: lead.phone,
                company: lead.company,
                status: lead.status,
                source: lead.source,
              }
            : null
        }
      />

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Delete Lead Record"
        message={`Are you sure you want to permanently delete lead: "${lead.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={() => {
          setDeleteConfirmOpen(false);
          handleDeleteLead();
        }}
        onCancel={() => setDeleteConfirmOpen(false)}
        isDanger={true}
      />
    </div>
  );
};

export default LeadDetails;
