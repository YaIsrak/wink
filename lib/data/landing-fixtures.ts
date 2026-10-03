export interface MockComment {
  id: string
  author: string
  handle: string
  avatarColor: string
  text: string
  timeAgo: string
}

export interface MockPost {
  id: string
  author: {
    name: string
    handle: string
    badgeText: string
    avatarGradient: string
  }
  timeAgo: string
  caption: string
  initialLikes: number
  comments: MockComment[]
}

export interface BentoFeature {
  id: string
  title: string
  badge: string
  punchline: string
  description: string
  visualType: 'dms' | 'algorithm' | 'realtime' | 'aesthetics'
}

export const HERO_CYCLING_PHRASES: string[] = [
  'brain rot',
  'corporate cringe',
  'endless doomscrolling',
  'fake influencers',
]

export const MOCK_POST_FIXTURE: MockPost = {
  id: 'post-hero-1',
  author: {
    name: 'Mira Vance',
    handle: '@miravance',
    badgeText: 'Night Owl',
    avatarGradient: 'from-amber-400 via-rose-500 to-fuchsia-600',
  },
  timeAgo: '4m ago',
  caption:
    'Took a blurry picture of my espresso at 7am because genuine messy vibes > sterile studio perfection. Who is up?',
  initialLikes: 89,
  comments: [
    {
      id: 'c-1',
      author: 'Leo Chen',
      handle: '@leo_k',
      avatarColor: 'from-emerald-400 to-cyan-500',
      text: 'This is the chaotic energy I logged on for 🔥',
      timeAgo: '2m',
    },
    {
      id: 'c-2',
      author: 'Sora',
      handle: '@sora_wave',
      avatarColor: 'from-violet-500 to-purple-600',
      text: 'Finally a feed without sponsored mattress ads and motivational hustle gurus.',
      timeAgo: '1m',
    },
  ],
}

export const BENTO_FEATURES: BentoFeature[] = [
  {
    id: 'mutuals-dms',
    title: 'Mutuals only direct messages',
    badge: 'Zero Creep Tolerance',
    punchline: 'Only people you follow back can ring your inbox.',
    description:
      'No unsolicited pitch decks, no sketchy crypto links, and zero random strangers sliding into your requests. If you both follow each other, you can talk. If not, the door is closed.',
    visualType: 'dms',
  },
  {
    id: 'zero-sludge',
    title: 'Zero algorithmic sludge',
    badge: 'Pure Human Signal',
    punchline: 'Chronological feeds curated by real people, not angry math.',
    description:
      'We do not optimize for rage engagement or hijack your dopamine to sell athletic socks. You see what your friends share, when they share it.',
    visualType: 'algorithm',
  },
  {
    id: 'live-wire',
    title: 'Snappy realtime reactivity',
    badge: 'Live Wire',
    punchline: 'Instant reactions with zero sluggish loading spinners.',
    description:
      'Optimistic state updates everywhere. Hearts pop the millisecond you click, live presence dots show who is lingering, and messages stream without refresh.',
    visualType: 'realtime',
  },
  {
    id: 'neon-dark',
    title: 'High contrast electric aesthetics',
    badge: 'OLED Black & Neon',
    punchline: 'Handmade minimalism designed for night owls.',
    description:
      'Deep black surfaces (#000000) illuminated by razor sharp electric lime (#c9f997) and hot magenta (#e92ed3). Handcrafted for eyes that appreciate deliberate craft.',
    visualType: 'aesthetics',
  },
]

export const PLATFORM_STATS = [
  { value: '100%', label: 'Human crafted copy', note: 'Zero corporate talk' },
  { value: '0', label: 'Surveillance trackers', note: 'Zero algorithmic traps' },
  { value: '2', label: 'Way mutual consent', note: 'DMs require mutual follows' },
  { value: '< 50ms', label: 'Optimistic feedback', note: 'Instant UI response' },
]
