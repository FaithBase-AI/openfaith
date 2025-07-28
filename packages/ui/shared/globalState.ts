import type { CollectionTags } from '@openfaith/ui/components/collections/collectionComponents'
import { Match, pipe } from 'effect'
import { atomWithStorage } from 'jotai/utils'

export enum FilterKeys {
  User = 'user-filters',
  Org = 'org-filters',
  Channel = 'channel-filters',
  Prompt = 'prompt-filters',
  Tag = 'tag-filters',
  Default = 'default-filters',
}

export type CollectionView = 'table' | 'cards'

const getDefaultCollectionView = (): CollectionView => 'table'

const defaultViewAtom = atomWithStorage<CollectionView>('defaultView', getDefaultCollectionView())

const usersCollectionViewAtom = atomWithStorage<CollectionView>(
  'usersCollectionView',
  getDefaultCollectionView(),
)

const orgsCollectionViewAtom = atomWithStorage<CollectionView>(
  'orgsCollectionView',
  getDefaultCollectionView(),
)

const channelsCollectionViewAtom = atomWithStorage<CollectionView>(
  'channelsCollectionView',
  'cards',
)

const promptsCollectionViewAtom = atomWithStorage<CollectionView>(
  'promptsCollectionView',
  getDefaultCollectionView(),
)

const tagsCollectionViewAtom = atomWithStorage<CollectionView>(
  'tagsCollectionView',
  getDefaultCollectionView(),
)

export const collectionViewAtomMap: Record<CollectionTags, typeof defaultViewAtom> = {
  channels: channelsCollectionViewAtom,
  default: defaultViewAtom,
  orgs: orgsCollectionViewAtom,
  prompts: promptsCollectionViewAtom,
  tags: tagsCollectionViewAtom,
  users: usersCollectionViewAtom,
}

export const collectionViewMatch = <T>(match: { table: () => T; cards: () => T }) =>
  pipe(
    Match.type<CollectionView>(),
    Match.when('table', match.table),
    Match.when('cards', match.cards),
    Match.exhaustive,
  )

// Screen size atoms for media queries
export const isSmScreenAtom = atomWithStorage<boolean>('isSmScreen', false)
export const isMdScreenAtom = atomWithStorage<boolean>('isMdScreen', false)
export const isLgScreenAtom = atomWithStorage<boolean>('isLgScreen', false)
export const isXlScreenAtom = atomWithStorage<boolean>('isXlScreen', false)
