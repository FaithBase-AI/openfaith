import { HashMap, Match, Option, pipe } from 'effect'
import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

export type CollectionView = 'table' | 'cards'

const getDefaultCollectionView = (): CollectionView => 'table'

// Single atom containing a HashMap of collection views
export const collectionViewsAtom = atom<HashMap.HashMap<string, CollectionView>>(
  HashMap.fromIterable([
    ['default', getDefaultCollectionView()],
    ['channels', 'cards' as CollectionView],
  ]),
)

// Helper functions for working with collection views
export const getCollectionView = (
  collectionViews: HashMap.HashMap<string, CollectionView>,
  key: string,
): CollectionView =>
  pipe(
    collectionViews,
    HashMap.get(key),
    Option.getOrElse(() => getDefaultCollectionView()),
  )

export const setCollectionView = (
  collectionViews: HashMap.HashMap<string, CollectionView>,
  key: string,
  view: CollectionView,
): HashMap.HashMap<string, CollectionView> => pipe(collectionViews, HashMap.set(key, view))

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

// Details pane state atoms
export const detailsPaneStickyAtom = atom(false)
