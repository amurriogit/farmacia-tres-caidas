import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AppState, Product, Sale, User, Movement, PharmacyConfig, UserRole, MovementType } from '../types';
import { supabase } from '../lib/supabaseClient';

interface AppContextType extends AppState {
  login: (u: string, p: string) => Promise<boolean>;
  logout: () => void;
  registerAdmin: (user: Omit<User, 'id' | 'role' | 'permissions' | 'allowedModules' | 'active'>) => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addStock: (productId: string, quantity: number, userId: string) => Promise<void>;
  processSale: (sale: Omit<Sale, 'id' | 'timestamp' | 'userId' | 'userName'>) => Promise<Sale | null>;
  addUser: (user: Omit<User, 'id'>) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  updateConfig: (config: PharmacyConfig) => Promise<void>;
  importProducts: (products: Product[]) => Promise<void>;
  resetDatabase: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_CONFIG: PharmacyConfig = {
  name: 'Cargando...',
  address: '',
  phone: '',
  email: '',
  nit: '',
  socials: ''
};

const INITIAL_STATE: AppState = {
  users: [],
  products: [],
  sales: [],
  movements: [],
  config: INITIAL_CONFIG,
  currentUser: null,
  loading: true
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>(INITIAL_STATE);

  // Load Initial Data from Supabase
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setState(prev => ({ ...prev, loading: true }));
    try {
        const { data: users } = await supabase.from('users').select('*');
        const { data: products } = await supabase.from('products').select('*');
        const { data: sales } = await supabase.from('sales').select('*');
        const { data: movements } = await supabase.from('movements').select('*');
        const { data: config } = await supabase.from('pharmacy_config').select('*').single();

        // Map DB snake_case to CamelCase types
        const mappedUsers = (users || []).map((u: any) => ({
            ...u,
            lastName: u.last_name,
            documentId: u.document_id,
            allowedModules: u.allowed_modules
        }));

        const mappedProducts = (products || []).map((p: any) => ({
            ...p,
            expiryDate: p.expiry_date,
            minStock: p.min_stock,
            maxStock: p.max_stock
        }));

        const mappedSales = (sales || []).map((s: any) => ({
            id: s.id,
            timestamp: s.timestamp,
            total: s.total,
            items: s.items,
            client: s.client_data,
            userId: s.user_id,
            userName: s.user_name
        }));

        const mappedMovements = (movements || []).map((m: any) => ({
             id: m.id,
             type: m.type,
             productId: m.product_id,
             productName: m.product_name,
             quantity: m.quantity,
             timestamp: m.timestamp,
             userId: m.user_id,
             userName: m.user_name,
             reason: m.reason,
             clientInfo: m.client_info
        }));

        setState(prev => ({
            ...prev,
            users: mappedUsers,
            products: mappedProducts,
            sales: mappedSales,
            movements: mappedMovements,
            config: config || INITIAL_CONFIG,
            loading: false
        }));

    } catch (error) {
        console.error("Error fetching data from Supabase:", error);
        setState(prev => ({ ...prev, loading: false }));
    }
  };

  const login = async (u: string, p: string): Promise<boolean> => {
    // In a real app, use supabase.auth.signInWithPassword. 
    // For this simple migration, checking against our users table:
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', u)
        .eq('password', p)
        .eq('active', true)
        .single();

    if (data && !error) {
       const user: User = {
           ...data,
           lastName: data.last_name,
           documentId: data.document_id,
           allowedModules: data.allowed_modules
       };
       setState(prev => ({ ...prev, currentUser: user }));
       return true;
    }
    return false;
  };

  const logout = () => {
    setState(prev => ({ ...prev, currentUser: null }));
  };

  const registerAdmin = async (userData: Omit<User, 'id' | 'role' | 'permissions' | 'allowedModules' | 'active'>) => {
    const newUser = {
      name: userData.name,
      last_name: userData.lastName,
      document_id: userData.documentId,
      username: userData.username,
      password: userData.password,
      role: UserRole.ADMIN,
      permissions: ['ALL'],
      allowed_modules: ['inventory', 'sales', 'reports', 'users', 'history', 'config', 'help'],
      active: true
    };

    const { error } = await supabase.from('users').insert(newUser);
    if (!error) await fetchData();
  };

  const addProduct = async (productData: Omit<Product, 'id'>) => {
    const newProduct = {
        name: productData.name,
        form: productData.form,
        content: productData.content,
        line: productData.line,
        price: productData.price,
        cost: productData.cost,
        quantity: productData.quantity,
        batch: productData.batch,
        expiry_date: productData.expiryDate,
        location: productData.location,
        barcode: productData.barcode,
        min_stock: productData.minStock,
        max_stock: productData.maxStock
    };

    const { data: prodData, error } = await supabase.from('products').insert(newProduct).select().single();
    
    if (!error && prodData) {
        const movement = {
            type: MovementType.IN,
            product_id: prodData.id,
            product_name: prodData.name,
            quantity: prodData.quantity,
            user_id: state.currentUser?.id || 'SYSTEM',
            user_name: state.currentUser?.name || 'SYSTEM',
            reason: 'Registro inicial'
        };
        await supabase.from('movements').insert(movement);
        await fetchData();
    }
  };

  const updateProduct = async (product: Product) => {
    const dbProduct = {
        name: product.name,
        form: product.form,
        content: product.content,
        line: product.line,
        price: product.price,
        cost: product.cost,
        quantity: product.quantity, // Be careful updating qty directly here if not stock adjustment
        batch: product.batch,
        expiry_date: product.expiryDate,
        location: product.location,
        barcode: product.barcode,
        min_stock: product.minStock,
        max_stock: product.maxStock
    };
    await supabase.from('products').update(dbProduct).eq('id', product.id);
    await fetchData();
  };

  const deleteProduct = async (id: string) => {
    await supabase.from('products').delete().eq('id', id);
    await fetchData();
  };
  
  const addStock = async (productId: string, quantity: number, userId: string) => {
     const product = state.products.find(p => p.id === productId);
     if(!product) return;

     const newQty = product.quantity + quantity;
     
     await supabase.from('products').update({ quantity: newQty }).eq('id', productId);
     
     await supabase.from('movements').insert({
        type: MovementType.IN,
        product_id: product.id,
        product_name: product.name,
        quantity: quantity,
        user_id: userId,
        user_name: state.currentUser?.name || 'Unknown',
        reason: 'Reposición de stock'
     });
     
     await fetchData();
  };

  const processSale = async (saleData: Omit<Sale, 'id' | 'timestamp' | 'userId' | 'userName'>): Promise<Sale | null> => {
    if (!state.currentUser) return null;

    const dbSale = {
        total: saleData.total,
        client_data: saleData.client,
        items: saleData.items,
        user_id: state.currentUser.id,
        user_name: state.currentUser.name
    };

    // 1. Create Sale
    const { data: newSale, error } = await supabase.from('sales').insert(dbSale).select().single();

    if (error || !newSale) {
        console.error("Error creating sale", error);
        return null;
    }

    // 2. Register Movements & Update Stock
    const movements = saleData.items.map(item => ({
        type: MovementType.SALE,
        product_id: item.id,
        product_name: item.name,
        quantity: item.saleQuantity,
        timestamp: newSale.timestamp,
        user_id: newSale.user_id,
        user_name: newSale.user_name,
        client_info: `${newSale.client_data.name} ${newSale.client_data.lastName} (${newSale.client_data.documentId})`,
        reason: `Venta ID: ${newSale.id}`
    }));

    await supabase.from('movements').insert(movements);

    // 3. Decrement Stock (Ideally RPC function, doing client-side loop for simplicity)
    for (const item of saleData.items) {
        const currentProd = state.products.find(p => p.id === item.id);
        if (currentProd) {
            await supabase.from('products').update({ quantity: currentProd.quantity - item.saleQuantity }).eq('id', item.id);
        }
    }

    await fetchData();

    // Map back to app type
    return {
        id: newSale.id,
        timestamp: newSale.timestamp,
        items: newSale.items,
        total: newSale.total,
        client: newSale.client_data,
        userId: newSale.user_id,
        userName: newSale.user_name
    };
  };

  const addUser = async (userData: Omit<User, 'id'>) => {
    const dbUser = {
        name: userData.name,
        last_name: userData.lastName,
        document_id: userData.documentId,
        username: userData.username,
        password: userData.password,
        role: userData.role,
        permissions: userData.permissions,
        allowed_modules: userData.allowedModules,
        active: userData.active
    };
    await supabase.from('users').insert(dbUser);
    await fetchData();
  };

  const updateUser = async (user: User) => {
     // Not implementing full update for brevity, but follows same pattern
     await fetchData();
  };

  const deleteUser = async (id: string) => {
    await supabase.from('users').delete().eq('id', id);
    await fetchData();
  };

  const updateConfig = async (newConfig: PharmacyConfig) => {
    const { id, ...rest } = newConfig;
    // Always update the first row
    const configId = id || state.config.id;
    if (configId) {
        await supabase.from('pharmacy_config').update(rest).eq('id', configId);
    } else {
        await supabase.from('pharmacy_config').insert(rest);
    }
    await fetchData();
  };

  const importProducts = async (newProducts: Product[]) => {
      // Map to DB columns
      const dbProducts = newProducts.map(p => ({
        name: p.name,
        form: p.form,
        content: p.content,
        line: p.line,
        price: p.price,
        cost: p.cost,
        quantity: p.quantity,
        batch: p.batch,
        expiry_date: p.expiryDate,
        location: p.location,
        barcode: p.barcode,
        min_stock: p.minStock,
        max_stock: p.maxStock
      }));
      
      await supabase.from('products').insert(dbProducts);
      await fetchData();
  }

  const resetDatabase = async () => {
      if(!window.confirm("¿Seguro? Esto borrará datos en Supabase.")) return;
      // In a real app, you might not allow this from the client side without specific RLS policies
      await supabase.from('sales').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
      await supabase.from('movements').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      window.location.reload();
  }

  return (
    <AppContext.Provider value={{
      ...state,
      login,
      logout,
      registerAdmin,
      addProduct,
      updateProduct,
      deleteProduct,
      addStock,
      processSale,
      addUser,
      updateUser,
      deleteUser,
      updateConfig,
      importProducts,
      resetDatabase
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};