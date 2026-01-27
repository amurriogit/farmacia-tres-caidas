import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { Button } from '../ui/Button';
import { Trash2 } from 'lucide-react';

export const Users = () => {
  const { users, addUser, deleteUser, currentUser } = useApp();
  const [formData, setFormData] = useState({
      name: '', lastName: '', documentId: '', username: '', password: '', role: UserRole.PHARMACIST
  });
  
  const allModules = [
      { id: 'inventory', label: 'Inventario' },
      { id: 'sales', label: 'Ventas' },
      { id: 'reports', label: 'Reportes' },
      { id: 'history', label: 'Historial' },
      { id: 'config', label: 'Configuración' },
  ];
  const [allowedModules, setAllowedModules] = useState<string[]>(['sales']);

  const handleModuleToggle = (id: string) => {
      setAllowedModules(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      // If admin, give all access automatically
      const perms = formData.role === UserRole.ADMIN 
        ? ['inventory', 'sales', 'reports', 'users', 'history', 'config'] 
        : allowedModules;

      addUser({
          ...formData,
          role: formData.role,
          permissions: [], 
          allowedModules: perms,
          active: true
      });
      setFormData({ name: '', lastName: '', documentId: '', username: '', password: '', role: UserRole.PHARMACIST });
      setAllowedModules(['sales']);
  };

  const inputClass = "w-full border border-slate-600 px-4 py-3 rounded text-white bg-slate-800 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-medium shadow-sm transition-all";

  // Security Check: only Admin can access this component
  if (currentUser?.role !== UserRole.ADMIN) {
      return <div className="p-8 text-center text-red-600 font-bold">Acceso Denegado: Solo administradores.</div>;
  }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Control de Usuarios</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* List */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                      <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Nombre</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Usuario</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Rol</th>
                          <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Acción</th>
                      </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                      {users.map(u => (
                          <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-5 whitespace-nowrap">
                                  <div className="text-sm font-bold text-gray-900">{u.name} {u.lastName}</div>
                                  <div className="text-xs text-gray-600 font-medium mt-1">{u.documentId}</div>
                              </td>
                              <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-700 font-medium">{u.username}</td>
                              <td className="px-6 py-5 whitespace-nowrap">
                                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                                      u.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                                  }`}>
                                      {u.role}
                                  </span>
                              </td>
                              <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                                  {u.id !== currentUser?.id && (
                                      <button onClick={() => deleteUser(u.id)} className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-full transition-colors">
                                          <Trash2 className="h-5 w-5"/>
                                      </button>
                                  )}
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>

          {/* Form */}
          <div className="bg-white p-8 rounded-xl shadow-md h-fit border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6 pb-2 border-b">Registrar Nuevo Usuario</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                      <label className="block text-sm font-bold text-gray-800 mb-2">Nombres</label>
                      <input required type="text" className={inputClass} placeholder="Ej: Maria" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}/>
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-gray-800 mb-2">Apellidos</label>
                      <input required type="text" className={inputClass} placeholder="Ej: Gomez" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})}/>
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-gray-800 mb-2">CI</label>
                      <input required type="text" className={inputClass} placeholder="Ej: 8888888 SC" value={formData.documentId} onChange={e => setFormData({...formData, documentId: e.target.value})}/>
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-gray-800 mb-2">Rol</label>
                      <select className={inputClass} value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as UserRole})}>
                          <option value={UserRole.ADMIN}>Administrador</option>
                          <option value={UserRole.PHARMACIST}>Farmacéutico</option>
                          <option value={UserRole.CASHIER}>Cajero</option>
                      </select>
                  </div>
                  
                  {formData.role !== UserRole.ADMIN && (
                      <div className="bg-gray-50 p-4 rounded border border-gray-200">
                          <label className="block text-sm font-bold text-gray-800 mb-3">Permisos de Acceso:</label>
                          <div className="space-y-2">
                              {allModules.map(mod => (
                                  <label key={mod.id} className="flex items-center space-x-2">
                                      <input 
                                        type="checkbox" 
                                        checked={allowedModules.includes(mod.id)}
                                        onChange={() => handleModuleToggle(mod.id)}
                                        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                                      />
                                      <span className="text-sm text-gray-700 font-medium">{mod.label}</span>
                                  </label>
                              ))}
                          </div>
                      </div>
                  )}

                  <div>
                      <label className="block text-sm font-bold text-gray-800 mb-2">Usuario</label>
                      <input required type="text" className={inputClass} placeholder="Ej: maria.gomez" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})}/>
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-gray-800 mb-2">Contraseña</label>
                      <input required type="password" className={inputClass} placeholder="******" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}/>
                  </div>
                  <Button type="submit" className="w-full mt-4 py-3 text-lg font-bold">Guardar Usuario</Button>
              </form>
          </div>
      </div>
    </div>
  );
};