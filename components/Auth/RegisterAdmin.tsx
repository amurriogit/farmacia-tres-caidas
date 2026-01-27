import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { Activity } from 'lucide-react';

export const RegisterAdmin = () => {
  const { registerAdmin } = useApp();
  const [form, setForm] = useState({
    name: '',
    lastName: '',
    documentId: '',
    username: '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerAdmin({
      name: form.name,
      lastName: form.lastName,
      documentId: form.documentId,
      username: form.username,
      password: form.password
    });
  };

  const inputClass = "appearance-none rounded-md relative block w-full px-4 py-3 border border-slate-600 placeholder-gray-400 text-white bg-slate-800 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm font-medium transition-all shadow-sm";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-200 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl border border-gray-300">
        <div className="text-center">
          <Activity className="mx-auto h-16 w-16 text-teal-800" />
          <h2 className="mt-6 text-2xl font-extrabold text-gray-900">Farmacia Señor de las Tres Caídas v3.0</h2>
          <p className="mt-2 text-sm text-gray-600">Registro inicial de Administrador</p>
        </div>
        <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm">
            <div className="grid grid-cols-2 gap-6 mb-6">
               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Nombres</label>
                  <input required type="text" className={inputClass} placeholder="Ej: Juan"
                    value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
               </div>
               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Apellidos</label>
                  <input required type="text" className={inputClass} placeholder="Ej: Pérez"
                    value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} />
               </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">Documento de Identidad (CI)</label>
              <input required type="text" className={inputClass} placeholder="Ej: 1234567 LP"
                value={form.documentId} onChange={e => setForm({...form, documentId: e.target.value})} />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">Usuario</label>
              <input required type="text" className={inputClass} placeholder="Ej: admin"
                value={form.username} onChange={e => setForm({...form, username: e.target.value})} />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">Contraseña</label>
              <input required type="password" className={inputClass} placeholder="******"
                value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
            </div>
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full font-bold py-3 text-lg bg-teal-800 hover:bg-teal-900">
              Registrar Sistema
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};