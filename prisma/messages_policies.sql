-- Enable Row Level Security on conversations and messages
ALTER TABLE "conversations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "messages" ENABLE ROW LEVEL SECURITY;

-- Conversations SELECT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'conversations' AND policyname = 'Participants can view conversations'
  ) THEN
    CREATE POLICY "Participants can view conversations" ON "conversations"
      FOR SELECT
      TO authenticated
      USING (auth.uid() = "user_a_id" OR auth.uid() = "user_b_id");
  END IF;
END $$;

-- Conversations INSERT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'conversations' AND policyname = 'Users can create conversations'
  ) THEN
    CREATE POLICY "Users can create conversations" ON "conversations"
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = "initiator_id" AND (auth.uid() = "user_a_id" OR auth.uid() = "user_b_id"));
  END IF;
END $$;

-- Conversations UPDATE
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'conversations' AND policyname = 'Participants can update conversations'
  ) THEN
    CREATE POLICY "Participants can update conversations" ON "conversations"
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = "user_a_id" OR auth.uid() = "user_b_id")
      WITH CHECK (auth.uid() = "user_a_id" OR auth.uid() = "user_b_id");
  END IF;
END $$;

-- Messages SELECT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Participants can view messages'
  ) THEN
    CREATE POLICY "Participants can view messages" ON "messages"
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM "conversations" c
          WHERE c.id = "conversation_id" AND (c."user_a_id" = auth.uid() OR c."user_b_id" = auth.uid())
        )
      );
  END IF;
END $$;

-- Messages INSERT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Participants can insert messages'
  ) THEN
    CREATE POLICY "Participants can insert messages" ON "messages"
      FOR INSERT
      TO authenticated
      WITH CHECK (
        auth.uid() = "sender_id" AND
        EXISTS (
          SELECT 1 FROM "conversations" c
          WHERE c.id = "conversation_id" AND (c."user_a_id" = auth.uid() OR c."user_b_id" = auth.uid())
        )
      );
  END IF;
END $$;

-- Messages UPDATE
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Participants can update messages'
  ) THEN
    CREATE POLICY "Participants can update messages" ON "messages"
      FOR UPDATE
      TO authenticated
      USING (
        auth.uid() = "sender_id" OR
        EXISTS (
          SELECT 1 FROM "conversations" c
          WHERE c.id = "conversation_id" AND (c."user_a_id" = auth.uid() OR c."user_b_id" = auth.uid())
        )
      )
      WITH CHECK (
        auth.uid() = "sender_id" OR
        EXISTS (
          SELECT 1 FROM "conversations" c
          WHERE c.id = "conversation_id" AND (c."user_a_id" = auth.uid() OR c."user_b_id" = auth.uid())
        )
      );
  END IF;
END $$;

-- Realtime publication
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE "conversations";
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE "messages";
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
