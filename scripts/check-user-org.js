/**
 * Check if current user is linked to an organization
 * Run this to debug sitting creation failures
 *
 * Usage: node scripts/check-user-org.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('\n🔍 Checking User-Organization Link\n')
console.log('='.repeat(60))

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkUserOrg() {
  // Get all users
  console.log('\n✓ Checking users in auth.users...\n')

  const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()

  if (usersError) {
    console.error('❌ Error fetching users:', usersError.message)
    process.exit(1)
  }

  console.log(`Found ${users.length} user(s):`)
  users.forEach(user => {
    console.log(`  - ${user.email} (ID: ${user.id})`)
  })

  if (users.length === 0) {
    console.log('\n❌ No users found! You need to sign up first.')
    process.exit(0)
  }

  // Get all organizations
  console.log('\n✓ Checking organizations...\n')

  const { data: orgs, error: orgsError } = await supabase
    .from('organizations')
    .select('*')

  if (orgsError) {
    console.error('❌ Error fetching organizations:', orgsError.message)
    process.exit(1)
  }

  console.log(`Found ${orgs.length} organization(s):`)
  orgs.forEach(org => {
    console.log(`  - "${org.name}" (ID: ${org.id})`)
  })

  if (orgs.length === 0) {
    console.log('\n❌ No organizations found! You need to complete onboarding.')
    process.exit(0)
  }

  // Get organization_users links
  console.log('\n✓ Checking organization_users links...\n')

  const { data: orgUsers, error: orgUsersError } = await supabase
    .from('organization_users')
    .select('*, organization:organizations(name), user_id')

  if (orgUsersError) {
    console.error('❌ Error fetching organization_users:', orgUsersError.message)
    process.exit(1)
  }

  console.log(`Found ${orgUsers.length} organization-user link(s):`)
  orgUsers.forEach(link => {
    const userEmail = users.find(u => u.id === link.user_id)?.email || 'Unknown'
    console.log(`  - User: ${userEmail}`)
    console.log(`    Organization: "${link.organization.name}"`)
    console.log(`    Role: ${link.role}`)
    console.log('')
  })

  // Analysis
  console.log('='.repeat(60))
  console.log('\n📋 Analysis:\n')

  if (users.length > 0 && orgs.length > 0 && orgUsers.length === 0) {
    console.log('❌ PROBLEM FOUND: User exists, Organization exists, but NO LINK!')
    console.log('')
    console.log('This means createOrganization() did NOT link the user to the org.')
    console.log('')
    console.log('Fix: Add this user to organization_users table')
    console.log('')
    console.log('Run this SQL in Supabase SQL Editor:')
    console.log('')
    console.log('INSERT INTO organization_users (user_id, organization_id, role)')
    console.log(`VALUES ('${users[0].id}', '${orgs[0].id}', 'owner');`)
    console.log('')
  } else if (orgUsers.length > 0) {
    console.log('✅ Everything looks good!')
    console.log('')
    console.log('User is properly linked to organization.')
    console.log('The sitting creation error must be something else.')
    console.log('')
    console.log('Next step: Check the terminal logs where "npm run dev" is running')
    console.log('for the exact error message.')
    console.log('')
  }

  // Get papers for debugging
  console.log('✓ Checking papers...\n')

  const { data: papers, error: papersError } = await supabase
    .from('papers')
    .select('*, course_types(code, name)')

  if (!papersError && papers) {
    console.log(`Found ${papers.length} paper(s):`)
    papers.forEach(p => {
      console.log(`  - ${p.course_types.code} - ${p.label} (ID: ${p.id})`)
    })
    console.log('')
  }
}

checkUserOrg()
  .then(() => {
    console.log('✓ User-Organization check complete\n')
    process.exit(0)
  })
  .catch(err => {
    console.error('\n❌ Check failed:', err.message)
    console.error(err)
    process.exit(1)
  })
