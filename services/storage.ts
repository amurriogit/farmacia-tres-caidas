import { AppState, User, Product, Sale, Movement, PharmacyConfig, UserRole, MovementType } from '../types';

const STORAGE_KEY = 'FARMABOLIVIA_DB_V1';

const INITIAL_CONFIG: PharmacyConfig = {
  name: 'Farmacia Señor de las Tres Caídas v3.0',
  address: 'Av. Principal #123, La Paz',
  phone: '2-222222',
  email: 'contacto@trescaidas.com',
  nit: '1020304050',
  socials: '@farmaciatrescaidas'
};

const INITIAL_STATE: AppState = {
  users: [],
  products: [
    {
      id: '1',
      name: 'Amoxicilina',
      form: 'Comprimido',
      content: '500mg',
      line: 'Vita',
      price: 1.5,
      cost: 0.8,
      quantity: 100,
      batch: 'L-202301',
      expiryDate: '2025-12-31',
      location: 'Estante A1',
      barcode: '777123456789',
      minStock: 20,
      maxStock: 500
    },
    {
      id: '2',
      name: 'Paracetamol',
      form: 'Jarabe',
      content: '120mg/5ml',
      line: 'Inti',
      price: 15,
      cost: 10,
      quantity: 50,
      batch: 'L-202305',
      expiryDate: '2024-10-15',
      location: 'Estante B2',
      barcode: '777987654321',
      minStock: 10,
      maxStock: 100
    }
  ],
  sales: [],
  movements: [],
  config: INITIAL_CONFIG,
  currentUser: null,
  loading: false
};

export const loadState = (): AppState => {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) return INITIAL_STATE;
    const parsed = JSON.parse(serialized);
    return { ...INITIAL_STATE, ...parsed, currentUser: null }; // Always start logged out
  } catch (e) {
    console.error("Error loading state", e);
    return INITIAL_STATE;
  }
};

export const saveState = (state: AppState) => {
  try {
    const { currentUser, ...persistedState } = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persistedState));
  } catch (e) {
    console.error("Error saving state", e);
  }
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};