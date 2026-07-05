import React from 'react';
import { useGetDashboardStatsQuery } from '../redux/api/dashboardApi';
import { useGetProductsQuery } from '../redux/api/productApi';
import { useGetSalesHistoryQuery } from '../redux/api/salesApi';
import { useAppSelector } from '../redux/hooks';
import { Package, TrendingUp, AlertTriangle, AlertCircle, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  
  // Conditionally query the admin dashboard stats
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const { data: statsResponse, isLoading: statsLoading } = useGetDashboardStatsQuery(undefined, {
    skip: !isAdmin,
  });

  // Query products list to get client-side fallback if not admin, or list low stock items
  const { data: productsResponse, isLoading: productsLoading } = useGetProductsQuery({ limit: 100 });
  const { data: salesResponse, isLoading: salesLoading } = useGetSalesHistoryQuery(undefined);

  const products = productsResponse?.data || [];
  const sales = salesResponse?.data || [];

  // Compute stats client-side (used as fallback or validation)
  const clientTotalProducts = products.length;
  const clientTotalSales = sales.length;
  const clientLowStockProducts = products.filter((p: any) => p.stockQuantity < 5);
  const clientLowStockCount = clientLowStockProducts.length;

  const totalSalesRevenue = sales.reduce((acc: number, sale: any) => acc + sale.grandTotal, 0);

  // Pick stats depending on role
  const stats = isAdmin && statsResponse?.data ? {
    totalProducts: statsResponse.data.totalProducts,
    totalSales: statsResponse.data.totalSales,
    lowStockProducts: statsResponse.data.lowStockProducts,
  } : {
    totalProducts: clientTotalProducts,
    totalSales: clientTotalSales,
    lowStockProducts: clientLowStockCount,
  };

  const isLoading = productsLoading || salesLoading || (isAdmin && statsLoading);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  // Low stock products to display in the list
  const lowStockList = products.filter((p: any) => p.stockQuantity < 5);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-900 to-indigo-900 text-white shadow-xl">
        <h2 className="text-xl font-bold">Hello, {user?.name}!</h2>
        <p className="text-sm text-purple-200 mt-1">Here is a quick overview of your inventory status and recent sales metrics.</p>
      </div>

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Products */}
        <div className="p-6 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-5">
          <div className="p-3.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-lg">
            <Package size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Products</p>
            <h3 className="text-2xl font-bold mt-1">{stats.totalProducts}</h3>
          </div>
        </div>

        {/* Total Sales count */}
        <div className="p-6 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-5">
          <div className="p-3.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Transactions</p>
            <h3 className="text-2xl font-bold mt-1">{stats.totalSales}</h3>
            {sales.length > 0 && (
              <p className="text-[10px] text-slate-400 mt-0.5">Revenue: ${totalSalesRevenue.toFixed(2)}</p>
            )}
          </div>
        </div>

        {/* Low Stock count */}
        <div className="p-6 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-5">
          <div className="p-3.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Low Stock Alerts</p>
            <h3 className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-500">{stats.lowStockProducts}</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Threshold: less than 5 units</p>
          </div>
        </div>

      </div>

      {/* Main Grid: Low stock alerts list and Recent sales list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Low Stock Alert Board */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-900">
            <h3 className="font-bold flex items-center gap-2">
              <AlertCircle className="text-amber-500" size={18} />
              Low Stock Items
            </h3>
            <span className="text-xs text-slate-500">Must restock immediately</span>
          </div>

          <div className="flex-1 overflow-x-auto mt-4">
            {lowStockList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <CheckCircleIcon className="text-emerald-500 mb-2" size={32} />
                <p className="text-sm font-medium">All items have healthy stock levels!</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-100 dark:border-slate-900">
                    <th className="py-2.5 font-medium">Product Name</th>
                    <th className="py-2.5 font-medium">SKU</th>
                    <th className="py-2.5 font-medium text-center">Stock</th>
                    <th className="py-2.5 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockList.map((product: any) => (
                    <tr key={product._id} className="border-b border-slate-50 dark:border-slate-900/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                      <td className="py-3 font-semibold">{product.name}</td>
                      <td className="py-3 font-mono text-slate-500">{product.sku}</td>
                      <td className="py-3 text-center">
                        <span className={`px-2 py-0.5 rounded font-bold ${
                          product.stockQuantity === 0 
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' 
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }`}>
                          {product.stockQuantity} Left
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          to={`/products?edit=${product._id}`}
                          className="px-2.5 py-1 text-[11px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-500/10 rounded hover:bg-purple-500 hover:text-white transition-all cursor-pointer"
                        >
                          Restock
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Recent Activity Board */}
        <div className="p-6 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-900">
            <h3 className="font-bold flex items-center gap-2">
              <ShoppingBag className="text-purple-500" size={18} />
              Recent Transactions
            </h3>
            <Link to="/sales-history" className="text-xs text-purple-600 dark:text-purple-400 hover:underline">
              View All
            </Link>
          </div>

          <div className="flex-1 mt-4 space-y-4">
            {sales.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No sales transactions logged yet.</p>
            ) : (
              sales.slice(0, 5).map((sale: any) => (
                <div key={sale._id} className="flex items-center justify-between text-xs p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      Sale #{sale._id.substring(sale._id.length - 6).toUpperCase()}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(sale.saleDate).toLocaleDateString()} • {sale.products.length} Products
                    </p>
                  </div>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    +${sale.grandTotal.toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

// Internal icon component to avoid importing check-circle
const CheckCircleIcon: React.FC<{ className?: string; size?: number }> = ({ className, size = 20 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    width={size}
    height={size}
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <path d="m9 11 3 3L22 4" />
  </svg>
);
