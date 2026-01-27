import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { Activity } from 'lucide-react';

export const Login = () => {
  const { login } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(username, password);
    if (!success) {
      setError('Credenciales inválidas');
    }
  };

  const inputClass = "mt-1 appearance-none rounded-lg relative block w-full px-4 py-3 border border-slate-600 placeholder-gray-400 text-white bg-slate-800 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm font-medium shadow-sm transition-all";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-200 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-12 rounded-2xl shadow-2xl border border-gray-300">
        <div className="text-center">
          <div className="mx-auto h-24 w-24 bg-teal-100 rounded-full flex items-center justify-center mb-6 ring-8 ring-teal-50">
             <Activity className="h-12 w-12 text-teal-700" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Farmacia Señor de las Tres Caídas v3.0</h2>
          <p className="mt-3 text-base text-gray-600">Inicio de Sesión</p>
        </div>
        <form className="mt-10 space-y-8" onSubmit={handleSubmit}>
          {error && <div className="text-red-700 font-bold text-sm text-center bg-red-50 p-4 rounded-lg border border-red-200">{error}</div>}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Usuario</label>
              <input required type="text" className={inputClass} placeholder="Ingrese su usuario asignado"
                value={username} onChange={e => setUsername(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Contraseña</label>
              <input required type="password" className={inputClass} placeholder="Ingrese su contraseña"
                value={password} onChange={e => setPassword(e.target.value)} />
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" className="w-full py-4 text-lg shadow-lg font-bold bg-teal-800 hover:bg-teal-900">
              Ingresar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};