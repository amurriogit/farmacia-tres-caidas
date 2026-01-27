import { createClient } from '@supabase/supabase-js';

// Las claves se cargan desde el archivo .env para seguridad
// Git ignorará el archivo .env, por lo que tus claves no se subirán a GitHub.
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Faltan las variables de entorno de Supabase. Asegúrate de tener el archivo .env configurado.");
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '');