import React, { useState } from 'react';
import { useCreateStaffMutation, useGetUsersStatsQuery } from '../redux/api/authApi';
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
  Search,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage } from '../helpers/errorHelper';

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

  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [statsSearch, setStatsSearch] = useState('');
  const [statsRole, setStatsRole] = useState('');
  const [statsPage, setStatsPage] = useState(1);

  const { data: statsResponse, isLoading: isStatsLoading } = useGetUsersStatsQuery(
    {
      searchTerm: statsSearch || undefined,
      role: statsRole || undefined,
      page: statsPage,
      limit: 5,
    },
    {
      skip: !isStatsOpen,
    }
  );

  const statsData = statsResponse?.data || [];
  const statsPagination = statsResponse?.pagination || { page: 1, limit: 5, totalPage: 1, total: 0 };

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
      toast.error('Please fill in all required fields.');
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
      const msg = `Staff account for ${name} (${role}) created successfully!`;
      setSuccess(`${msg} They can log in immediately.`);
      toast.success(msg);
      resetForm();
    } catch (err: any) {
      const errMsg = getErrorMessage(err);
      setError(errMsg);
      toast.error(errMsg);
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-900 mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-lg">
              <UserPlus size={18} />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100">Create Staff Member</h3>
              <p className="text-[10px] text-slate-400">Register a new system user with specialized roles and permissions</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsStatsOpen(true)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg font-bold hover:bg-purple-600 hover:text-white hover:border-purple-600 dark:hover:bg-purple-600 dark:hover:border-purple-600 cursor-pointer transition-all self-start sm:self-center"
          >
            <Shield size={14} /> View Staff Statistics
          </button>
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

      {/* ─── STAFF STATISTICS POPUP MODAL ─────────────────────────── */}
      {isStatsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-scale-up text-left">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-950/50">
              <div className="flex items-center gap-2">
                <Shield className="text-purple-600 dark:text-purple-400" size={18} />
                <div>
                  <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100">Registered Staff & Transaction Stats</h3>
                  <p className="text-[10px] text-slate-400">View active users, transaction counts, and generated revenue metrics</p>
                </div>
              </div>
              <button
                onClick={() => setIsStatsOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-900 text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row gap-4 p-5 border-b border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950">
              {/* Search */}
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Search size={14} />
                </span>
                <input
                  type="text"
                  value={statsSearch}
                  onChange={(e) => {
                    setStatsSearch(e.target.value);
                    setStatsPage(1); // reset page on search
                  }}
                  placeholder="Search staff by name, email, contact..."
                  className="w-full text-[11px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-2 pl-8.5 pr-3 focus:outline-none focus:border-purple-500 transition-all"
                />
              </div>

              {/* Role filter */}
              <div className="w-full sm:w-48">
                <select
                  value={statsRole}
                  onChange={(e) => {
                    setStatsRole(e.target.value);
                    setStatsPage(1); // reset page on filter
                  }}
                  className="w-full text-[11px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-2 px-3 focus:outline-none focus:border-purple-500 transition-all"
                >
                  <option value="">All Roles</option>
                  <option value="ADMIN">Admins Only</option>
                  <option value="MANAGER">Managers Only</option>
                  <option value="EMPLOYEE">Employees Only</option>
                </select>
              </div>
            </div>

            {/* Stats Table / List Content */}
            <div className="flex-1 overflow-y-auto p-5 min-h-[250px]">
              {isStatsLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-2">
                  <Loader2 className="animate-spin text-purple-600" size={24} />
                  <p className="text-slate-400 text-[10px]">Loading staff metrics...</p>
                </div>
              ) : statsData.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <UserPlus className="mx-auto mb-2 opacity-30" size={32} />
                  <p className="text-[11px] font-semibold">No matching staff accounts found</p>
                  <p className="text-[10px] text-slate-450 mt-0.5">Try widening your search terms or filters</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200/50 dark:border-slate-900 rounded-xl">
                  <table className="w-full min-w-[600px] border-collapse text-[11px]">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-950/30 text-slate-500 font-bold">
                        <td className="py-2.5 px-4 text-left">Staff Member</td>
                        <td className="py-2.5 px-4 text-left">Role</td>
                        <td className="py-2.5 px-4 text-center">Transactions</td>
                        <td className="py-2.5 px-4 text-right">Revenue Generated</td>
                        <td className="py-2.5 px-4 text-center">Status</td>
                      </tr>
                    </thead>
                    <tbody>
                      {statsData.map((staff: any) => (
                        <tr
                          key={staff._id}
                          className="border-b border-slate-100 dark:border-slate-900/50 hover:bg-slate-50/30 dark:hover:bg-slate-900/10"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5 text-left">
                              <img
                                src={staff.image || 'https://i.ibb.co/z5YHLV9/profile.png'}
                                alt={staff.name}
                                className="h-7 w-7 rounded-full object-cover border border-slate-200 dark:border-slate-800"
                              />
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{staff.name}</p>
                                <p className="text-[9px] text-slate-400 mt-0.5 font-mono truncate">{staff.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-650 dark:text-slate-450">
                            {staff.role}
                          </td>
                          <td className="py-3 px-4 text-center font-bold text-slate-900 dark:text-slate-100">
                            {staff.totalSales}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-purple-700 dark:text-purple-400">
                            ${(staff.totalRevenue || 0).toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                              staff.status === 'active'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/5'
                                : 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/5'
                            }`}>
                              {staff.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Pagination Footer */}
            {statsPagination.totalPage > 1 && (
              <div className="p-4 border-t border-slate-100 dark:border-slate-900 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
                <span className="text-[10px] text-slate-405 dark:text-slate-500">
                  Showing page {statsPagination.page} of {statsPagination.totalPage} ({statsPagination.total} total staff)
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={statsPagination.page <= 1}
                    onClick={() => setStatsPage((prev) => prev - 1)}
                    className="p-1 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 rounded cursor-pointer disabled:opacity-40"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    disabled={statsPagination.page >= statsPagination.totalPage}
                    onClick={() => setStatsPage((prev) => prev + 1)}
                    className="p-1 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 rounded cursor-pointer disabled:opacity-40"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
            
          </div>
        </div>
      )}

    </div>
  );
};
