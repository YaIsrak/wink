import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Applying RLS and Realtime configuration to notifications table...')

  // 1. Enable RLS
  await prisma.$executeRawUnsafe(`ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;`)
  console.log('✓ Row Level Security enabled on notifications')

  // 2. Read policy
  await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS "Users can view own notifications" ON "notifications";`)
  await prisma.$executeRawUnsafe(`
    CREATE POLICY "Users can view own notifications" 
    ON "notifications" 
    FOR SELECT 
    USING (auth.uid() = "recipientId");
  `)
  console.log('✓ SELECT policy applied')

  // 3. Update policy
  await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS "Users can update own notifications" ON "notifications";`)
  await prisma.$executeRawUnsafe(`
    CREATE POLICY "Users can update own notifications" 
    ON "notifications" 
    FOR UPDATE 
    USING (auth.uid() = "recipientId");
  `)
  console.log('✓ UPDATE policy applied')

  // 4. Delete policy
  await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS "Users can delete own notifications" ON "notifications";`)
  await prisma.$executeRawUnsafe(`
    CREATE POLICY "Users can delete own notifications" 
    ON "notifications" 
    FOR DELETE 
    USING (auth.uid() = "recipientId");
  `)
  console.log('✓ DELETE policy applied')

  // 5. Replica identity full for complete realtime payloads
  await prisma.$executeRawUnsafe(`ALTER TABLE "notifications" REPLICA IDENTITY FULL;`)
  console.log('✓ Replica identity set to FULL')

  // 6. Add to supabase_realtime publication
  try {
    await prisma.$executeRawUnsafe(`ALTER PUBLICATION supabase_realtime ADD TABLE "notifications";`)
    console.log('✓ Added notifications to supabase_realtime publication')
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    if (message.includes('already in publication') || message.includes('duplicate')) {
      console.log('✓ notifications table already in supabase_realtime publication')
    } else {
      console.warn('Notice regarding publication:', message)
    }
  }

  console.log('All database security policies applied successfully!')
}

main()
  .catch((e) => {
    console.error('Failed to configure notifications RLS:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
