import React, { useState } from 'react';
import { useGetProductsQuery } from '../redux/api/productApi';
import { useCreateSaleMutation } from '../redux/api/salesApi';
import { getImageUrl } from '../helpers/image';
import { toast } from 'sonner';
import { getErrorMessage } from '../helpers/errorHelper';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Loader2,
  CheckCircle,
  AlertTriangle,
  ShoppingCart,
} from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  sku: string;
  unitPrice: number;
  availableStock: number;
  quantity: number;
  image: string;
}

export const CreateSale: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: productsResponse, isLoading: productsLoading } = useGetProductsQuery({
    searchTerm,
    limit: 100, // Load enough for selector
  });

  const products = productsResponse?.data || [];

  const [createSale, { isLoading: isCreating }] = useCreateSaleMutation();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const addToCart = (product: any) => {
    setError(null);
    setSuccess(null);

    if (product.stockQuantity <= 0) {
      setError(`"${product.name}" is out of stock!`);
      return;
    }

    const existingIndex = cart.findIndex((item) => item.id === product._id);
    if (existingIndex > -1) {
      const currentQty = cart[existingIndex].quantity;
      if (currentQty >= product.stockQuantity) {
        setError(`Cannot add more. Only ${product.stockQuantity} units available.`);
        return;
      }
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      setCart(updated);
    } else {
      setCart([
        ...cart,
        {
          id: product._id,
          name: product.name,
          sku: product.sku,
          unitPrice: product.sellingPrice,
          availableStock: product.stockQuantity,
          quantity: 1,
          image: product.image,
        },
      ]);
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    setError(null);
    const updated = cart
      .map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          if (newQty > item.availableStock) {
            setError(`Cannot exceed available stock of ${item.availableStock} units.`);
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      })
      .filter((item) => item.quantity > 0);

    setCart(updated);
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const grandTotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const handleCheckout = async () => {
    setError(null);
    setSuccess(null);

    if (cart.length === 0) {
      setError('Please add products to the cart first.');
      toast.error('Please add products to the cart first.');
      return;
    }

    const payload = {
      products: cart.map((item) => ({
        product: item.id,
        quantity: item.quantity,
      })),
    };

    try {
      await createSale(payload).unwrap();
      const msg = 'Sale transaction completed successfully!';
      setSuccess(msg);
      toast.success(msg);
      setCart([]);
    } catch (err: any) {
      const errMsg = getErrorMessage(err);
      setError(errMsg);
      toast.error(errMsg);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* ─── LEFT COLUMN: PRODUCT PICKER ───────────────────────────── */}
      <div className="lg:col-span-7 space-y-6">
        <div className="p-6 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
          <h3 className="font-bold mb-4 flex items-center gap-2 text-sm">
            Select Products
          </h3>

          {/* Search */}
          <div className="relative mb-6">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search products by Name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-purple-500 transition-all"
            />
          </div>

          {/* Product Items List */}
          {productsLoading ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="animate-spin text-purple-500" size={24} />
            </div>
          ) : products.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No products found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1">
              {products.map((product: any) => {
                const isOutOfStock = product.stockQuantity === 0;
                return (
                  <div
                    key={product._id}
                    onClick={() => !isOutOfStock && addToCart(product)}
                    className={`p-4 border rounded-xl flex items-center gap-3 transition-all cursor-pointer ${
                      isOutOfStock
                        ? 'border-slate-200 bg-slate-50 opacity-55 cursor-not-allowed dark:border-slate-850 dark:bg-slate-900/20'
                        : 'border-slate-200 bg-white hover:border-purple-500/50 hover:shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:hover:border-purple-500/50'
                    }`}
                  >
                    <img
                      src={getImageUrl(product.image)}
                      alt={product.name}
                      className="h-12 w-12 object-cover rounded-lg border border-slate-100 dark:border-slate-800"
                      onError={(e) => {
                        (e.target as any).src = 'https://i.ibb.co/51v1v9f/product-placeholder.png';
                      }}
                    />
                    <div className="flex-1 min-w-0 text-left">
                      <h4 className="text-xs font-semibold truncate leading-snug">{product.name}</h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{product.sku}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs font-extrabold text-purple-600 dark:text-purple-400">
                          ${product.sellingPrice.toFixed(2)}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                            product.stockQuantity < 5
                              ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
                              : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                          }`}
                        >
                          {product.stockQuantity} Left
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ─── RIGHT COLUMN: CART & CHECKOUT ─────────────────────────── */}
      <div className="lg:col-span-5 space-y-6">
        
        {error && (
          <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs flex items-start gap-2 animate-scale-up">
            <AlertTriangle className="shrink-0 mt-0.5" size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs flex items-start gap-2 animate-scale-up">
            <CheckCircle className="shrink-0 mt-0.5" size={16} />
            <span>{success}</span>
          </div>
        )}

        <div className="p-6 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-900">
            <h3 className="font-bold flex items-center gap-2 text-sm">
              <ShoppingCart size={16} className="text-purple-600" />
              Checkout Cart
            </h3>
            <span className="text-xs text-slate-500">{cart.length} items</span>
          </div>

          {/* Cart Items list */}
          <div className="flex-1 mt-4 overflow-y-auto max-h-[350px] space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 py-16 text-xs">
                <ShoppingCart size={32} className="mb-2 opacity-50" />
                <p>Your cart is empty. Click products on the left to add.</p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 text-xs border border-slate-100/50 dark:border-slate-900/50"
                >
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.name}
                    className="h-10 w-10 object-cover rounded-lg border border-slate-100 dark:border-slate-800"
                    onError={(e) => {
                      (e.target as any).src = 'https://i.ibb.co/51v1v9f/product-placeholder.png';
                    }}
                  />
                  <div className="flex-1 min-w-0 text-left">
                    <h4 className="font-semibold truncate leading-tight">{item.name}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">${item.unitPrice.toFixed(2)} each</p>
                  </div>
                  
                  {/* Quantity controls */}
                  <div className="flex items-center gap-1.5 border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-950 p-0.5">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-900 rounded cursor-pointer"
                    >
                      <Minus size={10} />
                    </button>
                    <span className="w-5 text-center font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-900 rounded cursor-pointer"
                    >
                      <Plus size={10} />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Pricing Calculations and Checkout */}
          {cart.length > 0 && (
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-900 text-xs">
              <div className="flex items-center justify-between font-medium text-slate-500 mb-2">
                <span>Subtotal</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between font-bold text-sm text-slate-850 dark:text-slate-100 mb-6">
                <span>Grand Total</span>
                <span className="text-purple-600 dark:text-purple-400">${grandTotal.toFixed(2)}</span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isCreating}
                className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-all shadow-md shadow-purple-500/10"
              >
                {isCreating ? <Loader2 size={14} className="animate-spin" /> : 'Complete Sale'}
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
