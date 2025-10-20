// Check if migration 013 has been applied
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      process.env[key] = value;
    }
  });
}

loadEnv();

async function checkSchema() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing environment variables');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log('Checking database schema...\n');

  // Check if new columns exist
  const { data, error } = await supabase
    .from('organizations')
    .select('id, name, logo_url, brand_color, legal_name, billing_email, timezone, is_deleted')
    .limit(1);

  if (error) {
    if (error.message.includes('does not exist')) {
      console.log('❌ Migration NOT applied yet');
      console.log('\nMissing columns detected. Please run migration 013.');
      console.log('\nTo apply the migration:');
      console.log('1. Open Supabase Dashboard → SQL Editor');
      console.log('2. Copy SQL from: supabase/migrations/013_profile_enhancements.sql');
      console.log('3. Paste and execute');
    } else {
      console.error('Error checking schema:', error);
    }
    process.exit(1);
  }

  console.log('✓ Migration 013 already applied!');
  console.log('\nAll required columns exist:');
  console.log('  - logo_url');
  console.log('  - brand_color');
  console.log('  - billing_email');
  console.log('  - legal_name');
  console.log('  - timezone');
  console.log('  - is_deleted');
  console.log('  - deleted_at');
}

checkSchema();
