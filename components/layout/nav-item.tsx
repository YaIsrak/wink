'use client'

import * as React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export interface NavItemProps {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  isActive?: boolean
  badge?: number
  badgeVariant?: 'number' | 'dot'
  onClick?: () => void
  className?: string
}

export function NavItem({
  href,
  label,
  icon: Icon,
  isActive = false,
  badge,
  badgeVariant = 'number',
  onClick,
  className,
}: NavItemProps) {
  const hasBadge = typeof badge === 'number' && badge > 0

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'group relative flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150',
        isActive
          ? 'bg-muted font-semibold text-foreground shadow-xs'
          : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
        className
      )}
    >
      <div className="relative flex shrink-0 items-center justify-center">
        <Icon
          className={cn(
            'size-5 transition-transform duration-150 group-hover:scale-105',
            isActive
              ? 'text-foreground fill-current stroke-[2.2]'
              : 'text-muted-foreground group-hover:text-foreground stroke-[1.8]'
          )}
        />
        {hasBadge && badgeVariant === 'dot' && (
          <span className="absolute -top-1 -right-1 size-2 rounded-full bg-destructive ring-2 ring-background" />
        )}
      </div>

      <span className="truncate flex-1 tracking-tight">{label}</span>

      {hasBadge && badgeVariant === 'number' && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1.5 text-[11px] font-bold text-background shadow-xs">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  )
}
