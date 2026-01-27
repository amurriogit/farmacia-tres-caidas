import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { AlertTriangle, Trash2 } from 'lucide-react';

export const Config = () => {
  const { config, updateConfig, resetDatabase } = useApp();
  const [formData, setFormData] = useState(config);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig(formData);
    alert('Configuración actualizada correctamente');
  };

  const handleReset = () => {
      const confirmText = prompt("Escribe 'ELIMINAR' para borrar TODOS los datos (usuarios, productos, ventas) y reiniciar el sistema:");
      if (confirmText === 'ELIMINAR') {
          resetDatabase();
      }
  }

  const inputClass = "mt-1 w-full border border-slate-600 rounded-md px-4 py-3 text-white bg-slate-800 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-medium shadow-sm transition-all";

  return (
    <div className="p-6">
       <h1 className="text-3xl font-bold text-gray-900 mb-8">Configuración de Farmacia</h1>
       <div className="bg-white p-10 rounded-xl shadow-md max-w-3xl border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="col-span-2">
                      <label className="block text-sm font-bold text-gray-800 mb-2">Razón Social / Nombre Farmacia</label>
                      <input type="text" required className={inputClass} placeholder="Ej: Farmacia Central"
                        value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-gray-800 mb-2">NIT</label>
                      <input type="text" required className={inputClass} placeholder="Ej: 10203040"
                        value={formData.nit} onChange={e => setFormData({...formData, nit: e.target.value})} />
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-gray-800 mb-2">Teléfono</label>
                      <input type="text" className={inputClass} placeholder="Ej: 2-222222"
                        value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                  <div className="col-span-2">
                      <label className="block text-sm font-bold text-gray-800 mb-2">Dirección</label>
                      <input type="text" className={inputClass} placeholder="Ej: Av. 6 de Agosto #123"
                        value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-gray-800 mb-2">Correo Electrónico</label>
                      <input type="email" className={inputClass} placeholder="Ej: contacto@farmacia.com"
                        value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-gray-800 mb-2">Redes Sociales</label>
                      <input type="text" className={inputClass} placeholder="Ej: Facebook: @farmacia"
                        value={formData.socials} onChange={e => setFormData({...formData, socials: e.target.value})} />
                  </div>
              </div>
              <div className="pt-8 border-t border-gray-200">
                  <Button type="submit" className="py-3 px-6 text-lg">Guardar Cambios</Button>
              </div>
          </form>
       </div>

       <div className="mt-12 bg-red-50 p-6 rounded-xl border border-red-200 max-w-3xl">
            <h3 className="text-xl font-bold text-red-800 flex items-center mb-4">
                <AlertTriangle className="mr-2"/> Zona de Peligro
            </h3>
            <p className="text-red-700 mb-4">Esta acción eliminará todos los usuarios, productos y el historial de ventas. El sistema volverá a su estado inicial de registro.</p>
            <Button variant="danger" onClick={handleReset} className="font-bold">
                <Trash2 className="mr-2 h-5 w-5"/> REINICIAR BASE DE DATOS
            </Button>
       </div>
    </div>
  );
};