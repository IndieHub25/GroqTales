import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nipmqxecwnzwsmfrrkpl.supabase.co',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pcG1xeGVjd256d3NtZnJya3BsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwNDY2MDIsImV4cCI6MjA1NjYyMjYwMn0.pBBXvtjEHrMTFD3GGpoK0oLxHHZEigVksm7ZBYUIzJg'
    );
}

