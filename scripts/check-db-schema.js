/**
 * Database Schema Diagnostic Script
 * Run this to verify your Supabase setup is correct
 *
 * Usage: node scripts/check-db-schema.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('\n🔍 Focus Assessments - Database Schema Diagnostic\n')
console.log('='.repeat(60))

// Check 1: Environment Variables
console.log('\n✓ Checking Environment Variables...')
if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL is not set!')
  process.exit(1)
}
if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is not set!')
  process.exit(1)
}
console.log(`  ✓ NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl}`)
console.log(`  ✓ SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey.substring(0, 20)}...`)

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkSchema() {
  console.log('\n✓ Checking Database Connection...')

  // Check 2: Connection
  const { data: testData, error: testError } = await supabase
    .from('course_types')
    .select('count')
    .limit(1)

  if (testError) {
    console.error('❌ Cannot connect to database!')
    console.error('Error:', testError.message)
    process.exit(1)
  }
  console.log('  ✓ Database connection successful')

  // Check 3: Organizations Table
  console.log('\n✓ Checking Organizations Table Schema...')
  const { data: orgData, error: orgError } = await supabase
    .from('organizations')
    .select('*')
    .limit(1)

  if (orgError) {
    if (orgError.message.includes('does not exist')) {
      console.error('❌ Organizations table does not exist!')
      console.error('   → Run migration 005_organizations_multi_user.sql')
    } else {
      console.error('❌ Error accessing organizations table:')
      console.error('   ', orgError.message)
    }
    process.exit(1)
  }

  // Check expected columns
  const expectedColumns = [
    'id', 'name', 'email', 'phone', 'address',
    'trial_end_date', 'plan', 'seats', 'onboarding_completed',
    'timezone', 'created_at', 'updated_at'
  ]

  const sampleOrg = orgData && orgData.length > 0 ? orgData[0] : null
  const actualColumns = sampleOrg ? Object.keys(sampleOrg) : []

  console.log(`  ✓ Organizations table exists`)
  console.log(`  ✓ Found ${actualColumns.length} columns`)

  const missingColumns = expectedColumns.filter(col => !actualColumns.includes(col))
  if (missingColumns.length > 0) {
    console.warn(`  ⚠️  Missing columns: ${missingColumns.join(', ')}`)
    console.warn(`     → Check migrations 012 and 013 are applied`)
  } else {
    console.log(`  ✓ All expected columns present`)
  }

  // Check 4: Course Types (seed data)
  console.log('\n✓ Checking Seed Data...')
  const { data: courseTypes, error: courseError } = await supabase
    .from('course_types')
    .select('code, name')

  if (courseError) {
    console.error('❌ Error accessing course_types:')
    console.error('   ', courseError.message)
  } else {
    console.log(`  ✓ Found ${courseTypes.length} course types:`)
    courseTypes.forEach(ct => {
      console.log(`     - ${ct.code}: ${ct.name}`)
    })

    if (courseTypes.length !== 3) {
      console.warn(`  ⚠️  Expected 3 course types (FAW, EFAW, PFA)`)
      console.warn(`     → Run migration 002_seed_data.sql`)
    }
  }

  // Check 5: Papers (seed data)
  const { data: papers, error: papersError } = await supabase
    .from('papers')
    .select('id')

  if (!papersError) {
    console.log(`  ✓ Found ${papers.length} papers`)
    if (papers.length !== 6) {
      console.warn(`  ⚠️  Expected 6 papers (2 per course type)`)
      console.warn(`     → Run migration 002_seed_data.sql`)
    }
  }

  // Check 6: Test Organization Creation
  console.log('\n✓ Testing Organization Creation...')
  const testOrgName = `Test Org ${Date.now()}`

  const { data: newOrg, error: createError } = await supabase
    .from('organizations')
    .insert({
      name: testOrgName,
      email: 'test@example.com',
      phone: '+44 1234 567890',
      address: 'Test Address',
      trial_end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      plan: 'trial',
      seats: 1,
      onboarding_completed: false,
    })
    .select()
    .single()

  if (createError) {
    console.error('❌ FAILED to create test organization!')
    console.error('   Error:', createError.message)
    console.error('   Code:', createError.code)
    console.error('   Details:', createError.details)

    if (createError.message.includes('column')) {
      console.error('\n   → Missing database column')
      console.error('   → Make sure all migrations are applied (001-013)')
    }
  } else {
    console.log(`  ✓ Successfully created test organization: "${testOrgName}"`)
    console.log(`     ID: ${newOrg.id}`)

    // Clean up test org
    await supabase
      .from('organizations')
      .delete()
      .eq('id', newOrg.id)

    console.log(`  ✓ Cleaned up test organization`)
  }

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('\n📋 Diagnostic Summary:\n')

  if (missingColumns.length > 0 || courseTypes.length !== 3 || createError) {
    console.log('❌ Issues Found - Action Required:\n')
    if (missingColumns.length > 0) {
      console.log('   1. Apply migrations 012 and 013 in Supabase SQL Editor')
    }
    if (courseTypes.length !== 3) {
      console.log('   2. Apply migration 002_seed_data.sql (fixed version)')
    }
    if (createError) {
      console.log('   3. Check error details above and verify all migrations')
    }
    console.log('\n   4. After applying migrations, run:')
    console.log('      NOTIFY pgrst, \'reload schema\';')
    console.log('')
  } else {
    console.log('✅ All checks passed! Your database is configured correctly.\n')
  }
}

checkSchema()
  .then(() => {
    console.log('✓ Diagnostic complete\n')
    process.exit(0)
  })
  .catch(err => {
    console.error('\n❌ Diagnostic failed:', err.message)
    console.error(err)
    process.exit(1)
  })
