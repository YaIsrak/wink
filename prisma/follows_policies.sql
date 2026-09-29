-- Enable Row Level Security on follows table
ALTER TABLE "follows" ENABLE ROW LEVEL SECURITY;

-- Follows Policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'follows' AND policyname = 'Follows are viewable by authenticated users'
  ) THEN
    CREATE POLICY "Follows are viewable by authenticated users" ON "follows"
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'follows' AND policyname = 'Users can follow other users'
  ) THEN
    CREATE POLICY "Users can follow other users" ON "follows"
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = "followerId" AND "followerId" != "followingId");
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'follows' AND policyname = 'Users can unfollow'
  ) THEN
    CREATE POLICY "Users can unfollow" ON "follows"
      FOR DELETE
      TO authenticated
      USING (auth.uid() = "followerId");
  END IF;
END $$;
