/**
 * Check which migrations have been applied to Supabase
 * Run this to verify migration status
 *
 * Usage: node scripts/check-migrations.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('\n🔍 Checking Migration Status\n')
console.log('='.repeat(60))

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkMigrations() {
  console.log('\n✓ Checking sittings table schema...\n')

  // Check sittings table columns
  const { data: sittings, error } = await supabase
    .from('sittings')
    .select('*')
    .limit(1)

  if (error) {
    console.error('❌ Error accessing sittings table:', error.message)
    process.exit(1)
  }

  const sampleSitting = sittings && sittings.length > 0 ? sittings[0] : null
  const actualColumns = sampleSitting ? Object.keys(sampleSitting) : []

  console.log('Found columns in sittings table:')
  actualColumns.forEach(col => console.log(`  - ${col}`))

  // Expected columns
  const expectedColumns = [
    'id',
    'paper_id',
    'organization_id',      // Added in migration 005
    'assigned_trainer_id',  // Added in migration 005
    'status',
    'assessment_type',      // Added in migration 007
    'practical_assessment_id', // Added in migration 007
    'sitting_type',         // Added in migration 006
    'session_date',         // Added in migration 006
    'session_time',         // Added in migration 006
    'settings',
    'short_code',
    'token',
    'created_at'
  ]

  const missingColumns = expectedColumns.filter(col => !actualColumns.includes(col))

  console.log('')
  if (missingColumns.length > 0) {
    console.warn(`⚠️  Missing columns: ${missingColumns.join(', ')}`)
    console.warn('\nMigrations to apply:')
    if (missingColumns.includes('organization_id') || missingColumns.includes('assigned_trainer_id')) {
      console.warn('  - 005_organizations_multi_user.sql')
    }
    if (missingColumns.includes('sitting_type') || missingColumns.includes('session_date')) {
      console.warn('  - 006_add_sitting_details.sql')
    }
    if (missingColumns.includes('assessment_type') || missingColumns.includes('practical_assessment_id')) {
      console.warn('  - 007_practical_assessments.sql')
    }
  } else {
    console.log('✓ All expected columns present')
  }

  // Test status constraint (check if 'scheduled' is allowed)
  console.log('\n✓ Testing status constraint...\n')

  try {
    const testId = 'test-' + Date.now()

    // Try to insert a sitting with status 'scheduled'
    const { error: insertError } = await supabase
      .from('sittings')
      .insert({
        id: testId,
        status: 'scheduled', // This should work if migration 011 is applied
        settings: {}
      })

    if (insertError) {
      if (insertError.message.includes('violates check constraint')) {
        console.error('❌ Status "scheduled" is NOT allowed!')
        console.error('   → Migration 011 (enrolments_table.sql) is NOT applied')
        console.error('   → Current allowed statuses: ready, in_progress, closed')
        console.error('   → Need to apply migration 011 to allow "scheduled" status')
      } else if (insertError.message.includes('not-null constraint') || insertError.message.includes('null value')) {
        console.log('✓ Status "scheduled" is allowed (migration 011 applied)')
        console.log('   (Insert failed due to missing required fields, which is expected)')
      } else {
        console.log('⚠️  Unexpected error:', insertError.message)
      }
    } else {
      console.log('✓ Status "scheduled" is allowed (migration 011 applied)')

      // Clean up test record
      await supabase.from('sittings').delete().eq('id', testId)
    }
  } catch (err) {
    console.error('❌ Error testing status constraint:', err.message)
  }

  console.log('\n' + '='.repeat(60))
  console.log('\n📋 Summary:\n')
  console.log('If you see missing columns or status errors above, you need to:')
  console.log('1. Go to Supabase Dashboard → SQL Editor')
  console.log('2. Apply the missing migrations in order (005, 006, 007, 011)')
  console.log('3. Run: NOTIFY pgrst, \'reload schema\';')
  console.log('4. Restart your dev server')
  console.log('')
}

checkMigrations()
  .then(() => {
    console.log('✓ Migration check complete\n')
    process.exit(0)
  })
  .catch(err => {
    console.error('\n❌ Migration check failed:', err.message)
    console.error(err)
    process.exit(1)
  })
