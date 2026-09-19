# Rule: Security

- All API input is validated with Zod before use.
- Ownership checks are mandatory on every mutation (edit/delete post,
  comment, etc.) — verify the acting user owns the resource, both in the
  service layer and via Supabase RLS.
- DMs are restricted to mutual follows — enforce this at the data/service
  layer, not just by hiding UI.
- Never expose Supabase service-role keys to the client. Client uses the
  public anon key; privileged operations happen server-side only.
- Sanitize any user-generated content rendered as HTML (captions, bios,
  comments) to prevent injection.
- Don't log sensitive data (tokens, emails in plaintext logs) beyond what's
  needed for debugging.
- Standard best practice is sufficient for this project — no custom rate
  limiting or advanced threat modeling required unless a real issue appears.
