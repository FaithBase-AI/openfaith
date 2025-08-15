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
import { Array, HashSet, Option, pipe, String } from 'effect'
import type { FC, ReactNode } from 'react'

const NON_LINKABLE_SEGMENTS = HashSet.fromIterable(['settings'])

const renderBreadcrumb = (segment: string): Option.Option<ReactNode> => {
  if (segment === '_app') {
    return Option.none()
  }

  if (pipe(segment, String.startsWith('$'))) {
    const paramName = pipe(segment, String.slice(1))
    return Option.some(formatLabel(paramName))
  }

  return Option.some(formatLabel(segment))
}

const buildBreadcrumbPath = (segments: ReadonlyArray<string>, index: number): string => {
  return pipe(
    segments,
    Array.take(index + 1),
    Array.join('/'),
    (path) => `/${path}`,
    String.replace('//', '/'),
  )
}

interface BreadcrumbData {
  segment: string
  content: ReactNode
  path: string
  index: number
  isFirst: boolean
  isLast: boolean
  shouldBeLink: boolean
}

const createBreadcrumbData = (
  segment: string,
  index: number,
  pathSegments: ReadonlyArray<string>,
  validIndex: number,
): Option.Option<BreadcrumbData> => {
  return pipe(
    renderBreadcrumb(segment),
    Option.map((content) => ({
      content,
      index,
      isFirst: validIndex === 0,
      isLast: index === pathSegments.length - 1,
      path: buildBreadcrumbPath(pathSegments, index),
      segment,
      shouldBeLink:
        index !== pathSegments.length - 1 && !pipe(NON_LINKABLE_SEGMENTS, HashSet.has(segment)),
    })),
  )
}

const renderBreadcrumbItem = (data: BreadcrumbData): ReactNode => {
  if (data.shouldBeLink) {
    return (
      <BreadcrumbItem key={`${data.segment}-${data.index}`}>
        <BreadcrumbLink asChild>
          <Link className='hidden md:block' to={data.path}>
            {data.content}
          </Link>
        </BreadcrumbLink>
      </BreadcrumbItem>
    )
  }

  return (
    <BreadcrumbItem key={`${data.segment}-${data.index}`}>
      <BreadcrumbPage className='line-clamp-1 max-w-64'>{data.content}</BreadcrumbPage>
    </BreadcrumbItem>
  )
}

const renderBreadcrumbWithSeparator = (data: BreadcrumbData): ReadonlyArray<ReactNode> => {
  const separator = data.isFirst
    ? []
    : [
        <BreadcrumbSeparator
          className='hidden md:block'
          key={`${data.segment}-${data.index}-separator`}
        />,
      ]

  const item = renderBreadcrumbItem(data)

  return pipe(separator, Array.append(item))
}

export const AutoBreadcrumbs: FC = () => {
  const matches = useRouterState({ select: (s) => s.matches })

  const pathSegments = pipe(
    matches,
    Array.map((match) => match.pathname),
    Array.filter((path) => path !== '/'),
    Array.flatMap((path) =>
      pipe(
        path,
        String.split('/'),
        Array.filter((segment) => segment !== ''),
      ),
    ),
    Array.dedupe,
  )

  if (pipe(pathSegments, Array.length) === 0) {
    return null
  }

  // Create breadcrumb data with valid indices (accounting for filtered items)
  const breadcrumbDataArray = pipe(
    pathSegments,
    Array.map((segment, index) => ({ index, segment })),
    Array.filterMap(({ segment, index }) =>
      pipe(
        renderBreadcrumb(segment),
        Option.map(() => ({ originalIndex: index, segment })),
      ),
    ),
    Array.map(({ segment, originalIndex }, validIndex) =>
      createBreadcrumbData(segment, originalIndex, pathSegments, validIndex),
    ),
    Array.getSomes,
  )

  const breadcrumbItems = pipe(breadcrumbDataArray, Array.flatMap(renderBreadcrumbWithSeparator))

  return (
    <Breadcrumb>
      <BreadcrumbList className='flex-nowrap'>{breadcrumbItems}</BreadcrumbList>
    </Breadcrumb>
  )
}
