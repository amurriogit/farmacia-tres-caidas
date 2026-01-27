import React from 'react';
import { useApp } from '../../context/AppContext';
import { Package, ShoppingCart, ClipboardList, Users, History, Settings, HelpCircle, Activity } from 'lucide-react';

interface DashboardProps {
    setActiveTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setActiveTab }) => {
    const { config, currentUser } = useApp();

    const modules = [
        { id: 'inventory', label: 'Inventario', icon: Package, desc: 'Gestionar productos y stock', color: 'bg-blue-600' },
        { id: 'sales', label: 'Ventas', icon: ShoppingCart, desc: 'Realizar facturación y ventas', color: 'bg-teal-600' },
        { id: 'reports', label: 'Reportes', icon: ClipboardList, desc: 'Ver estadísticas y ganancias', color: 'bg-purple-600' },
        { id: 'users', label: 'Usuarios', icon: Users, desc: 'Administrar personal', color: 'bg-orange-600', role: 'ADMIN' },
        { id: 'history', label: 'Historial', icon: History, desc: 'Auditoría de movimientos', color: 'bg-indigo-600' },
        { id: 'config', label: 'Configuración', icon: Settings, desc: 'Datos de la farmacia', color: 'bg-slate-600' },
    ];

    const hasAccess = (moduleId: string, roleRequired?: string) => {
        if (!currentUser) return false;
        if (currentUser.role === 'ADMIN') return true;
        if (roleRequired && currentUser.role !== roleRequired) return false;
        return currentUser.allowedModules.includes(moduleId);
    };

    return (
        <div className="p-8 h-full overflow-y-auto">
            <div className="mb-10 text-center md:text-left bg-white p-8 rounded-2xl shadow-sm border border-gray-200 flex flex-col md:flex-row items-center gap-6">
                <div className="bg-teal-100 p-4 rounded-full">
                    <Activity className="h-16 w-16 text-teal-700" />
                </div>
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{config.name}</h1>
                    <p className="text-lg text-gray-600">Bienvenido al Panel Principal, <span className="font-bold text-teal-700">{currentUser?.name}</span></p>
                    <p className="text-sm text-gray-400 mt-1">Seleccione un módulo para comenzar a trabajar.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {modules.map(mod => {
                    if (!hasAccess(mod.id, mod.role)) return null;
                    return (
                        <button
                            key={mod.id}
                            onClick={() => setActiveTab(mod.id)}
                            className="group relative bg-white rounded-2xl shadow-md hover:shadow-2xl border border-gray-200 p-8 transition-all duration-300 text-left flex flex-col items-start overflow-hidden"
                        >
                            <div className={`absolute top-0 right-0 w-24 h-24 ${mod.color} opacity-10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-150`}></div>
                            
                            <div className={`${mod.color} text-white p-4 rounded-xl mb-6 shadow-md group-hover:scale-110 transition-transform`}>
                                <mod.icon className="h-8 w-8" />
                            </div>
                            
                            <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-teal-700 transition-colors">{mod.label}</h3>
                            <p className="text-gray-500 font-medium">{mod.desc}</p>
                            
                            <div className="mt-auto pt-6 flex items-center text-sm font-bold text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                                Acceder al módulo &rarr;
                            </div>
                        </button>
                    )
                })}
                
                <button
                    onClick={() => setActiveTab('help')}
                    className="group bg-slate-800 rounded-2xl shadow-md hover:shadow-2xl border border-slate-700 p-8 transition-all duration-300 text-left flex flex-col items-start"
                >
                     <div className="bg-slate-700 text-white p-4 rounded-xl mb-6 shadow-md group-hover:scale-110 transition-transform">
                        <HelpCircle className="h-8 w-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Ayuda y Soporte</h3>
                    <p className="text-slate-400 font-medium">Tutoriales y preguntas frecuentes</p>
                </button>
            </div>
        </div>
    );
};
