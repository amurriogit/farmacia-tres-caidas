import React from 'react';
import { useApp } from '../context/AppContext';
import { Store, ShoppingCart, Users, ClipboardList, Settings, LogOut, Package, History, HelpCircle, LayoutDashboard, Activity } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { config, logout, currentUser } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Panel Principal', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventario', icon: Package },
    { id: 'sales', label: 'Ventas', icon: ShoppingCart },
    { id: 'reports', label: 'Reportes', icon: ClipboardList },
    { id: 'users', label: 'Usuarios', icon: Users, role: 'ADMIN' },
    { id: 'history', label: 'Historial', icon: History },
    { id: 'config', label: 'Configuración', icon: Settings },
  ];

  const hasAccess = (moduleId: string, roleRequired?: string) => {
      if (moduleId === 'dashboard') return true;
      if (!currentUser) return false;
      if (currentUser.role === 'ADMIN') return true;
      if (roleRequired && currentUser.role !== roleRequired) return false;
      return currentUser.allowedModules.includes(moduleId);
  };

  return (
    <div className="flex h-screen bg-slate-200 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-teal-900 text-white hidden md:flex flex-col shadow-2xl z-10 h-full">
        {/* Header */}
        <div className="p-8 border-b border-teal-800 flex items-center space-x-4 flex-shrink-0">
          <div className="bg-teal-800 p-2 rounded-lg">
            <Activity className="h-8 w-8 text-teal-100" />
          </div>
          <div>
            <h1 className="font-bold text-sm leading-tight text-teal-50 line-clamp-2">{config.name}</h1>
            <p className="text-xs text-teal-300 mt-1">Versión 3.0</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-6 space-y-3 overflow-y-auto no-scrollbar">
          {navItems.map((item) => {
             if (!hasAccess(item.id, item.role)) return null;
             return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-4 rounded-xl transition-all duration-200 ${
                  activeTab === item.id 
                  ? 'bg-teal-700 text-white shadow-lg translate-x-1' 
                  : 'text-teal-200 hover:bg-teal-800 hover:text-white'
                }`}
              >
                <item.icon className="h-6 w-6" />
                <span className="font-medium text-base">{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-teal-800 bg-teal-950 flex-shrink-0 space-y-3">
           <button
                onClick={() => setActiveTab('help')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeTab === 'help' 
                  ? 'bg-teal-800 text-white' 
                  : 'text-teal-300 hover:bg-teal-900 hover:text-white'
                }`}
              >
                <HelpCircle className="h-5 w-5" />
                <span className="font-medium text-sm">Ayuda y Soporte</span>
           </button>

           <div className="flex items-center space-x-3 py-3">
              <div className="h-10 w-10 rounded-full bg-teal-700 flex items-center justify-center font-bold border-2 border-teal-600 flex-shrink-0">
                  {currentUser?.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                  <p className="text-sm font-bold truncate text-teal-50">{currentUser?.name}</p>
                  <p className="text-xs text-teal-400">{currentUser?.role}</p>
              </div>
           </div>
           
           <button 
             onClick={logout}
             className="w-full flex items-center justify-center space-x-2 bg-red-900/40 text-red-200 p-3 rounded-lg hover:bg-red-900/60 transition-colors border border-red-900/50"
           >
             <LogOut className="h-5 w-5" />
             <span className="text-sm font-medium">Cerrar Sesión</span>
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-slate-200">
         {/* Mobile Header */}
         <div className="md:hidden bg-teal-900 text-white p-4 flex justify-between items-center shadow-md flex-shrink-0">
             <div className="flex items-center gap-2">
                <Activity className="h-6 w-6 text-teal-300" />
                <span className="font-bold text-sm truncate w-48">{config.name}</span>
             </div>
             <button onClick={logout}><LogOut className="h-5 w-5"/></button>
         </div>

         {/* Mobile Nav */}
         <div className="md:hidden bg-white border-b border-gray-200 overflow-x-auto flex shadow-sm flex-shrink-0">
            {navItems.map((item) => {
               if (!hasAccess(item.id, item.role)) return null;
               return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex-shrink-0 flex items-center space-x-2 px-6 py-4 border-b-4 ${
                    activeTab === item.id ? 'border-teal-700 text-teal-700 bg-teal-50' : 'border-transparent text-gray-500'
                  }`}
                >
                  <item.icon className="h-6 w-6" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
               )
            })}
             <button
                  onClick={() => setActiveTab('help')}
                  className={`flex-shrink-0 flex items-center space-x-2 px-6 py-4 border-b-4 ${
                    activeTab === 'help' ? 'border-teal-700 text-teal-700 bg-teal-50' : 'border-transparent text-gray-500'
                  }`}
                >
                  <HelpCircle className="h-6 w-6" />
                  <span className="text-sm font-medium">Ayuda</span>
            </button>
         </div>

         <div className="flex-1 overflow-auto p-2 md:p-0">
             {children}
         </div>
      </main>
    </div>
  );
};