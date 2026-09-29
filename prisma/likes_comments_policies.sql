-- Enable Row Level Security on likes and comments tables
ALTER TABLE "likes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "comments" ENABLE ROW LEVEL SECURITY;

-- Likes Policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'likes' AND policyname = 'Likes are viewable by authenticated users'
  ) THEN
    CREATE POLICY "Likes are viewable by authenticated users" ON "likes"
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'likes' AND policyname = 'Users can insert their own like'
  ) THEN
    CREATE POLICY "Users can insert their own like" ON "likes"
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = "userId");
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'likes' AND policyname = 'Users can delete their own like'
  ) THEN
    CREATE POLICY "Users can delete their own like" ON "likes"
      FOR DELETE
      TO authenticated
      USING (auth.uid() = "userId");
  END IF;
END $$;

-- Comments Policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'comments' AND policyname = 'Comments are viewable by authenticated users'
  ) THEN
    CREATE POLICY "Comments are viewable by authenticated users" ON "comments"
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'comments' AND policyname = 'Users can insert their own comment'
  ) THEN
    CREATE POLICY "Users can insert their own comment" ON "comments"
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = "authorId");
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'comments' AND policyname = 'Comment authors or post authors can delete comments'
  ) THEN
    CREATE POLICY "Comment authors or post authors can delete comments" ON "comments"
      FOR DELETE
      TO authenticated
      USING (
        auth.uid() = "authorId" OR
        EXISTS (
          SELECT 1 FROM "posts" WHERE "posts"."id" = "comments"."postId" AND "posts"."authorId" = auth.uid()
        )
      );
  END IF;
END $$;
