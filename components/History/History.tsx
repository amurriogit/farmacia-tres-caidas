import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MovementType, Sale, PharmacyConfig } from '../../types';
import { Eye, Activity, X, Printer, Search } from 'lucide-react';

export const History = () => {
  const { movements, sales, config } = useApp();
  const [filter, setFilter] = useState('');
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);

  // Reverse to show newest first
  const filteredMovements = [...movements].reverse().filter(m => 
      m.productName.toLowerCase().includes(filter.toLowerCase()) ||
      m.userName.toLowerCase().includes(filter.toLowerCase())
  );

  const getBadgeColor = (type: MovementType) => {
      switch(type) {
          case MovementType.SALE: return 'bg-blue-100 text-blue-800 border-blue-200';
          case MovementType.IN: return 'bg-green-100 text-green-800 border-green-200';
          case MovementType.OUT: return 'bg-red-100 text-red-800 border-red-200';
          case MovementType.ADJUSTMENT: return 'bg-orange-100 text-orange-800 border-orange-200';
          default: return 'bg-gray-100 text-gray-800';
      }
  };

  const handleReprint = (reason?: string) => {
      if (!reason || !reason.includes('Venta ID:')) return;
      const id = reason.split('Venta ID: ')[1]?.trim();
      if(id) setSelectedSaleId(id);
  }

  const printReceipt = (sale: Sale, config: PharmacyConfig) => {
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

  const saleDetails = selectedSaleId ? sales.find(s => s.id === selectedSaleId) : null;

  return (
    <div className="p-4 md:p-6 space-y-6 md:space-y-8 h-full flex flex-col">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
             <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Historial de Movimientos</h1>
             <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Filtrar por producto o usuario..." 
                    className="w-full border border-slate-600 pl-10 pr-4 py-3 rounded-lg text-white placeholder-gray-400 bg-slate-800 focus:bg-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none font-medium shadow-sm transition-all"
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                />
             </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 flex-1 overflow-x-auto">
            <div className="min-w-full inline-block align-middle">
                <div className="overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 md:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Fecha</th>
                                <th className="px-4 md:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Tipo</th>
                                <th className="px-4 md:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Producto</th>
                                <th className="px-4 md:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Cant.</th>
                                <th className="px-4 md:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden md:table-cell">Responsable</th>
                                <th className="px-4 md:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Detalle / Acción</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredMovements.map(m => (
                                <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-700 font-medium">
                                        {new Date(m.timestamp).toLocaleDateString()} <span className="text-gray-400 text-xs hidden md:inline">{new Date(m.timestamp).toLocaleTimeString()}</span>
                                    </td>
                                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-[10px] md:text-xs leading-5 font-bold rounded-full border ${getBadgeColor(m.type)}`}>
                                            {m.type}
                                        </span>
                                    </td>
                                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                        {m.productName}
                                    </td>
                                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                                        {m.quantity}
                                    </td>
                                     <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-bold hidden md:table-cell">
                                        {m.userName}
                                    </td>
                                     <td className="px-4 md:px-6 py-4 text-sm text-gray-600 flex justify-between items-center gap-2">
                                        <div className="truncate max-w-[150px]">
                                            {m.clientInfo && <div className="text-xs font-medium truncate">Clt: {m.clientInfo}</div>}
                                            {m.reason && <div className="text-xs italic truncate">{m.reason}</div>}
                                        </div>
                                        {m.type === MovementType.SALE && (
                                            <button 
                                                onClick={() => handleReprint(m.reason)} 
                                                className="bg-teal-50 text-teal-700 p-2 rounded-lg hover:bg-teal-100 transition-colors border border-teal-200 flex-shrink-0" 
                                                title="Ver e Imprimir Recibo"
                                            >
                                                <Printer className="w-4 h-4"/>
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        {/* Reprint Modal - Fixed Layout */}
        {saleDetails && (
            <div className="fixed inset-0 z-[60] bg-black bg-opacity-70 flex items-center justify-center p-4 backdrop-blur-sm">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm flex flex-col max-h-[85vh] relative border border-gray-300 overflow-hidden">
                    
                    {/* Fixed Header */}
                    <div className="flex justify-between items-center p-4 bg-gray-50 border-b border-gray-200 shrink-0">
                        <h3 className="font-bold text-gray-800">Vista Previa Recibo</h3>
                        <button onClick={() => setSelectedSaleId(null)} className="p-1.5 bg-gray-200 rounded-full hover:bg-gray-300 text-gray-600 transition-colors">
                             <X className="h-5 w-5"/>
                        </button>
                    </div>
                    
                    {/* Scrollable Receipt Content */}
                    <div className="flex-1 overflow-y-auto p-0 bg-gray-100">
                        <div className="bg-white m-4 p-0 shadow-sm border border-gray-200 rounded-lg overflow-hidden">
                            <div className="bg-teal-700 h-16 relative flex items-center justify-center shrink-0">
                                <div className="bg-white p-1.5 rounded-xl shadow z-10 mt-8">
                                    <Activity className="h-6 w-6 text-teal-700" />
                                </div>
                            </div>

                            <div className="pt-8 pb-4 px-6 text-center border-b border-gray-100">
                                <h4 className="font-black text-gray-900 text-sm uppercase leading-tight">{config.name}</h4>
                                <p className="text-[10px] text-gray-500 mt-1">{config.address}</p>
                                <div className="mt-2 text-[10px] text-gray-400 font-medium bg-gray-50 inline-block px-2 py-1 rounded">
                                    NIT: {config.nit} • Tel: {config.phone}
                                </div>
                            </div>

                            <div className="p-5 bg-gray-50/30">
                                <div className="flex justify-between text-[10px] mb-4 text-gray-500 font-medium uppercase tracking-wide">
                                    <div>
                                        <p className="mb-1">FECHA: <span className="text-gray-900">{new Date(saleDetails.timestamp).toLocaleDateString()}</span></p>
                                        <p>CLIENTE: <span className="text-gray-900">{saleDetails.client.name}</span></p>
                                    </div>
                                    <div className="text-right">
                                        <p className="mb-1">RECIBO: <span className="text-gray-900">#{saleDetails.id.substring(0,6).toUpperCase()}</span></p>
                                        <p>CI: <span className="text-gray-900">{saleDetails.client.nit || saleDetails.client.documentId}</span></p>
                                    </div>
                                </div>

                                <div className="bg-white rounded border border-gray-200 p-3 mb-4">
                                    <table className="w-full text-[11px]">
                                        <thead>
                                            <tr className="border-b border-gray-100 text-gray-400">
                                                <th className="text-left py-1 font-bold">CANT</th>
                                                <th className="text-left py-1 font-bold">DESC</th>
                                                <th className="text-right py-1 font-bold">TOT</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {saleDetails.items.map(i => (
                                                <tr key={i.id}>
                                                    <td className="py-2 font-bold text-teal-600 align-top">{i.saleQuantity}</td>
                                                    <td className="py-2 text-gray-800 align-top">{i.name}</td>
                                                    <td className="py-2 text-right font-medium align-top">{i.subtotal.toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="bg-teal-900 text-white p-3 rounded-lg flex justify-between items-center shadow-lg">
                                    <span className="font-bold text-xs uppercase opacity-80">Total Pagado</span>
                                    <span className="font-black text-lg">Bs {saleDetails.total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 bg-white border-t border-gray-200 flex gap-3 shrink-0">
                         <button onClick={() => setSelectedSaleId(null)} className="flex-1 py-3 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                             Cerrar
                         </button>
                         <button onClick={() => printReceipt(saleDetails, config)} className="flex-1 py-3 bg-teal-700 text-white rounded-lg font-bold hover:bg-teal-800 transition-colors shadow flex justify-center items-center">
                             <Printer className="h-4 w-4 mr-2"/> IMPRIMIR
                         </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};