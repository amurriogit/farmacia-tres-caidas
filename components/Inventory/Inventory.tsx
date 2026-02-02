import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, UserRole } from '../../types';
import { Button } from '../ui/Button';
import { Search, Plus, Edit, Download, Upload, AlertTriangle, X, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';

export const Inventory = () => {
  const { products, addProduct, updateProduct, deleteProduct, importProducts, currentUser } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const initialFormState: Omit<Product, 'id'> = {
    name: '', form: '', content: '', line: '', price: 0, cost: 0,
    quantity: 0, batch: '', expiryDate: '', location: '', barcode: '',
    minStock: 5, maxStock: 100
  };
  const [formData, setFormData] = useState(initialFormState);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.barcode.includes(searchTerm) ||
    p.line.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
    } else {
      setEditingProduct(null);
      setFormData(initialFormState);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateProduct({ ...formData, id: editingProduct.id });
    } else {
      addProduct(formData);
    }
    setIsModalOpen(false);
  };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  }

  const confirmDelete = () => {
    if (editingProduct) {
        deleteProduct(editingProduct.id);
        setIsDeleteModalOpen(false);
        setIsModalOpen(false);
    }
  }

  const handleExport = () => {
    const headers = ["ID", "Nombre", "Forma", "Contenido", "Linea", "Costo", "Precio", "Cantidad", "Lote", "Vence", "Ubicacion", "Codigo", "Min", "Max"];
    const csvContent = [
        headers.join(","),
        ...products.map(p => [
            p.id, p.name, p.form, p.content, p.line, p.cost, p.price, p.quantity, p.batch, p.expiryDate, p.location, p.barcode, p.minStock, p.maxStock
        ].map(f => `"${f}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "inventario_farmacia.csv");
    document.body.appendChild(link);
    link.click();
  };

  const handleImportClick = () => {
      fileInputRef.current?.click();
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if(!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
          const text = evt.target?.result as string;
          const lines = text.split('\n').slice(1);
          const newProducts: Product[] = [];
          lines.forEach(line => {
              if(!line.trim()) return;
              const cols = line.split(',').map(c => c.replace(/"/g, '').trim());
              if(cols.length >= 12) {
                   newProducts.push({
                       id: '',
                       name: cols[1], form: cols[2], content: cols[3], line: cols[4],
                       price: Number(cols[6]), cost: Number(cols[5]) || 0, quantity: Number(cols[7]),
                       batch: cols[8], expiryDate: cols[9], location: cols[10], barcode: cols[11],
                       minStock: Number(cols[12]), maxStock: Number(cols[13])
                   });
              }
          });
          importProducts(newProducts);
          alert(`Se importaron ${newProducts.length} productos.`);
      };
      reader.readAsText(file);
  }

  const inputClass = "w-full rounded-md border-slate-600 shadow-sm focus:border-teal-500 focus:ring-teal-500 border px-4 py-3 text-white bg-slate-800 focus:bg-slate-900 placeholder-gray-400 font-medium transition-all";

  // CONFIGURACIÓN DE CAMPOS DEL FORMULARIO
  // Nota: He cambiado el orden y la etiqueta para asegurar que se note el cambio visualmente
  const formFields = [
    { label: 'Nombre Producto', key: 'name', type: 'text', col: 'col-span-2', placeholder: 'Ej: Amoxicilina 500mg' },
    { label: 'Código Barras (Opcional)', key: 'barcode', type: 'text', col: 'col-span-1', required: false, placeholder: 'Escanear o vacío' },
    
    { label: 'Forma Farmacéutica', key: 'form', type: 'text', placeholder: 'Ej: Comprimido, Jarabe' },
    { label: 'Línea Comercial', key: 'line', type: 'text', placeholder: 'Ej: Vita, Inti' },
    { label: 'Contenido', key: 'content', type: 'text', placeholder: 'Ej: 500mg, 100ml' },

    // AQUÍ ESTÁ EL CAMBIO IMPORTANTE:
    { label: 'COSTO DE COMPRA (Bs)', key: 'cost', type: 'number', step: '0.01', placeholder: '0.00' },
    { label: 'PRECIO VENTA (Bs)', key: 'price', type: 'number', step: '0.01', placeholder: '0.00' },
    
    { label: editingProduct ? 'Cantidad en Stock' : 'Cantidad a Ingresar', key: 'quantity', type: 'number', disabled: !!editingProduct, placeholder: '0' },
    
    { label: 'Lote', key: 'batch', type: 'text', placeholder: 'Ej: L-202305' },
    { label: 'Fecha Vencimiento', key: 'expiryDate', type: 'date', placeholder: '' },
    { label: 'Ubicación', key: 'location', type: 'text', placeholder: 'Ej: Estante A, Fila 1' },
    
    { label: 'Stock Mínimo', key: 'minStock', type: 'number', placeholder: 'Ej: 10' },
    { label: 'Stock Máximo', key: 'maxStock', type: 'number', placeholder: 'Ej: 100' },
  ];

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <h1 className="text-3xl font-bold text-gray-900">Inventario General</h1>
        <div className="flex gap-3">
            <Button onClick={() => handleOpenModal()} className="py-2.5"><Plus className="w-5 h-5 mr-2" /> Nuevo Producto</Button>
            <Button variant="secondary" onClick={handleExport} className="py-2.5"><Download className="w-5 h-5 mr-2" /> Exportar</Button>
            <Button variant="secondary" onClick={handleImportClick} className="py-2.5"><Upload className="w-5 h-5 mr-2" /> Importar</Button>
            <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleFileChange} />
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-6 w-6 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-12 pr-4 py-4 border border-slate-600 rounded-lg leading-5 bg-slate-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-slate-900 text-base shadow-sm font-medium"
          placeholder="Buscar por nombre, código de barras o línea..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoFocus
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-x-auto border border-gray-200">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-100">
            <tr>
              {['Nombre', 'Presentación', 'Lote/Vence', 'Stock', 'Costo', 'Precio', 'Acciones'].map((h) => (
                <th key={h} className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50 transition-colors" onDoubleClick={() => handleOpenModal(product)}>
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="text-base font-bold text-gray-900">{product.name}</div>
                  <div className="text-sm text-gray-600 font-medium">{product.barcode || 'S/C'}</div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="text-sm text-gray-900 font-medium">{product.form}</div>
                  <div className="text-xs text-gray-600">{product.content} | {product.line}</div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="text-sm text-gray-900 font-medium">{product.batch}</div>
                  <div className={`text-xs ${new Date(product.expiryDate) < new Date() ? 'text-red-700 font-bold' : 'text-gray-600'}`}>
                    {product.expiryDate}
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className={`text-base font-bold ${product.quantity <= product.minStock ? 'text-red-700' : 'text-green-700'}`}>
                    {product.quantity}
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-600 font-medium">
                  Bs {product.cost ? product.cost.toFixed(2) : '0.00'}
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-base text-gray-900 font-bold">
                  Bs {product.price.toFixed(2)}
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => handleOpenModal(product)} className="text-teal-700 hover:text-teal-900 p-2"><Edit className="w-5 h-5" /></button>
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
                <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-600 font-medium text-lg">No se encontraron productos</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Main Edit/Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-300 relative">
            <div className="flex justify-between items-center p-6 border-b border-gray-300 bg-gray-50">
              <h3 className="text-2xl font-bold text-gray-900">{editingProduct ? 'Editar Producto' : 'Registrar Producto'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full"><X className="w-6 h-6 text-gray-500 hover:text-gray-800" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                {formFields.map((field: any) => (
                    <div key={field.key} className={field.col || ''}>
                        <label className="block text-sm font-bold text-gray-800 mb-2 tracking-wide uppercase">{field.label}</label>
                        <input
                            type={field.type}
                            step={field.step}
                            disabled={field.disabled}
                            required={field.required !== false}
                            className={inputClass}
                            placeholder={field.placeholder}
                            value={(formData as any)[field.key]}
                            onChange={e => setFormData({...formData, [field.key]: field.type === 'number' ? parseFloat(e.target.value) : e.target.value})}
                        />
                    </div>
                ))}
                
                <div className="col-span-1 md:col-span-3 flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
                    <div>
                        {editingProduct && currentUser?.role === UserRole.ADMIN && (
                            <Button type="button" variant="danger" onClick={handleDeleteClick} className="px-6 py-3 font-bold">
                                <Trash2 className="w-5 h-5 mr-2"/> Eliminar Producto
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-4">
                        <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} className="px-6 py-3">Cancelar</Button>
                        <Button type="submit" className="px-6 py-3 font-bold">Guardar Producto</Button>
                    </div>
                </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
         <div className="fixed inset-0 z-[60] bg-black bg-opacity-60 flex items-center justify-center p-4 backdrop-blur-sm">
             <div className="bg-white rounded-lg shadow-2xl max-w-sm w-full p-8 border border-gray-300">
                 <div className="flex flex-col items-center text-center">
                     <div className="bg-red-100 p-4 rounded-full mb-6">
                         <AlertTriangle className="h-10 w-10 text-red-600" />
                     </div>
                     <h3 className="text-xl font-bold text-gray-900 mb-3">¿Eliminar Producto?</h3>
                     <p className="text-gray-600 mb-8 leading-relaxed">
                         ¿Estás seguro de que deseas eliminar permanentemente <strong>{editingProduct?.name}</strong>?
                         <br/><span className="text-sm font-semibold text-red-500 mt-2 block">Esta acción no se puede deshacer.</span>
                     </p>
                     <div className="flex gap-4 w-full">
                         <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 font-medium">
                             Cancelar
                         </Button>
                         <Button variant="danger" onClick={confirmDelete} className="flex-1 py-3 font-bold shadow-lg">
                             Sí, Eliminar
                         </Button>
                     </div>
                 </div>
             </div>
         </div>
      )}
    </div>
  );
};