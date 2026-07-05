import React, { useState } from 'react';
import { useCreateStaffMutation } from '../redux/api/authApi';
import {
  UserPlus,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Shield,
  Loader2,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

export const CreateStaff: React.FC = () => {
  const [createStaff, { isLoading }] = useCreateStaffMutation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'MANAGER' | 'EMPLOYEE'>('EMPLOYEE');
  const [contact, setContact] = useState('');
  const [location, setLocation] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setRole('EMPLOYEE');
    setContact('');
    setLocation('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name || !email || !password || !role) {
      setError('Please fill in all required fields.');
      return;
    }

    const payload = {
      name,
      email,
      password,
      role,
      contact: contact || undefined,
      location: location || undefined,
    };

    try {
      await createStaff(payload).unwrap();
      setSuccess(`Staff account for ${name} (${role}) created successfully! They can log in immediately.`);
      resetForm();
    } catch (err: any) {
      setError(err?.data?.message || 'Failed to create staff account. Please verify details.');
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 text-xs">
      
      {error && (
        <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 flex items-start gap-2 animate-scale-up">
          <AlertTriangle className="shrink-0 mt-0.5" size={16} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-start gap-2 animate-scale-up">
          <CheckCircle className="shrink-0 mt-0.5" size={16} />
          <span>{success}</span>
        </div>
      )}

      {/* Main card */}
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden p-6">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-900 mb-6">
          <div className="p-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-lg">
            <UserPlus size={18} />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100">Create Staff Member</h3>
            <p className="text-[10px] text-slate-400">Register a new system user with specialized roles and permissions</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Name & Email Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-500 mb-1.5 font-semibold text-left">Full Name *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <User size={14} />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-2.5 pl-9 pr-3 focus:outline-none focus:border-purple-500 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-500 mb-1.5 font-semibold text-left">Email Address *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Mail size={14} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@gmail.com"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-2.5 pl-9 pr-3 focus:outline-none focus:border-purple-500 transition-all"
                  required
                />
              </div>
            </div>
          </div>

          {/* Password & Role Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-500 mb-1.5 font-semibold text-left">Password *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Lock size={14} />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-2.5 pl-9 pr-3 focus:outline-none focus:border-purple-500 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-500 mb-1.5 font-semibold text-left">Account Role *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Shield size={14} />
                </span>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-2.5 pl-9 pr-3 focus:outline-none focus:border-purple-500 transition-all"
                  required
                >
                  <option value="EMPLOYEE">Employee (Sales & View Products)</option>
                  <option value="MANAGER">Manager (Sales & Product Management)</option>
                  <option value="ADMIN">Admin (Full Control)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Optional Contact & Location Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-500 mb-1.5 font-semibold text-left">Contact Number (Optional)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Phone size={14} />
                </span>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="+8801700000000"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-2.5 pl-9 pr-3 focus:outline-none focus:border-purple-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-500 mb-1.5 font-semibold text-left">Location (Optional)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <MapPin size={14} />
                </span>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Dhaka, Bangladesh"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-2.5 pl-9 pr-3 focus:outline-none focus:border-purple-500 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-900 flex justify-end gap-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg font-semibold hover:bg-slate-50 cursor-pointer"
            >
              Reset Form
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-purple-500/10 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <>
                  <UserPlus size={14} /> Register Staff
                </>
              )}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};
