# Folder Structure

```
app/
├── (auth)/
│   ├── sign-up/
│   └── login/
├── (onboarding)/
│   └── onboarding/
├── (main)/
│   ├── feed/
│   ├── explore/
│   ├── search/
│   ├── profile/[username]/
│   ├── post/[id]/
│   ├── messages/
│   │   └── [conversationId]/
│   └── notifications/
├── theme/                  # design-system preview page
├── api/
│   ├── posts/
│   ├── comments/
│   ├── likes/
│   ├── follows/
│   ├── messages/
│   ├── notifications/
│   ├── search/
│   └── cron/
│       └── keep-alive/
├── layout.tsx
└── globals.css

components/
├── ui/                     # shadcn primitives (button, input, dialog, ...)
├── post/                   # post-card, post-composer, comment-list, ...
├── profile/                # profile-header, completion-banner, ...
├── feed/                   # getting-started-checklist, feed-list, ...
├── messages/                # conversation-list, chat-window, message-bubble
├── notifications/
└── shared/                 # navbar, sidebar, theme-toggle, skeletons, ...

lib/
├── db/                     # prisma client
├── services/               # post.service.ts, comment.service.ts, ...
├── supabase/               # client.ts (browser), server.ts (server-side)
├── validation/             # zod schemas per entity
├── utils/                  # shared helpers
└── store/                  # zustand stores

actions/                    # server actions for client-invoked mutations

prisma/
└── schema.prisma
```

Naming: kebab-case for all files (see `.agents/rules/code-style.md`).
