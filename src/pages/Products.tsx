import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from '../redux/api/productApi';
import { useAppSelector } from '../redux/hooks';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Upload,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export const Products: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const isAuthorizedToManage = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'MANAGER';

  // Search Params parsing
  const [searchParams, setSearchParams] = useSearchParams();
  const editQueryId = searchParams.get('edit');

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Queries
  const { data: productsResponse, isLoading } = useGetProductsQuery({
    searchTerm,
    page,
    limit,
  });

  const products = productsResponse?.data || [];
  const pagination = productsResponse?.pagination || { page: 1, limit: 10, totalPage: 1, total: 0 };

  // Mutations
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Selected item states
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [formError, setFormError] = useState<string | null>(null);

  // Open Edit modal if edit param is present in URL
  useEffect(() => {
    if (editQueryId && products.length > 0) {
      const found = products.find((p: any) => p._id === editQueryId);
      if (found) {
        handleOpenEdit(found);
      }
    }
  }, [editQueryId, products]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        setFormError('Only .jpeg, .png, .jpg files are supported.');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setFormError(null);
    }
  };

  const resetForm = () => {
    setName('');
    setSku('');
    setCategory('');
    setPurchasePrice('');
    setSellingPrice('');
    setStockQuantity('');
    setImageFile(null);
    setImagePreview(null);
    setFormError(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (product: any) => {
    resetForm();
    setSelectedProductId(product._id);
    setName(product.name);
    setSku(product.sku);
    setCategory(product.category);
    setPurchasePrice(product.purchasePrice.toString());
    setSellingPrice(product.sellingPrice.toString());
    setStockQuantity(product.stockQuantity.toString());
    setImagePreview(`http://localhost:5000${product.image}`);
    setIsEditOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditOpen(false);
    setSelectedProductId(null);
    searchParams.delete('edit');
    setSearchParams(searchParams);
  };

  const handleOpenDelete = (id: string) => {
    setSelectedProductId(id);
    setIsDeleteOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name || !sku || !category || !purchasePrice || !sellingPrice || !stockQuantity) {
      setFormError('All text fields are required.');
      return;
    }

    if (!imageFile) {
      setFormError('Product image is required.');
      return;
    }

    const formData = new FormData();
    formData.append(
      'data',
      JSON.stringify({
        name,
        sku,
        category,
        purchasePrice: Number(purchasePrice),
        sellingPrice: Number(sellingPrice),
        stockQuantity: Number(stockQuantity),
      })
    );
    formData.append('image', imageFile);

    try {
      await createProduct(formData).unwrap();
      setIsCreateOpen(false);
      resetForm();
    } catch (err: any) {
      setFormError(err?.data?.message || 'Failed to create product.');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedProductId) return;

    if (!name || !sku || !category || !purchasePrice || !sellingPrice || !stockQuantity) {
      setFormError('All text fields are required.');
      return;
    }

    const formData = new FormData();
    formData.append(
      'data',
      JSON.stringify({
        name,
        sku,
        category,
        purchasePrice: Number(purchasePrice),
        sellingPrice: Number(sellingPrice),
        stockQuantity: Number(stockQuantity),
      })
    );
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      await updateProduct({ id: selectedProductId, formData }).unwrap();
      handleCloseEdit();
    } catch (err: any) {
      setFormError(err?.data?.message || 'Failed to update product.');
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedProductId) return;
    try {
      await deleteProduct(selectedProductId).unwrap();
      setIsDeleteOpen(false);
      setSelectedProductId(null);
    } catch (err: any) {
      console.error('Delete error', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search products by Name, SKU, Category..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-2 pl-9 pr-4 text-xs focus:border-purple-500 focus:outline-none transition-all"
          />
        </div>

        {/* Add Product Button */}
        {isAuthorizedToManage && (
          <button
            onClick={handleOpenCreate}
            className="bg-purple-600 hover:bg-purple-500 text-white rounded-lg px-4 py-2 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-purple-500/10"
          >
            <Plus size={16} /> Add Product
          </button>
        )}
      </div>

      {/* Products Table Card */}
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-20 flex justify-center items-center">
              <Loader2 className="animate-spin text-purple-500" size={32} />
            </div>
          ) : products.length === 0 ? (
            <div className="py-20 flex flex-col justify-center items-center text-slate-400">
              <AlertCircle size={32} className="mb-2" />
              <p className="text-sm font-medium">No products found matching filters.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 border-b border-slate-200 dark:border-slate-850">
                  <th className="py-3 px-5 font-semibold">Image</th>
                  <th className="py-3 px-5 font-semibold">Product Name</th>
                  <th className="py-3 px-5 font-semibold">SKU</th>
                  <th className="py-3 px-5 font-semibold">Category</th>
                  <th className="py-3 px-5 font-semibold text-right">Purchase Price</th>
                  <th className="py-3 px-5 font-semibold text-right">Selling Price</th>
                  <th className="py-3 px-5 font-semibold text-center">Stock</th>
                  {isAuthorizedToManage && <th className="py-3 px-5 font-semibold text-right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {products.map((product: any) => (
                  <tr
                    key={product._id}
                    className="border-b border-slate-100 dark:border-slate-900/50 hover:bg-slate-50/30 dark:hover:bg-slate-900/10"
                  >
                    <td className="py-3 px-5">
                      <img
                        src={`http://localhost:5000${product.image}`}
                        alt={product.name}
                        className="h-10 w-10 object-cover rounded-lg border border-slate-100 dark:border-slate-800"
                        onError={(e) => {
                          (e.target as any).src = 'https://i.ibb.co/51v1v9f/product-placeholder.png';
                        }}
                      />
                    </td>
                    <td className="py-3 px-5 font-semibold text-slate-900 dark:text-slate-100">{product.name}</td>
                    <td className="py-3 px-5 font-mono text-slate-500">{product.sku}</td>
                    <td className="py-3 px-5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400 border border-slate-200/40 dark:border-slate-800/40">
                        {product.category}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-right font-medium">${product.purchasePrice.toFixed(2)}</td>
                    <td className="py-3 px-5 text-right font-bold text-purple-600 dark:text-purple-400">
                      ${product.sellingPrice.toFixed(2)}
                    </td>
                    <td className="py-3 px-5 text-center">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded font-bold text-[10px] ${
                          product.stockQuantity === 0
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            : product.stockQuantity < 5
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {product.stockQuantity}
                      </span>
                    </td>
                    {isAuthorizedToManage && (
                      <td className="py-3 px-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(product)}
                            className="p-1 text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 rounded hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer"
                          >
                            <Edit2 size={14} />
                          </button>
                          {user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' ? (
                            <button
                              onClick={() => handleOpenDelete(product._id)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          ) : null}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer */}
        {pagination.totalPage > 1 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              Showing page {pagination.page} of {pagination.totalPage} ({pagination.total} total items)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={page === 1}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                className="p-1.5 rounded border border-slate-200 dark:border-slate-800 disabled:opacity-40 cursor-pointer text-slate-600 dark:text-slate-400"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                disabled={page === pagination.totalPage}
                onClick={() => setPage((prev) => Math.min(prev + 1, pagination.totalPage))}
                className="p-1.5 rounded border border-slate-200 dark:border-slate-800 disabled:opacity-40 cursor-pointer text-slate-600 dark:text-slate-400"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── ADD PRODUCT MODAL ────────────────────────────────────── */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsCreateOpen(false)} />
          <div className="relative bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl z-10 animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-900">
              <h3 className="text-sm font-bold">Add New Product</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={16} />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 mb-1.5 font-medium">Product Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="E.g., Wireless Mouse"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1.5 font-medium">SKU (Unique)</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="MS-10294"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-1.5 font-medium">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Electronics"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-500 mb-1.5 font-medium">Purchase Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    placeholder="12.50"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1.5 font-medium">Selling Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    placeholder="19.99"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1.5 font-medium">Stock Qty</label>
                  <input
                    type="number"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    placeholder="50"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-1.5 font-medium">Product Image (Required)</label>
                <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-lg p-4 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-900/80 transition-all relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    required
                  />
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="h-20 w-20 object-cover rounded-lg border border-slate-200" />
                  ) : (
                    <>
                      <Upload className="text-slate-400 mb-2" size={24} />
                      <p className="text-[10px] text-slate-400">Click or drag image file here (JPEG, PNG, JPG)</p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-900">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-55 rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold flex items-center justify-center gap-1 cursor-pointer"
                >
                  {isCreating ? <Loader2 size={14} className="animate-spin" /> : 'Save Product'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ─── EDIT PRODUCT MODAL ────────────────────────────────────── */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={handleCloseEdit} />
          <div className="relative bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl z-10 animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-900">
              <h3 className="text-sm font-bold">Edit Product</h3>
              <button onClick={handleCloseEdit} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={16} />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 mb-1.5 font-medium">Product Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1.5 font-medium">SKU</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-1.5 font-medium">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-500 mb-1.5 font-medium">Purchase Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1.5 font-medium">Selling Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1.5 font-medium">Stock Qty</label>
                  <input
                    type="number"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-1.5 font-medium">Product Image (Optional)</label>
                <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-lg p-4 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-900/80 transition-all relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="h-20 w-20 object-cover rounded-lg border border-slate-200" />
                  ) : (
                    <>
                      <Upload className="text-slate-400 mb-2" size={24} />
                      <p className="text-[10px] text-slate-400">Click or drag image file here (JPEG, PNG, JPG)</p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-900">
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-55 rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold flex items-center justify-center gap-1 cursor-pointer"
                >
                  {isUpdating ? <Loader2 size={14} className="animate-spin" /> : 'Save Changes'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ─── DELETE PRODUCT CONFIRMATION MODAL ────────────────────── */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsDeleteOpen(false)} />
          <div className="relative bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl z-10 animate-scale-up text-xs">
            <h3 className="text-sm font-bold text-rose-600">Delete Product</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Are you absolutely sure you want to delete this product? This action is irreversible.
            </p>

            <div className="flex justify-end gap-2 pt-4 mt-6 border-t border-slate-100 dark:border-slate-900">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteSubmit}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-semibold cursor-pointer"
              >
                {isDeleting ? <Loader2 size={14} className="animate-spin" /> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
