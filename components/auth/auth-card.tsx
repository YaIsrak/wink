import * as React from 'react'
import Link from 'next/link'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'

export interface AuthCardProps {
  title: string
  description: string
  footerPrompt: string
  footerLinkText: string
  footerHref: string
  children: React.ReactNode
}

export function AuthCard({
  title,
  description,
  footerPrompt,
  footerLinkText,
  footerHref,
  children,
}: AuthCardProps) {
  return (
    <Card className="w-full max-w-[420px] shadow-sm">
      <CardHeader className="space-y-1.5 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">
          {title}
        </CardTitle>
        <CardDescription className="text-sm">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        {children}
      </CardContent>
      <CardFooter className="justify-center text-center text-sm text-zinc-500 dark:text-zinc-400">
        <span>{footerPrompt}</span>{' '}
        <Link
          href={footerHref}
          className="ml-1 font-semibold text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-100"
        >
          {footerLinkText}
        </Link>
      </CardFooter>
    </Card>
  )
}
