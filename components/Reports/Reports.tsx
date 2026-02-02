import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, TrendingUp, Package, Printer, Calendar, DollarSign, Wallet } from 'lucide-react';
import { Button } from '../ui/Button';

export const Reports = () => {
  const { products, sales, config } = useApp();
  
  // Date Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Filter Sales
  const filteredSales = sales.filter(s => {
      const saleDate = new Date(s.timestamp).toISOString().split('T')[0];
      if (startDate && saleDate < startDate) return false;
      if (endDate && saleDate > endDate) return false;
      return true;
  });

  // Alerts logic (Unchanged mostly)
  const lowStock = products.filter(p => p.quantity <= p.minStock);
  const expiringSoon = products.filter(p => {
      const today = new Date();
      const expiry = new Date(p.expiryDate);
      const diffTime = Math.abs(expiry.getTime() - today.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 30 && expiry > today; 
  });

  const salesByDate = filteredSales.reduce((acc: any, sale) => {
      const date = sale.timestamp.split('T')[0];
      if (!acc[date]) acc[date] = 0;
      acc[date] += sale.total;
      return acc;
  }, {});

  const salesChartData = Object.keys(salesByDate).map(date => ({
      date,
      total: salesByDate[date]
  })).sort((a,b) => a.date.localeCompare(b.date));

  // FINANCIAL CALCULATIONS
  const totalIncome = filteredSales.reduce((sum, s) => sum + s.total, 0);
  
  // Calculate Profit based on sales (Sale Price - Product Cost)
  // FIX: Added (item.cost || 0) to handle historical sales that didn't have cost recorded
  const estimatedProfit = filteredSales.reduce((sum, s) => {
      const saleCost = s.items.reduce((cSum, item) => cSum + ((item.cost || 0) * item.saleQuantity), 0);
      return sum + (s.total - saleCost);
  }, 0);

  // Calculate Patrimony (Inventory Value) = Sum(Quantity * Cost)
  const totalPatrimony = products.reduce((sum, p) => sum + (p.quantity * p.cost), 0);

  const handlePrint = () => {
      const content = document.getElementById('printable-report');
      if (content) {
          const printWindow = window.open('', '', 'width=800,height=600');
          if(printWindow) {
              printWindow.document.write(`
                <html>
                  <head>
                    <title>Reporte - ${config.name}</title>
                    <style>
                      body { font-family: sans-serif; padding: 20px; }
                      h1 { color: #333; }
                      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                      th { background-color: #f2f2f2; }
                      .header { margin-bottom: 30px; text-align: center; }
                      .financials { display: flex; justify-content: space-between; margin-bottom: 20px; border: 1px solid #ccc; padding: 10px; }
                    </style>
                  </head>
                  <body>
                    <div class="header">
                        <h1>${config.name}</h1>
                        <p>Reporte Diario de Movimientos</p>
                        <p>Fecha de Corte: ${new Date().toLocaleDateString()}</p>
                        <p>Rango: ${startDate || 'Inicio'} a ${endDate || 'Hoy'}</p>
                    </div>
                    
                    <h3>Resumen Financiero</h3>
                    <div class="financials">
                        <div>
                            <p><strong>Total Ventas (Ingresos):</strong> Bs ${totalIncome.toFixed(2)}</p>
                            <p><strong>Ganancia Neta Estimada:</strong> Bs ${estimatedProfit.toFixed(2)}</p>
                        </div>
                        <div style="text-align: right;">
                             <p><strong>Patrimonio en Inventario (Costo):</strong> Bs ${totalPatrimony.toFixed(2)}</p>
                        </div>
                    </div>

                    <h3>Detalle de Ventas</h3>
                    <table>
                        <thead>
                            <tr><th>Fecha</th><th>Venta ID</th><th>Total</th></tr>
                        </thead>
                        <tbody>
                            ${filteredSales.map(s => `
                                <tr>
                                    <td>${new Date(s.timestamp).toLocaleDateString()}</td>
                                    <td>${s.id.substring(0,8)}</td>
                                    <td>${s.total.toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                  </body>
                </html>
              `);
              printWindow.document.close();
              printWindow.focus();
              printWindow.print();
              printWindow.close();
          }
      }
  };

  const inputClass = "border border-slate-600 px-3 py-2 rounded text-white bg-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500 text-sm";

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Reportes y Estadísticas</h1>
          <div className="flex gap-2 items-center bg-white p-3 rounded shadow-sm">
              <Calendar className="text-gray-500 h-5 w-5" />
              <input type="date" className={inputClass} value={startDate} onChange={e => setStartDate(e.target.value)} />
              <span className="text-gray-500">-</span>
              <input type="date" className={inputClass} value={endDate} onChange={e => setEndDate(e.target.value)} />
              <Button onClick={handlePrint} className="ml-2"><Printer className="w-4 h-4 mr-2"/> Imprimir Reporte</Button>
          </div>
      </div>

      <div id="printable-report" className="hidden"></div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-teal-500">
              <div className="flex justify-between items-center">
                  <div>
                      <p className="text-gray-500 text-sm">Ventas (Periodo)</p>
                      <h3 className="text-2xl font-bold text-gray-800">Bs {totalIncome.toFixed(2)}</h3>
                  </div>
                  <TrendingUp className="h-8 w-8 text-teal-200" />
              </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
              <div className="flex justify-between items-center">
                  <div>
                      <p className="text-gray-500 text-sm">Ganancia Est. (Periodo)</p>
                      <h3 className="text-2xl font-bold text-gray-800">Bs {estimatedProfit.toFixed(2)}</h3>
                  </div>
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">%</div>
              </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
              <div className="flex justify-between items-center">
                  <div>
                      <p className="text-gray-500 text-sm font-bold text-purple-700">Patrimonio (Inventario)</p>
                      <h3 className="text-2xl font-bold text-gray-800">Bs {totalPatrimony.toFixed(2)}</h3>
                  </div>
                  <Wallet className="h-8 w-8 text-purple-200" />
              </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-orange-500">
              <div className="flex justify-between items-center">
                  <div>
                      <p className="text-gray-500 text-sm">Productos Totales</p>
                      <h3 className="text-2xl font-bold text-gray-800">{products.length}</h3>
                  </div>
                  <Package className="h-8 w-8 text-orange-200" />
              </div>
          </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Tendencia de Ventas (Periodo Seleccionado)</h3>
          <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => `Bs ${value.toFixed(2)}`} />
                      <Bar dataKey="total" fill="#0d9488" name="Ventas (Bs)" />
                  </BarChart>
              </ResponsiveContainer>
          </div>
      </div>

      {/* Alerts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-red-50 p-4 border-b border-red-100 flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                  <h3 className="font-bold text-red-700">Stock Crítico ({lowStock.length})</h3>
              </div>
              <div className="p-4 max-h-60 overflow-y-auto">
                  {lowStock.length === 0 ? <p className="text-gray-500 text-sm">No hay alertas de stock.</p> : (
                      <ul className="space-y-2">
                          {lowStock.map(p => (
                              <li key={p.id} className="flex justify-between text-sm border-b pb-1">
                                  <span>{p.name}</span>
                                  <span className="font-bold text-red-600">{p.quantity} unid.</span>
                              </li>
                          ))}
                      </ul>
                  )}
              </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-yellow-50 p-4 border-b border-yellow-100 flex items-center">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                  <h3 className="font-bold text-yellow-800">Próximos a Vencer ({expiringSoon.length})</h3>
              </div>
              <div className="p-4 max-h-60 overflow-y-auto">
                  {expiringSoon.length === 0 ? <p className="text-gray-500 text-sm">No hay productos próximos a vencer.</p> : (
                      <ul className="space-y-2">
                          {expiringSoon.map(p => (
                              <li key={p.id} className="flex justify-between text-sm border-b pb-1">
                                  <span>{p.name}</span>
                                  <span className="font-bold text-yellow-600">{p.expiryDate}</span>
                              </li>
                          ))}
                      </ul>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
};