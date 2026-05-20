import React, { useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.tsx';
import { ThemeContext } from '../App.tsx';
import Input from '../components/common/Input.tsx';
import Button from '../components/common/Button.tsx';
import { TrendingUp, Sun, Moon, Sparkles, User, ShieldCheck } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please provide a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
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
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    setApiError(null);
    setSubmitting(true);
    try {
      const response = await axios.post('/auth/login', values);
      const { token, user } = response.data.data;
      
      login(token, {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
      
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid email or password. Please try again.';
      setApiError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAutofill = (role: 'admin' | 'sales') => {
    if (role === 'admin') {
      setValue('email', 'admin@dashboard.com');
      setValue('password', 'password123');
    } else {
      setValue('email', 'sales@dashboard.com');
      setValue('password', 'password123');
    }
  };

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
            Welcome Back
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Access the Smart Leads Dashboard
          </p>
        </div>

        {/* Frosted Glass Login Card */}
        <div className="glass-card p-8 rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl relative">
          {apiError && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold animate-pulse">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

            <Button
              type="submit"
              variant="primary"
              loading={submitting}
              className="w-full py-3 shadow-lg shadow-indigo-650/15 dark:shadow-indigo-500/10"
            >
              Sign In
            </Button>
          </form>

          {/* Quick Demo Autofill section for effortless testing */}
          <div className="mt-8 pt-6 border-t border-slate-200/60 dark:border-slate-800/40">
            <div className="flex items-center gap-1.5 justify-center text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" style={{ animationDuration: '3s' }} />
              <span>Demo Quick Autofill</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleAutofill('admin')}
                className="flex items-center justify-center gap-2 p-2 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white/30 dark:bg-slate-900/30 hover:bg-slate-100 dark:hover:bg-slate-900 hover:border-rose-500/20 dark:hover:border-rose-500/30 text-[11px] font-bold text-slate-500 hover:text-rose-550 dark:hover:text-rose-400 transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin User</span>
              </button>
              <button
                type="button"
                onClick={() => handleAutofill('sales')}
                className="flex items-center justify-center gap-2 p-2 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white/30 dark:bg-slate-900/30 hover:bg-slate-100 dark:hover:bg-slate-900 hover:border-emerald-500/20 dark:hover:border-emerald-500/30 text-[11px] font-bold text-slate-500 hover:text-emerald-650 dark:hover:text-emerald-400 transition-all"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sales User</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-sm">
            <span className="text-slate-500 dark:text-slate-400">Don't have an account? </span>
            <Link
              to="/register"
              className="font-bold text-indigo-650 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors underline underline-offset-4 decoration-indigo-500/30"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
