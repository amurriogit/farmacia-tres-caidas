import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, CartItem, Client, Sale, PharmacyConfig } from '../../types';
import { Button } from '../ui/Button';
import { Search, ShoppingCart, Trash2, Printer, CheckCircle, X, Eye, FileText, Activity, Loader } from 'lucide-react';

export const Sales = () => {
  const { products, processSale, config } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [client, setClient] = useState<Client>({ name: '', lastName: '', documentId: '0', nit: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Success Modal State
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const beep = () => { /* Sound logic */ };

  const addToCart = (product: Product) => {
    if (product.quantity <= 0) {
        alert("Producto sin stock");
        return;
    }
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        if (existing.saleQuantity >= product.quantity) {
             alert("Stock insuficiente para agregar más");
             return prev;
        }
        return prev.map(i => i.id === product.id ? { ...i, saleQuantity: i.saleQuantity + 1, subtotal: (i.saleQuantity + 1) * i.price } : i);
      }
      return [...prev, { ...product, saleQuantity: 1, subtotal: product.price }];
    });
    setSearchTerm(''); 
    beep();
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const updateQuantity = (id: string, qty: number) => {
      if(qty < 1) return;
      setCart(prev => prev.map(i => {
          if (i.id === id) {
              if (qty > i.quantity) {
                  alert("Stock excedido");
                  return i;
              }
              return { ...i, saleQuantity: qty, subtotal: qty * i.price };
          }
          return i;
      }));
  };

  const total = cart.reduce((acc, item) => acc + item.subtotal, 0);

  useEffect(() => {
     // Optional: Only barcode match if not empty
     if(!searchTerm) return;
     const exactMatch = products.find(p => p.barcode === searchTerm);
     if (exactMatch) {
         addToCart(exactMatch);
     }
  }, [searchTerm]);

  const handleCheckout = async () => {
      setIsProcessing(true);
      const sale = await processSale({
          items: cart,
          total: total,
          client: client
      });
      setIsProcessing(false);
      
      if (sale) {
        setLastSale(sale);
        setCart([]);
        setClient({ name: '', lastName: '', documentId: '0', nit: '' });
        setShowCheckout(false);
        setShowSuccess(true);
      } else {
          alert("Error al procesar la venta. Verifique la conexión.");
      }
  };

  const handlePrint = (sale: Sale, config: PharmacyConfig) => {
      const printWindow = window.open('', '', 'width=400,height=600');
      if (!printWindow) return;

      const html = `
        <html>
          <head>
            <title>Recibo #${sale.id.substring(0,8)}</title>
            <style>
              body { font-family: 'Courier New', Courier, monospace; padding: 20px; text-align: center; color: #000; }
              .header { margin-bottom: 10px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
              .title { font-size: 16px; font-weight: bold; text-transform: uppercase; margin: 0; }
              .info { font-size: 12px; margin: 2px 0; }
              .client { text-align: left; margin: 10px 0; font-size: 12px; border-bottom: 1px dashed #000; padding-bottom: 5px; }
              table { width: 100%; font-size: 12px; border-collapse: collapse; margin-top: 10px; }
              th { text-align: left; border-bottom: 1px solid #000; }
              td { padding: 4px 0; }
              .total { font-size: 18px; font-weight: bold; margin-top: 15px; border-top: 1px solid #000; padding-top: 10px; text-align: right; }
              .footer { font-size: 10px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 class="title">${config.name}</h1>
              <p class="info">${config.address}</p>
              <p class="info">NIT: ${config.nit} | Tel: ${config.phone}</p>
            </div>
            <div class="client">
              <p>FECHA: ${new Date(sale.timestamp).toLocaleString()}</p>
              <p>RECIBO: #${sale.id.substring(0,8).toUpperCase()}</p>
              <p>CLIENTE: ${sale.client.name} ${sale.client.lastName}</p>
              <p>NIT/CI: ${sale.client.nit || sale.client.documentId}</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th style="width: 15%">CANT</th>
                  <th style="width: 60%">DETALLE</th>
                  <th style="width: 25%; text-align: right;">SUBTOTAL</th>
                </tr>
              </thead>
              <tbody>
                ${sale.items.map(item => `
                  <tr>
                    <td style="vertical-align: top;">${item.saleQuantity}</td>
                    <td style="vertical-align: top;">${item.name} <br/><small>${item.form}</small></td>
                    <td style="text-align: right; vertical-align: top;">${item.subtotal.toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="total">
              TOTAL: Bs ${sale.total.toFixed(2)}
            </div>
            <div class="footer">
              <p>GRACIAS POR SU PREFERENCIA</p>
              <p>Atendido por: ${sale.userName}</p>
            </div>
            <script>
                window.onload = function() { window.print(); window.close(); }
            </script>
          </body>
        </html>
      `;
      printWindow.document.write(html);
      printWindow.document.close();
  };

  const inputClass = "w-full border border-slate-600 px-4 py-3 rounded text-white bg-slate-800 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-medium placeholder-gray-400 transition-all";

  // Receipt Preview Component (Same as before, hidden for brevity in this response)
  const ReceiptPreview = ({ sale }: { sale: Sale }) => (
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-200 font-sans text-gray-700 relative w-full mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-700 to-teal-800 h-20 relative flex items-center justify-center overflow-hidden shrink-0">
             <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
             <div className="bg-white p-2 rounded-xl shadow-xl z-10 mt-6 ring-4 ring-teal-800/20">
                <Activity className="h-6 w-6 text-teal-700" />
             </div>
          </div>

          <div className="pt-10 pb-4 px-4 text-center bg-white relative z-0">
             <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight leading-none">{config.name}</h2>
             <p className="text-xs text-gray-500 font-medium mt-2 max-w-[200px] mx-auto leading-relaxed">{config.address}</p>
             <div className="flex flex-wrap justify-center gap-2 text-[10px] text-gray-400 mt-2 font-semibold uppercase tracking-wider">
                <span className="bg-gray-100 px-2 py-1 rounded">NIT: {config.nit}</span>
                <span className="bg-gray-100 px-2 py-1 rounded">Tel: {config.phone}</span>
             </div>
          </div>

          <div className="px-4 py-3 bg-gray-50 border-y border-dashed border-gray-200 flex justify-between items-center text-xs">
              <div className="text-left">
                  <p className="text-gray-400 font-bold uppercase tracking-wider text-[10px] mb-1">Cliente</p>
                  <p className="font-bold text-gray-900 text-sm truncate max-w-[120px]">{sale.client.name} {sale.client.lastName}</p>
                  <p className="text-gray-500 font-medium">{sale.client.nit || sale.client.documentId}</p>
              </div>
              <div className="text-right">
                   <p className="text-gray-400 font-bold uppercase tracking-wider text-[10px] mb-1">Recibo #</p>
                   <p className="font-bold text-gray-900 text-sm font-mono">{sale.id.substring(0,8).toUpperCase()}</p>
                   <p className="text-gray-500 font-medium">{new Date(sale.timestamp).toLocaleDateString()}</p>
              </div>
          </div>

          <div className="p-4 bg-white">
              <table className="w-full text-sm">
                  <thead>
                      <tr className="text-[10px] text-gray-400 uppercase tracking-wider border-b border-gray-100">
                          <th className="pb-2 text-left font-bold pl-1">Cnt</th>
                          <th className="pb-2 text-left font-bold">Detalle</th>
                          <th className="pb-2 text-right font-bold pr-1">Total</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                      {sale.items.map(i => (
                          <tr key={i.id} className="group hover:bg-gray-50 transition-colors">
                              <td className="py-2 font-bold text-teal-600 align-top pl-1">{i.saleQuantity}</td>
                              <td className="py-2 align-top pr-1">
                                  <div className="font-bold text-gray-900 text-xs leading-snug">{i.name}</div>
                                  <div className="text-[10px] text-gray-400">{i.form}</div>
                              </td>
                              <td className="py-2 text-right font-medium text-gray-900 align-top pr-1">{i.subtotal.toFixed(2)}</td>
                          </tr>
                      ))}
                  </tbody>
              </table>

              <div className="mt-4 space-y-2 pt-4 border-t border-gray-100">
                   <div className="bg-teal-900 text-white px-4 py-3 rounded-xl shadow-lg w-full flex justify-between items-center mt-2 relative overflow-hidden">
                       <span className="font-bold uppercase text-[10px] tracking-wider opacity-90">Total</span>
                       <span className="text-xl font-black tracking-tight relative z-10">Bs {sale.total.toFixed(2)}</span>
                   </div>
              </div>
          </div>

          <div className="px-4 pb-6 pt-2 text-center bg-white">
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">¡Gracias por su compra!</p>
               <p className="text-[9px] text-gray-300 mt-1 uppercase">Cajero: {sale.userName}</p>
          </div>
      </div>
  );

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col md:flex-row gap-6 p-6">
      {/* Left: Product Selection */}
      <div className="flex-1 flex flex-col bg-white rounded-lg shadow-md overflow-hidden border border-gray-300">
        <div className="p-6 border-b border-gray-300 bg-gray-50">
           <div className="relative">
            <Search className="absolute left-4 top-4 h-6 w-6 text-gray-400" />
            <input
                type="text"
                className="w-full pl-12 pr-4 py-4 border border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-slate-900 bg-slate-800 text-white placeholder-gray-400 shadow-sm font-medium text-base"
                placeholder="Escanear código o ingresar nombre del producto..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                autoFocus
            />
           </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 content-start bg-gray-100">
            {products.filter(p => 
                (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                p.barcode.includes(searchTerm)) && p.quantity > 0
            ).map(product => (
                <button 
                    key={product.id} 
                    onClick={() => addToCart(product)}
                    className="flex flex-col items-start p-4 border border-gray-300 rounded-lg hover:border-teal-600 hover:ring-2 hover:ring-teal-600 hover:shadow-lg transition-all text-left bg-white"
                >
                    <span className="font-bold text-gray-900 text-sm line-clamp-2 h-10 mb-2">{product.name}</span>
                    <span className="text-xs text-gray-600 font-medium mb-3 block">{product.form} - {product.line}</span>
                    <div className="mt-auto w-full flex justify-between items-end">
                        <span className="text-teal-700 font-bold text-lg">Bs {product.price.toFixed(2)}</span>
                        <span className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-800 font-bold border border-gray-300">Stock: {product.quantity}</span>
                    </div>
                </button>
            ))}
        </div>
      </div>

      {/* Right: Cart */}
      <div className="w-full md:w-96 bg-white rounded-lg shadow-md flex flex-col border border-gray-300 h-full">
         <div className="p-5 bg-teal-800 text-white rounded-t-lg flex justify-between items-center shrink-0">
             <h2 className="font-bold text-lg flex items-center"><ShoppingCart className="mr-2 h-6 w-6"/> Carrito</h2>
             <span className="bg-teal-950 px-3 py-1 rounded text-sm font-bold border border-teal-600 shadow-sm">{cart.length} items</span>
         </div>
         
         <div className="flex-1 overflow-y-auto p-5 space-y-4">
             {cart.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-gray-400">
                     <ShoppingCart className="h-16 w-16 mb-4 opacity-30 text-gray-500"/>
                     <p className="text-gray-500 font-bold text-lg">El carrito está vacío</p>
                 </div>
             ) : (
                 cart.map(item => (
                     <div key={item.id} className="flex justify-between items-center border-b border-gray-200 pb-4">
                         <div className="flex-1 pr-2">
                             <div className="font-bold text-sm text-gray-900 mb-1">{item.name}</div>
                             <div className="text-xs text-gray-600 font-medium">Unit: Bs {item.price}</div>
                         </div>
                         <div className="flex items-center gap-3">
                             <input 
                                type="number" 
                                className="w-16 border border-slate-600 bg-slate-800 text-white rounded text-center text-sm p-2 font-bold focus:outline-none focus:ring-1 focus:ring-teal-500"
                                value={item.saleQuantity}
                                onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                                min="1"
                             />
                             <div className="font-bold w-20 text-right text-sm text-gray-900">{(item.subtotal).toFixed(2)}</div>
                             <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-colors">
                                 <Trash2 className="h-5 w-5" />
                             </button>
                         </div>
                     </div>
                 ))
             )}
         </div>

         <div className="p-6 bg-gray-50 border-t border-gray-300 space-y-4 shrink-0">
             <div className="flex justify-between text-xl font-bold text-gray-900">
                 <span>Total:</span>
                 <span className="text-teal-800">Bs {total.toFixed(2)}</span>
             </div>
             <Button 
                className="w-full py-4 text-lg shadow-md font-bold" 
                disabled={cart.length === 0 || isProcessing}
                onClick={() => setShowCheckout(true)}
             >
                 {isProcessing ? 'Procesando...' : 'Cobrar'}
             </Button>
         </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] border border-gray-300">
                  <div className="flex justify-between items-center p-6 border-b border-gray-200 shrink-0">
                      <h3 className="text-2xl font-bold text-gray-900">Finalizar Venta</h3>
                      <button onClick={() => setShowCheckout(false)} className="p-2 hover:bg-gray-100 rounded-full"><X className="h-6 w-6 text-gray-600 hover:text-gray-900"/></button>
                  </div>
                  
                  <div className="p-8 overflow-y-auto">
                      <div className="space-y-6 mb-8">
                          <div>
                              <label className="block text-sm font-bold text-gray-800 mb-2">NIT / CI (Opcional)</label>
                              <input 
                                 type="text" 
                                 className={inputClass}
                                 value={client.nit || ''}
                                 onChange={e => setClient({...client, nit: e.target.value})}
                                 placeholder="Ej: 4567890 o 0 si no aplica"
                              />
                          </div>
                          <div>
                              <label className="block text-sm font-bold text-gray-800 mb-2">Razón Social / Apellidos</label>
                              <input 
                                 type="text" 
                                 className={inputClass}
                                 value={client.lastName}
                                 onChange={e => setClient({...client, lastName: e.target.value})}
                                 placeholder="Ingrese nombre del cliente"
                              />
                          </div>
                          <div>
                              <label className="block text-sm font-bold text-gray-800 mb-2">Nombres</label>
                              <input 
                                 type="text" 
                                 className={inputClass}
                                 value={client.name}
                                 onChange={e => setClient({...client, name: e.target.value})}
                                 placeholder="Ingrese nombres"
                              />
                          </div>
                      </div>

                      <div className="bg-teal-50 p-6 rounded-lg mb-8 text-center border border-teal-200">
                          <p className="text-sm text-gray-700 font-bold uppercase tracking-wide mb-1">Total a Pagar</p>
                          <p className="text-4xl font-extrabold text-teal-800">Bs {total.toFixed(2)}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <Button variant="secondary" onClick={() => setShowCheckout(false)} className="py-3" disabled={isProcessing}>Cancelar</Button>
                          <Button onClick={handleCheckout} className="font-bold py-3" disabled={isProcessing}>
                              {isProcessing ? <Loader className="animate-spin h-5 w-5 mr-2" /> : <CheckCircle className="h-5 w-5 mr-2" />} 
                              {isProcessing ? 'Procesando' : 'Confirmar'}
                          </Button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Success Modal - UPDATED FOR RESPONSIVENESS AND PRINTING */}
      {showSuccess && lastSale && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center p-4 backdrop-blur-md">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col max-h-[95vh] border border-gray-300">
                  <div className="bg-teal-700 p-4 text-white text-center shrink-0 rounded-t-xl">
                       <CheckCircle className="h-10 w-10 mx-auto mb-2" />
                       <h3 className="text-xl font-bold">¡Venta Exitosa!</h3>
                  </div>

                  <div className="p-4 overflow-y-auto bg-gray-100 flex-1">
                      {showPreview ? (
                          <div className="mb-4">
                              <ReceiptPreview sale={lastSale} />
                              <button 
                                onClick={() => setShowPreview(false)} 
                                className="mt-4 w-full text-center text-teal-700 font-bold hover:underline py-2 text-sm"
                              >
                                  Ocultar Vista Previa
                              </button>
                          </div>
                      ) : (
                          <div className="grid grid-cols-1 gap-3 mb-4">
                              <p className="text-gray-600 text-center text-sm mb-2">Seleccione una opción para el comprobante:</p>
                              <Button onClick={() => setShowPreview(true)} variant="secondary" className="py-3 justify-start bg-white hover:bg-gray-50 border-gray-300">
                                  <Eye className="mr-3 h-5 w-5 text-teal-600" /> Vista Previa
                              </Button>
                              <Button onClick={() => handlePrint(lastSale, config)} variant="secondary" className="py-3 justify-start bg-white hover:bg-gray-50 border-gray-300">
                                  <Printer className="mr-3 h-5 w-5 text-teal-600" /> Imprimir Recibo
                              </Button>
                              <Button onClick={() => handlePrint(lastSale, config)} variant="secondary" className="py-3 justify-start bg-white hover:bg-gray-50 border-gray-300">
                                  <FileText className="mr-3 h-5 w-5 text-teal-600" /> Imprimir Factura
                              </Button>
                          </div>
                      )}
                  </div>
                  
                  <div className="p-4 border-t border-gray-200 bg-white rounded-b-xl shrink-0">
                      <Button onClick={() => setShowSuccess(false)} className="w-full py-3 font-bold">
                          {showPreview ? 'Cerrar' : 'Nueva Venta / Cerrar'}
                      </Button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};