/**
 * Auth actions — Backend API (BFF pattern)
 * Routes authentication through the backend API instead of calling Supabase directly.
 */

export async function loginWithUsernameOrEmail(
    identifier: string,
    password: string
) {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
        const res = await fetch(`${baseUrl}/api/v1/auth/login-username`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier, password }),
        });

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            return { error: data.error || 'Invalid login credentials.' };
        }

        const data = await res.json();

        return { success: true, data: data.data };
    } catch (err) {
        return { error: 'An unexpected error occurred during login.' };
    }
}
