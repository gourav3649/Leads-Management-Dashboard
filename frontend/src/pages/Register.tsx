import React, { useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.tsx';
import { ThemeContext } from '../App.tsx';
import Input from '../components/common/Input.tsx';
import Select from '../components/common/Select.tsx';
import Button from '../components/common/Button.tsx';
import { TrendingUp, Sun, Moon, Sparkles, Shield, User } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  email: z.string().min(1, 'Email is required').email('Please provide a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  role: z.enum(['admin', 'sales']),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register: React.FC = () => {
  const { login } = useAuth();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'sales',
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setApiError(null);
    setSubmitting(true);
    try {
      const response = await axios.post('/auth/register', values);
      const { token, user } = response.data.data;

      login(token, {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      });

      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to register. Please try again.';
      setApiError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const roleOptions = [
    { label: 'Sales User (Standard access)', value: 'sales' },
    { label: 'Admin User (Lead deletion allowed)', value: 'admin' },
  ];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 relative overflow-hidden grid-bg">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/10 dark:bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Floating Theme Switcher at Top-Right */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/50 backdrop-blur-md text-slate-600 dark:text-slate-400 hover:text-indigo-650 dark:hover:text-indigo-400 hover:border-indigo-500/30 transition-all shadow-sm z-10"
        title="Toggle Theme"
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="bg-indigo-600 dark:bg-indigo-500 p-3 rounded-2xl text-white shadow-xl shadow-indigo-500/20 mb-4 hover:scale-105 transition-transform duration-300">
            <TrendingUp size={28} />
          </div>
          <h2 className="font-extrabold text-3xl text-slate-800 dark:text-slate-100 tracking-tight font-sans bg-gradient-to-r from-slate-850 to-slate-600 dark:from-slate-100 dark:to-slate-350 bg-clip-text text-transparent">
            Create Account
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Get started with Smart Leads Dashboard
          </p>
        </div>

        {/* Frosted Glass Register Card */}
        <div className="glass-card p-8 rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl relative">
          {apiError && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold animate-pulse">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="Your Full Name"
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />

            <Select
              label="Account Role"
              options={roleOptions}
              error={errors.role?.message}
              {...register('role')}
            />

            <Button
              type="submit"
              variant="primary"
              loading={submitting}
              className="w-full py-3 mt-2 shadow-lg shadow-indigo-650/15 dark:shadow-indigo-500/10"
            >
              Get Started
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-slate-500 dark:text-slate-400">Already have an account? </span>
            <Link
              to="/login"
              className="font-bold text-indigo-650 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors underline underline-offset-4 decoration-indigo-500/30"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
