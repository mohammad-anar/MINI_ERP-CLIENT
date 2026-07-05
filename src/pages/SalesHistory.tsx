import React, { useState } from 'react';
import { useGetSalesHistoryQuery } from '../redux/api/salesApi';
import { getImageUrl } from '../helpers/image';
import { History, User, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

export const SalesHistory: React.FC = () => {
  const { data: salesResponse, isLoading } = useGetSalesHistoryQuery(undefined);
  const sales = salesResponse?.data || [];
  
  // Expanded sales track state
  const [expandedSaleId, setExpandedSaleId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedSaleId((prev) => (prev === id ? null : id));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {sales.length === 0 ? (
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center text-xs text-slate-400">
          <History size={32} className="mx-auto mb-2 opacity-50" />
          <p>No sale transactions logged yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sales.map((sale: any) => {
            const isExpanded = expandedSaleId === sale._id;
            const saleDate = new Date(sale.saleDate).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });
            const sellerInfo = sale.seller ? `${sale.seller.name} (${sale.seller.role})` : 'System';

            return (
              <div
                key={sale._id}
                className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden text-xs"
              >
                
                {/* Sale Row Header */}
                <div
                  onClick={() => toggleExpand(sale._id)}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-all"
                >
                  <div className="space-y-1.5 text-left">
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      Transaction #{sale._id.toUpperCase()}
                    </p>
                    <div className="flex flex-wrap gap-4 text-[10px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {saleDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <User size={12} />
                        Seller: {sellerInfo}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-auto">
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Grand Total</p>
                      <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                        ${sale.grandTotal.toFixed(2)}
                      </p>
                    </div>
                    <div className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                </div>

                {/* Expanded Products Details */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-slate-100 dark:border-slate-900 bg-slate-50/40 dark:bg-slate-900/10 animate-slide-in">
                    <h4 className="font-bold text-slate-500 py-3 text-[10px] uppercase tracking-wider text-left">
                      Sold Items Details
                    </h4>
                    <div className="space-y-3">
                      {sale.products.map((item: any, idx: number) => {
                        const productDetail = item.product || { name: 'Unknown Product', sku: 'N/A', image: '/image/default.jpg' };
                        const subtotal = item.unitPrice * item.quantity;
                        return (
                          <div
                            key={idx}
                            className="flex items-center gap-4 p-3 rounded-lg bg-white dark:bg-slate-950 border border-slate-200/50 dark:border-slate-900"
                          >
                            <img
                              src={getImageUrl(productDetail.image)}
                              alt={productDetail.name}
                              className="h-10 w-10 object-cover rounded-lg border border-slate-100 dark:border-slate-800"
                              onError={(e) => {
                                (e.target as any).src = 'https://i.ibb.co/51v1v9f/product-placeholder.png';
                              }}
                            />
                            <div className="flex-1 text-left min-w-0">
                              <p className="font-semibold truncate">{productDetail.name}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5 font-mono">SKU: {productDetail.sku}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">
                                {item.quantity} x ${item.unitPrice.toFixed(2)}
                              </p>
                              <p className="text-[10px] font-bold text-slate-500 mt-0.5">
                                Subtotal: ${subtotal.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
