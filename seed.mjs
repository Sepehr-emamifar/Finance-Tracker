import { createClient } from '@supabase/supabase-js'
import { faker } from '@faker-js/faker'
import 'dotenv/config'

const supabase = createClient(
  process.env.SUPABASE_URL,
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0bmR2Z3ZqcW1ya2liZXlvcnp4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDAyMTE0OCwiZXhwIjoyMDc1NTk3MTQ4fQ.AU17LwJ5eIVgCO287UwuC9RID23-6GV3nM7pO4-hBSQ', {
  auth: { persistSession: false }
})
const categories = ['Food', 'Housing', 'Car', 'Entertainment']

const { data: { users }, error } = await supabase.auth.admin.listUsers()
const userIds = users.map(user => user.id)

async function seedTransactions() {
  // Delete existing data
  const { error: deleteError } = await supabase.from('transactions')
    .delete().gte('id', 0)

  if (deleteError) {
    console.error('Error deleting existing data:', deleteError)
    return
  }

  let transactions = []

  for (const user of userIds) {
    for (let year = new Date().getFullYear(); year > new Date().getFullYear() - 2; year--) {
      for (let i = 0; i < 10; i++) {
        const date = new Date(
          year,
          faker.number.int({ min: 0, max: 11 }),
          faker.number.int({ min: 1, max: 28 })
        )

        let type, categories
        const typeBias = Math.random()

        if (typeBias < 0.85) {
          type = 'expense'
          categories = faker.helpers.arrayElement(categories) // Category only for 'Expense'
        } else if (typeBias < 0.95) {
          type = 'income'
        } else {
          type = faker.helpers.arrayElement(['saving', 'investment'])
        }

        let amount
        switch (type) {
          case 'income':
            amount = faker.number.int({ min: 2000, max: 5000 })
            break
          case 'expense':
            amount = faker.number.int({ min: 100, max: 1000 })
            break
          case 'saving':
          case 'investment':
            amount = faker.number.int({ min: 5000, max: 10000 })
            break
          default:
            amount = 0
        }

        transactions.push({
          created_at: date,
          amount,
          type,
          description: faker.lorem.sentence(),
          categories: type === 'expense' ? categories : null, // Category only for 'Expense'
          user_id: user
        })
      }
    }
  }

  const { error: insertError } = await supabase.from('transactions')
    .upsert(transactions)

  if (insertError) {
    console.error('Error inserting data:', insertError)
  } else {
    console.log('Data inserted successfully.')
  }
}

seedTransactions().catch(console.error)