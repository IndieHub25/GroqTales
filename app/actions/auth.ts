import { createClient } from '@/lib/supabase/client'

export async function loginWithUsernameOrEmail(identifier: string, password: string) {
    const supabase = createClient();
    let loginEmail = identifier;
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

    try {
        // Determine the email if a username is provided
        if (!isEmail) {
            const { data, error: lookupError } = await supabase
                .from('profiles')
                .select('email')
                .eq('username', identifier)
                .single();

            if (lookupError || !data?.email) {
                // Return a generic error to prevent username/email enumeration
                return { error: 'Invalid login credentials.' };
            }
            loginEmail = data.email;
        }

        // Perform the sign in securely
        const { error } = await supabase.auth.signInWithPassword({
            email: loginEmail,
            password,
        });

        if (error) {
            return { error: 'Invalid login credentials.' };
        }

        return { success: true };
    } catch (err) {
        return { error: 'An unexpected error occurred during login.' };
    }
}
