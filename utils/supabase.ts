import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Replace these with your own Supabase project values
const supabaseUrl = 'https://taxrknrmdwoovhyouwmv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRheHJrbnJtZHdvb3ZoeW91d212Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MDMwNTIsImV4cCI6MjA4NTE3OTA1Mn0.3EM_CTytOttoq2YJ9Tp8-_vjEcd2owaYMUZdpkR6R3I';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
