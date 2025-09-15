// Utility untuk membuat admin user secara programmatic
// Jalankan dengan: npx tsx src/utils/create-admin.ts

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role key, bukan anon key

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createAdminUser() {
  try {
    console.log('Creating admin user...')
    
    // 1. Buat user di auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@tpqnurislam.com',
      password: 'admin123!@#',
      email_confirm: true // Auto confirm
    })

    if (authError) {
      throw authError
    }

    console.log('Auth user created:', authData.user?.id)

    // 2. Tambahkan ke admin_users (trigger seharusnya otomatis, tapi kita pastikan)
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .upsert({ user_id: authData.user!.id })
      .select()

    if (adminError) {
      console.log('Admin insert error (might be ok if trigger worked):', adminError)
    } else {
      console.log('Admin user inserted:', adminData)
    }

    // 3. Verifikasi
    const { data: verifyData, error: verifyError } = await supabase
      .from('admin_users')
      .select('*, user:user_id(*)')
      .eq('user_id', authData.user!.id)
      .single()

    if (verifyError) {
      throw verifyError
    }

    console.log('✅ Admin user created successfully!')
    console.log('Email:', 'admin@tpqnurislam.com')
    console.log('Password:', 'admin123!@#')
    console.log('User ID:', authData.user!.id)
    console.log('Admin record:', verifyData)

  } catch (error) {
    console.error('❌ Error creating admin user:', error)
  }
}

// Jalankan jika file ini dijalankan langsung
if (require.main === module) {
  createAdminUser()
}

export { createAdminUser }
