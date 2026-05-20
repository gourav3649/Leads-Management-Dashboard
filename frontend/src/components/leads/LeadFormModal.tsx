import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import Input from '../common/Input.tsx';
import Select from '../common/Select.tsx';
import Button from '../common/Button.tsx';
import { X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';

const leadFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  email: z.string().min(1, 'Email is required').email('Please provide a valid email address'),
  phone: z.string().optional(),
  company: z.string().optional(),
  status: z.enum(['New', 'Contacted', 'Qualified', 'Converted', 'Lost']),
  source: z.enum(['Website', 'Instagram', 'Referral']),
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

interface LeadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  lead?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    company?: string;
    status: 'New' | 'Contacted' | 'Qualified' | 'Converted' | 'Lost';
    source: 'Website' | 'Instagram' | 'Referral';
  } | null;
}

export const LeadFormModal: React.FC<LeadFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  lead = null,
}) => {
  const { user } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      status: 'New',
      source: 'Website',
      phone: '',
      company: '',
    },
  });

  useEffect(() => {
    if (lead) {
      setValue('name', lead.name);
      setValue('email', lead.email);
      setValue('phone', lead.phone || '');
      setValue('company', lead.company || '');
      setValue('status', lead.status);
      setValue('source', lead.source);
    } else {
      reset({
        name: '',
        email: '',
        phone: '',
        company: '',
        status: 'New',
        source: 'Website',
      });
    }
    setApiError(null);
  }, [lead, setValue, reset, isOpen]);

  if (!isOpen) return null;

  const onSubmit = async (values: LeadFormValues) => {
    setApiError(null);
    setSubmitting(true);
    try {
      const isNew = !lead;
      const statusChanged = lead ? lead.status !== values.status : true;
      const isConverted = values.status === 'Converted';

      if (lead) {
        await axios.put(`/leads/${lead.id}`, values);
      } else {
        await axios.post('/leads', values);
      }

      // Dispatch activity and confetti events
      const activityEvent = {
        id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        type: isConverted ? 'convert' : (isNew ? 'create' : 'status_change'),
        message: isNew 
          ? `Created lead "${values.name}" for "${values.company || 'N/A'}"`
          : (statusChanged 
              ? `Updated status of "${values.name}" to "${values.status}"`
              : `Modified profile details for "${values.name}"`),
        leadName: values.name,
        user: user?.name || 'Sales Agent',
        timestamp: new Date()
      };

      window.dispatchEvent(new CustomEvent('smart_leads_activity_log', { detail: activityEvent }));

      if (statusChanged && isConverted) {
        window.dispatchEvent(new CustomEvent('smart_leads_confetti'));
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to save lead. Please check input parameters.';
      setApiError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const statusOptions = [
    { label: 'New', value: 'New' },
    { label: 'Contacted', value: 'Contacted' },
    { label: 'Qualified', value: 'Qualified' },
    { label: 'Converted', value: 'Converted' },
    { label: 'Lost', value: 'Lost' },
  ];

  const sourceOptions = [
    { label: 'Website', value: 'Website' },
    { label: 'Instagram', value: 'Instagram' },
    { label: 'Referral', value: 'Referral' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
      <div 
        className="fixed inset-0 bg-transparent" 
        onClick={onClose} 
      />

      <div className="relative w-full max-w-lg glass-card p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 shadow-2xl z-10 transform scale-100 transition-all duration-300">
        <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
          <h3 className="font-extrabold text-2xl text-slate-800 dark:text-slate-100 font-sans">
            {lead ? 'Update Lead' : 'Create New Lead'}
          </h3>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        {apiError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Name"
            placeholder="John Doe"
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="john.doe@example.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Phone"
              placeholder="+91 98765 43210"
              error={errors.phone?.message}
              {...register('phone')}
            />

            <Input
              label="Company"
              placeholder="Tech Mahindra"
              error={errors.company?.message}
              {...register('company')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Status"
              options={statusOptions}
              error={errors.status?.message}
              {...register('status')}
            />

            <Select
              label="Source"
              options={sourceOptions}
              error={errors.source?.message}
              {...register('source')}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={submitting}
              className="px-6"
            >
              {lead ? 'Save Changes' : 'Create Lead'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
