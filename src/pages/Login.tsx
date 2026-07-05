import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../redux/api/authApi';
import { useAppDispatch } from '../redux/hooks';
import { setCredentials, type UserPayload } from '../redux/slices/authSlice';
import { Lock, Mail, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage } from '../helpers/errorHelper';

const decodeToken = (token: string): any => {
  try {
    const payload = token.split('.')[1];
    // Replace URL-safe Base64 chars
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
  } catch (e) {
    return null;
  }
};

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please fill in all fields.');
      toast.error('Please fill in all fields.');
      return;
    }

    try {
      const response: any = await login({ email, password }).unwrap();
      const token = response.data; // token string
      
      const decoded = decodeToken(token);
      if (!decoded) {
        throw new Error('Failed to parse token payload.');
      }

      // Prepare user payload from decoded JWT
      const user: UserPayload = {
        id: decoded.id,
        role: decoded.role,
        email: decoded.email,
        name: decoded.name || 'User', // Fallback, profile endpoint will load name
      };

      dispatch(setCredentials({ user, token }));
      toast.success('Logged in successfully!');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      const errMsg = getErrorMessage(err);
      setError(errMsg);
      toast.error(errMsg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 px-4 py-12 relative overflow-hidden">
      
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />

      {/* Login Card */}
      <div className="w-full max-w-md bg-white/5 dark:bg-slate-950/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl z-10">
        <div className="text-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white font-black text-2xl mx-auto shadow-lg shadow-purple-500/20">
            M
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white mt-4">Welcome back</h2>
          <p className="text-sm text-slate-400 mt-1.5">Sign in to manage your inventory and sales</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Mail size={16} />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@gmail.com"
                className="w-full bg-slate-900/60 dark:bg-slate-900 border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Lock size={16} />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900/60 dark:bg-slate-900 border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white rounded-lg py-2.5 font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-purple-500/20 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                Sign In <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-white/10 pt-6">
          <p className="text-xs text-slate-500">
            Default Admin credentials: <span className="text-slate-400">admin@gmail.com</span> / <span className="text-slate-400">12345678</span>
          </p>
        </div>
      </div>
    </div>
  );
};
