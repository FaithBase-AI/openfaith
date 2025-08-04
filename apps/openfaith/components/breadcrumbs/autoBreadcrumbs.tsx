'use client'

import { formatLabel } from '@openfaith/shared'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@openfaith/ui'
import { Link, useRouterState } from '@tanstack/react-router'
import { Array, pipe } from 'effect'
import type { ReactNode } from 'react'

// Define breadcrumb renderers for specific route patterns
const renderBreadcrumb = (segment: string): ReactNode => {
  // Skip layout routes
  if (segment === '_app') {
    return null
  }

  // Handle dynamic segments (starting with $)
  if (segment.startsWith('$')) {
    const paramName = segment.slice(1)
    return formatLabel(paramName)
  }

  // For regular segments, use formatLabel to handle all cases
  return formatLabel(segment)
}

const buildBreadcrumbPath = (segments: Array<string>, index: number): string => {
  return `/${pipe(segments, Array.take(index + 1), Array.join('/'))}`.replace('//', '/')
}

export function AutoBreadcrumbs() {
  const matches = useRouterState({ select: (s) => s.matches })

  // Extract path segments from matched routes
  const pathSegments = pipe(
    matches,
    Array.map((match) => match.pathname),
    Array.filter((path) => path !== '/'), // Remove root
    Array.flatMap((path) => path.split('/').filter((segment) => segment !== '')),
    // Remove duplicates manually
    Array.reduce([] as Array<string>, (acc, segment) => {
      if (!acc.includes(segment)) {
        return [...acc, segment]
      }
      return acc
    }),
  )

  // If no meaningful segments, don't render breadcrumbs
  if (pathSegments.length === 0) {
    return null
  }

  const breadcrumbItems: Array<ReactNode> = []

  pathSegments.forEach((segment, index) => {
    const breadcrumbContent = renderBreadcrumb(segment)

    // Skip null breadcrumbs (like _app)
    if (!breadcrumbContent) {
      return
    }

    const isFirst = breadcrumbItems.length === 0
    const isLast = index === pathSegments.length - 1
    const path = buildBreadcrumbPath(pathSegments, index)

    // Add separator (except for first item)
    if (!isFirst) {
      breadcrumbItems.push(
        <BreadcrumbSeparator className={'hidden md:block'} key={`${segment}-${index}-separator`} />,
      )
    }

    // Add breadcrumb item
    if (isLast) {
      breadcrumbItems.push(
        <BreadcrumbItem key={`${segment}-${index}`}>
          <BreadcrumbPage className='line-clamp-1 max-w-64'>{breadcrumbContent}</BreadcrumbPage>
        </BreadcrumbItem>,
      )
    } else {
      breadcrumbItems.push(
        <BreadcrumbItem key={`${segment}-${index}`}>
          <BreadcrumbLink asChild>
            <Link className='hidden md:block' to={path}>
              {breadcrumbContent}
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>,
      )
    }
  })

  return (
    <Breadcrumb>
      <BreadcrumbList className='flex-nowrap'>{breadcrumbItems}</BreadcrumbList>
    </Breadcrumb>
  )
}
