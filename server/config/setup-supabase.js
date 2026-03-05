/**
 * Script to create Supabase tables for GroqTales
 * Run: node server/config/setup-supabase.js
 */
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function setup() {
    console.log('Setting up Supabase tables...');
    console.log(`URL: ${SUPABASE_URL}`);

    // Test connection
    const { data, error } = await supabase.from('profiles').select('id').limit(1);

    if (error && error.code === '42P01') {
        console.log('Tables do not exist yet. Please run the SQL in server/config/supabase-schema.sql');
        console.log('Go to: ' + SUPABASE_URL.replace('.supabase.co', '.supabase.co') + ' → SQL Editor');
        console.log('Copy and paste the contents of server/config/supabase-schema.sql');
    } else if (error) {
        console.log('Connection error:', error.message);
    } else {
        console.log('✅ Tables already exist! Connection successful.');
        console.log(`Found ${data.length} profile(s)`);
    }
}

setup().catch(console.error);
