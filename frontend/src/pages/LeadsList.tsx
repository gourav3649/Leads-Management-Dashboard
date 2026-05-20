import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.tsx';
import { useDebounce } from '../hooks/useDebounce.ts';
import { LeadFormModal } from '../components/leads/LeadFormModal.tsx';
import ConfirmDialog from '../components/common/ConfirmDialog.tsx';
import Button from '../components/common/Button.tsx';
import Spinner from '../components/common/Spinner.tsx';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit2,
  Trash2,
  Filter,
  AlertTriangle,
  FileSpreadsheet
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

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const LeadsList: React.FC = () => {
  const { user } = useAuth();
  
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [source, setSource] = useState<string>('');
  const [sort, setSort] = useState<'latest' | 'oldest'>('latest');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  
  const debouncedSearch = useDebounce(search, 400);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<{
    id: string;
    name: string;
    email: string;
    phone?: string;
    company?: string;
    status: 'New' | 'Contacted' | 'Qualified' | 'Converted' | 'Lost';
    source: 'Website' | 'Instagram' | 'Referral';
  } | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<{ id: string; name: string } | null>(null);

  const fetchLeads = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: 10,
        sort,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(status && { status }),
        ...(source && { source }),
      };

      const response = await axios.get('/leads', { params });
      setLeads(response.data.data);
      setPagination(response.data.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch leads. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [debouncedSearch, status, source, sort, page]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, source, sort]);

  const handleDeleteClick = (id: string, name: string) => {
    setLeadToDelete({ id, name });
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!leadToDelete) return;
    try {
      await axios.delete(`/leads/${leadToDelete.id}`);
      fetchLeads();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete lead.');
    } finally {
      setDeleteConfirmOpen(false);
      setLeadToDelete(null);
    }
  };

  const handleEditClick = (lead: Lead) => {
    setSelectedLead({
      id: lead._id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      status: lead.status,
      source: lead.source,
    });
    setModalOpen(true);
  };

  const handleCreateClick = () => {
    setSelectedLead(null);
    setModalOpen(true);
  };

  const handleExportCsv = async () => {
    try {
      const params = {
        sort,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(status && { status }),
        ...(source && { source }),
      };
      
      const response = await axios.get('/leads/export', {
        params,
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      alert('Failed to export CSV.');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-extrabold text-3xl text-slate-800 dark:text-slate-100 tracking-tight font-sans">
            Leads Database
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Manage, filter, search, and track all leads registered in the system.
          </p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Button
            variant="secondary"
            onClick={handleExportCsv}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 border border-slate-200/50 dark:border-slate-800/40"
            title="Download CSV"
          >
            <FileSpreadsheet size={16} />
            Export CSV
          </Button>
          <Button
            variant="primary"
            onClick={handleCreateClick}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            Add Lead
          </Button>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border border-slate-200/50 dark:border-slate-800/40">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search by name, email, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-850 placeholder-slate-400 dark:text-slate-100"
          />
        </div>

        <div className="relative">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-855 dark:text-slate-100"
          >
            <option value="">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Converted">Converted</option>
            <option value="Lost">Lost</option>
          </select>
        </div>

        <div className="relative">
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-855 dark:text-slate-100"
          >
            <option value="">All Sources</option>
            <option value="Website">Website</option>
            <option value="Instagram">Instagram</option>
            <option value="Referral">Referral</option>
          </select>
        </div>

        <div className="relative">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as 'latest' | 'oldest')}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-855 dark:text-slate-100"
          >
            <option value="latest">Sort by: Latest</option>
            <option value="oldest">Sort by: Oldest</option>
          </select>
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-200/50 dark:border-slate-800/40">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Spinner size="lg" />
            <span className="text-xs font-semibold text-slate-400 mt-4 animate-pulse">
              Loading leads database...
            </span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="p-3 bg-rose-500/10 text-rose-500 rounded-full mb-4">
              <AlertTriangle size={32} />
            </div>
            <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100">Error Loading Leads</h4>
            <p className="text-slate-500 text-sm mt-1 max-w-md">{error}</p>
            <Button variant="secondary" onClick={fetchLeads} className="mt-4">
              Retry Connection
            </Button>
          </div>
        ) : leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full mb-4">
              <Filter size={32} />
            </div>
            <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100">No Leads Found</h4>
            <p className="text-slate-500 text-sm mt-1 max-w-sm">
              We couldn't find any leads matching the specified filters or search query.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full relative">
            <table className="min-w-[1000px] w-full border-collapse text-left table-fixed">
              <thead>
                <tr className="bg-slate-100/50 dark:bg-slate-900/40 border-b border-slate-200/50 dark:border-slate-800/40 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  <th className="px-6 py-4 w-[18%]">Lead Name</th>
                  <th className="px-6 py-4 w-[20%]">Company</th>
                  <th className="px-6 py-4 w-[22%]">Email</th>
                  <th className="px-6 py-4 w-[12%]">Status</th>
                  <th className="px-6 py-4 w-[12%]">Source</th>
                  <th className="px-6 py-4 w-[16%] text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800/40 text-sm">
                {leads.map((lead) => {
                  const statusColors = {
                    New: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20',
                    Contacted: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
                    Qualified: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
                    Converted: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20',
                    Lost: 'bg-rose-500/10 text-rose-600 dark:text-rose-45 border border-rose-500/20',
                  };

                  const sourceColors = {
                    Website: 'bg-slate-100 text-slate-655 dark:bg-slate-800 dark:text-slate-350',
                    Instagram: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/10',
                    Referral: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/10',
                  };

                  return (
                    <tr 
                      key={lead._id}
                      className="hover:bg-slate-100/20 dark:hover:bg-slate-900/10 transition-colors"
                    >
                      <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-100 truncate" title={lead.name}>
                        {lead.name}
                      </td>
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300 truncate font-medium" title={lead.company || ''}>
                        {lead.company || <span className="text-slate-400 dark:text-slate-600 italic">—</span>}
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400 truncate" title={lead.email}>
                        {lead.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${statusColors[lead.status]}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${sourceColors[lead.source]}`}>
                          {lead.source}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right pr-6 space-x-1.5 whitespace-nowrap">
                        <Link to={`/leads/${lead._id}`}>
                          <button 
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-550 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 transition-colors inline-flex"
                            title="View details"
                          >
                            <Eye size={14} />
                          </button>
                        </Link>
                        <button 
                          onClick={() => handleEditClick(lead)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-550 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 transition-colors inline-flex"
                          title="Edit lead"
                        >
                          <Edit2 size={14} />
                        </button>
                        {user?.role === 'admin' ? (
                          <button 
                            onClick={() => handleDeleteClick(lead._id, lead.name)}
                            className="p-1.5 rounded-lg border border-rose-200/50 dark:border-rose-900/30 text-rose-600 dark:text-rose-455 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors inline-flex"
                            title="Delete lead (Admin only)"
                          >
                            <Trash2 size={14} />
                          </button>
                        ) : (
                          <button 
                            disabled
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-85 text-slate-300 dark:text-slate-700 cursor-not-allowed inline-flex"
                            title="Deletions restricted to Admin roles"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-slate-100/30 dark:bg-slate-900/10 border-t border-slate-200/50 dark:border-slate-800/40">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Showing Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong> ({pagination.total} leads)
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={!pagination.hasPrevPage}
                className="flex items-center gap-1 border border-slate-200/50 dark:border-slate-800/40"
              >
                <ChevronLeft size={14} />
                Prev
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                disabled={!pagination.hasNextPage}
                className="flex items-center gap-1 border border-slate-200/50 dark:border-slate-800/40"
              >
                Next
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        )}
      </div>

      <LeadFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchLeads}
        lead={selectedLead}
      />

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Delete Lead Record"
        message={`Are you sure you want to permanently delete lead: "${leadToDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setLeadToDelete(null);
        }}
        isDanger={true}
      />
    </div>
  );
};

export default LeadsList;
