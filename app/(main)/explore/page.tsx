import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Explore',
  description: 'Discover trending posts and creators on Wink.',
}

export default function ExplorePage() {
  redirect('/feed')
}
