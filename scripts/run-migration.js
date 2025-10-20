// Script to run a migration file against the Supabase database
const fs = require('fs');
const path = require('path');

async function runMigration() {
  // Import Supabase client
  const { createClient } = require('@supabase/supabase-js');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing environment variables. Please check .env.local');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // Read migration file
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '013_profile_enhancements.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  console.log('Running migration 013_profile_enhancements.sql...\n');

  try {
    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.error('Migration failed:', error);
      process.exit(1);
    }

    console.log('✓ Migration completed successfully!');
    console.log('\nNew columns added to organizations:');
    console.log('  - logo_url');
    console.log('  - brand_color');
    console.log('  - billing_email');
    console.log('  - legal_name');
    console.log('  - timezone');
    console.log('  - is_deleted');
    console.log('  - deleted_at');
    console.log('\nNew table created:');
    console.log('  - organization_events (audit log)');
    console.log('\nStorage bucket created:');
    console.log('  - organization-logos');

  } catch (err) {
    console.error('Error running migration:', err.message);
    process.exit(1);
  }
}

runMigration();
