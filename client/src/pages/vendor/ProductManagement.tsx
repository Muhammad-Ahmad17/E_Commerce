import React, { useState, useEffect } from 'react';
import { getVendorProducts, addVendorProduct, updateVendorProduct, deleteVendorProduct } from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from '@/components/ui/use-toast';
import { Edit, Trash2, Plus } from 'lucide-react';

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  subCategoryName: string;
  stock: number;
  imageUrl?: string;
};

type ProductFormData = Omit<Product, 'id'>;

const initialFormData: ProductFormData = {
  name: '',
  description: '',
  price: 0,
  category: '',
  subCategoryName: '',
  stock: 0,
  imageUrl: '',
};

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ProductFormData>({
    defaultValues: initialFormData,
  });
  
  useEffect(() => {
    fetchProducts();
  }, []);
  
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await getVendorProducts();
      const mappedProducts = (response.data || []).map((item: any, idx: number) => ({
        id: item.productId?.toString() || idx.toString(),
        name: item.productName,
        description: item.description,
        price: item.price,
        category: item.categoryName,
        subCategoryName: item.subCategoryName || '',
        stock: item.stockQuantity,
        imageUrl: item.imageUrl,
      }));
      setProducts(mappedProducts);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };
  
  const openAddDialog = () => {
    reset(initialFormData);
    setEditingProduct(null);
    setIsDialogOpen(true);
  };
  
  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setValue('name', product.name);
    setValue('description', product.description);
    setValue('price', product.price);
    setValue('category', product.category);
    setValue('subCategoryName', product.subCategoryName);
    setValue('stock', product.stock);
    setValue('imageUrl', product.imageUrl || '');
    setIsDialogOpen(true);
  };
  
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }
    
    try {
      await deleteVendorProduct(id);
      setProducts(products.filter(product => product.id !== id));
      toast({
        title: 'Product deleted',
        description: 'The product has been removed successfully.',
      });
    } catch (err: any) {
      toast({
        title: 'Delete failed',
        description: err.response?.data?.message || 'Failed to delete product',
        variant: 'destructive',
      });
    }
  };
  
  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      const backendPayload = {
        productName: data.name,
        categoryName: data.category,
        subCategoryName: data.subCategoryName,
        description: data.description,
        price: data.price,
        stockQuantity: data.stock,
        imageUrl: data.imageUrl,
      };
      if (editingProduct) {
        await updateVendorProduct(editingProduct.id, backendPayload);
        setProducts(products.map(p =>
          p.id === editingProduct.id ? { ...p, ...data } : p
        ));
        toast({
          title: 'Product updated',
          description: 'Your product has been updated successfully.',
        });
      } else {
        const response = await addVendorProduct(backendPayload);
        setProducts([...products, { id: response.data.productId, ...data }]);
        toast({
          title: 'Product added',
          description: 'Your product has been added successfully.',
        });
      }
      setIsDialogOpen(false);
    } catch (err: any) {
      toast({
        title: editingProduct ? 'Update failed' : 'Add failed',
        description: err.response?.data?.message || 'Failed to save product',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  console.log("isDialogOpen:", isDialogOpen);
  
  if (loading && !products.length) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Product Management</h1>
        <Button onClick={openAddDialog}>
          <Plus size={18} className="mr-2" /> Add Product
        </Button>
      </div>
      
      {error && <ErrorMessage message={error} />}
      
      {/* Product List */}
      {products.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Price</th>
                  <th className="px-6 py-3">Stock</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img
                            className="h-10 w-10 rounded-sm object-cover"
                            src={product.imageUrl || "https://placehold.co/100x100?text=Product"}
                            alt={product.name}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {product.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      {product.stock}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(product)}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <h3 className="text-xl font-medium text-gray-500">No products found</h3>
          <p className="mt-2 text-gray-500">Get started by adding your first product</p>
          <Button className="mt-4" onClick={openAddDialog}>
            <Plus size={18} className="mr-2" /> Add Product
          </Button>
        </div>
      )}
      
      {/* Product Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <h2 className="text-xl font-semibold mb-4">
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Product Name
              </label>
              <input
                id="name"
                type="text"
                className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand focus:border-brand"
                {...register('name', { required: 'Product name is required' })}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand focus:border-brand"
                {...register('description', { required: 'Description is required' })}
              ></textarea>
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Price ($)
                </label>
                <input
                  id="price"
                  type="number"
                  step="0.01"
                  className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand focus:border-brand"
                  {...register('price', {
                    required: 'Price is required',
                    min: { value: 0.01, message: 'Price must be greater than 0' }
                  })}
                />
                {errors.price && (
                  <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                  Stock
                </label>
                <input
                  id="stock"
                  type="number"
                  className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand focus:border-brand"
                  {...register('stock', {
                    required: 'Stock is required',
                    min: { value: 0, message: 'Stock cannot be negative' }
                  })}
                />
                {errors.stock && (
                  <p className="text-red-500 text-xs mt-1">{errors.stock.message}</p>
                )}
              </div>
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category"
                className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand focus:border-brand"
                {...register('category', { required: 'Category is required' })}
              >
                <option value="">Select category</option>
                <option value="male">Men's</option>
                <option value="female">Women's</option>
                <option value="children">Kids'</option>
              </select>
              {errors.category && (
                <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="subCategoryName" className="block text-sm font-medium text-gray-700 mb-1">
                Subcategory
              </label>
              <select
                id="subCategoryName"
                className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand focus:border-brand"
                {...register('subCategoryName', { required: 'Subcategory is required' })}
              >
                <option value="">Select subcategory</option>
                <option value="clothes">Clothes</option>
                <option value="shoes">Shoes</option>
                {/* Add all valid subcategories here */}
              </select>
              {errors.subCategoryName && (
                <p className="text-red-500 text-xs mt-1">{errors.subCategoryName.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                Image URL (optional)
              </label>
              <input
                id="imageUrl"
                type="text"
                className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-brand focus:border-brand"
                placeholder="https://example.com/image.jpg"
                {...register('imageUrl')}
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to use a placeholder image
              </p>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <LoadingSpinner size="small" /> :
                  editingProduct ? 'Update Product' : 'Add Product'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductManagement;
