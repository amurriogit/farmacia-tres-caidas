import React from 'react';
import { Package, ShoppingCart, ClipboardList, Users, History, Settings } from 'lucide-react';

export const Help = () => {
  const steps = [
    {
        title: "Paso 1: Configuración Inicial",
        icon: Settings,
        content: "Al ingresar por primera vez, asegúrese de ir a 'Configuración' para ingresar el nombre de la farmacia, NIT y dirección. Estos datos aparecerán en los recibos y facturas."
    },
    {
        title: "Paso 2: Gestionar Inventario",
        icon: Package,
        content: "Vaya a 'Inventario'. Use 'Nuevo Producto' para agregar items. Escanee el código de barras o ingréselo manualmente. Defina stock mínimo para recibir alertas. Puede usar la importación masiva por CSV."
    },
    {
        title: "Paso 3: Realizar Ventas",
        icon: ShoppingCart,
        content: "En el módulo 'Ventas', escanee un producto o búsquelo por nombre. Se agregará al carrito. Puede ajustar cantidades. Al cobrar, ingrese datos del cliente para factura. Al finalizar, podrá imprimir el comprobante."
    },
    {
        title: "Paso 4: Reportes y Cierre",
        icon: ClipboardList,
        content: "Al final del día, revise 'Reportes'. Filtre por la fecha de hoy para ver las ganancias totales. Imprima este reporte para su arqueo de caja."
    },
    {
        title: "Gestión de Personal",
        icon: Users,
        content: "Como Administrador, use 'Usuarios' para crear cuentas para farmacéuticos o cajeros. Puede limitar sus permisos (ej. que un cajero solo vea Ventas)."
    },
    {
        title: "Auditoría",
        icon: History,
        content: "En 'Historial' queda registrado cada movimiento. Si necesita reimprimir un recibo antiguo, búsquelo aquí filtrando por el nombre del producto vendido o usuario."
    }
  ];

  return (
    <div className="p-6 space-y-8 pb-20">
        <div className="bg-teal-800 text-white p-8 rounded-xl shadow-lg">
            <h1 className="text-4xl font-bold mb-2">Centro de Ayuda</h1>
            <p className="text-teal-200 text-lg">Guía rápida para operar el sistema FarmaBolivia</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {steps.map((step, idx) => (
                <div key={idx} className="bg-white p-6 rounded-xl shadow border border-gray-200 hover:shadow-lg transition-shadow">
                    <div className="bg-teal-100 w-12 h-12 rounded-full flex items-center justify-center mb-4 text-teal-700">
                        <step.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-xl text-gray-800 mb-3">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed text-sm">
                        {step.content}
                    </p>
                </div>
            ))}
        </div>

        <div className="bg-white p-8 rounded-xl shadow border border-gray-200 mt-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Preguntas Frecuentes</h3>
            <div className="space-y-4">
                <details className="group">
                    <summary className="font-bold text-gray-700 cursor-pointer p-3 bg-gray-50 rounded hover:bg-gray-100 list-none flex justify-between items-center">
                        ¿Cómo elimino una venta errónea?
                        <span className="text-teal-600">+</span>
                    </summary>
                    <p className="p-4 text-gray-600 bg-gray-50 mt-1 rounded text-sm">
                        Por seguridad, las ventas no se eliminan directamente para mantener la integridad fiscal. Debe realizar un movimiento de ajuste en el inventario (Entrada) y registrar la justificación en una nota interna, o contactar al administrador para depuración de base de datos.
                    </p>
                </details>
                <details className="group">
                    <summary className="font-bold text-gray-700 cursor-pointer p-3 bg-gray-50 rounded hover:bg-gray-100 list-none flex justify-between items-center">
                        ¿Qué hago si olvido mi contraseña?
                        <span className="text-teal-600">+</span>
                    </summary>
                    <p className="p-4 text-gray-600 bg-gray-50 mt-1 rounded text-sm">
                        Solicite al Administrador que elimine su usuario y cree uno nuevo. Si es el Administrador quien perdió el acceso, deberá contactar a soporte técnico para un reseteo forzoso (o usar la opción de reinicio de base de datos si es un entorno de prueba).
                    </p>
                </details>
            </div>
        </div>
    </div>
  );
};
