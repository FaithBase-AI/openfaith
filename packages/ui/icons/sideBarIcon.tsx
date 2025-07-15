import { cva } from 'class-variance-authority'
import { Boolean, pipe } from 'effect'
import type { HTMLAttributes } from 'react'
import { forwardRef } from 'react'

const sidebarLineVariants = cva('', {
  compoundVariants: [
    {
      className: 'translate-x-[-6px] group-hover:translate-x-0',
      isOpen: false,
      position: 'left',
    },
    {
      className: 'translate-x-0 group-hover:translate-x-[-6px]',
      isOpen: true,
      position: 'left',
    },
    {
      className: 'translate-x-[6px] group-hover:translate-x-0',
      isOpen: false,
      position: 'right',
    },
    {
      className: 'translate-x-0 group-hover:translate-x-[6px]',
      isOpen: true,
      position: 'right',
    },
  ],
  defaultVariants: {
    isOpen: false,
    position: 'left',
  },
  variants: {
    isOpen: {
      false: 'scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100',
      true: 'scale-100 opacity-100 group-hover:scale-90 group-hover:opacity-0',
    },
    position: {
      left: '',
      right: '',
    },
  },
})

const sidebarItemVariants = cva('', {
  compoundVariants: [
    {
      className: 'translate-x-[-4px] group-hover:translate-x-0',
      isOpen: false,
      position: 'left',
    },
    {
      className: 'translate-x-0 group-hover:translate-x-[-4px]',
      isOpen: true,
      position: 'left',
    },
    {
      className: 'translate-x-[4px] group-hover:translate-x-0',
      isOpen: false,
      position: 'right',
    },
    {
      className: 'translate-x-0 group-hover:translate-x-[4px]',
      isOpen: true,
      position: 'right',
    },
  ],
  defaultVariants: {
    isOpen: false,
    position: 'left',
  },
  variants: {
    isOpen: {
      false: 'opacity-0 group-hover:opacity-100',
      true: 'opacity-100 group-hover:opacity-0',
    },
    position: {
      left: '',
      right: '',
    },
  },
})

const arrowVariants = cva('group-hover:translate-x-0', {
  compoundVariants: [
    {
      className: 'translate-x-0 group-hover:translate-x-[6px]',
      isOpen: false,
      position: 'left',
    },
    {
      className: 'translate-x-[6px]',
      isOpen: true,
      position: 'left',
    },
    {
      className: 'translate-x-0 group-hover:translate-x-[-6px]',
      isOpen: false,
      position: 'right',
    },
    {
      className: 'translate-x-[-6px]',
      isOpen: true,
      position: 'right',
    },
  ],
  defaultVariants: {
    isOpen: false,
    position: 'left',
  },
  variants: {
    isOpen: {
      false: '',
      true: 'opacity-0 group-hover:opacity-100',
    },
    position: {
      left: '',
      right: '',
    },
  },
})

type SideBarIconProps = HTMLAttributes<SVGSVGElement> & {
  isOpen?: boolean
  position?: 'left' | 'right'
}

export const SideBarIcon = forwardRef<SVGSVGElement, SideBarIconProps>((props, ref) => {
  const { isOpen = false, position = 'left', ...domProps } = props

  return (
    <svg fill={'none'} height={'20'} ref={ref} viewBox={'0 0 20 20'} width={'20'} {...domProps}>
      {/* box */}
      <path
        clipRule={'evenodd'}
        d={
          'M18.0451 3.06107C19 4.3754 19 6.25027 19 10C19 13.7497 19 15.6246 18.0451 16.9389C17.7367 17.3634 17.3634 17.7367 16.9389 18.0451C15.6246 19 13.7497 19 10 19C6.25027 19 4.3754 19 3.06107 18.0451C2.6366 17.7367 2.26331 17.3634 1.95491 16.9389C1 15.6246 1 13.7497 1 10C1 6.25027 1 4.3754 1.95491 3.06107C2.26331 2.6366 2.6366 2.26331 3.06107 1.95491C4.3754 1 6.25027 1 10 1C13.7497 1 15.6246 1 16.9389 1.95491C17.3634 2.26331 17.7367 2.6366 18.0451 3.06107ZM14.2212 17.3894C13.219 17.4979 11.9083 17.5 10 17.5C9.74368 17.5 9.49815 17.5 9.26269 17.4996L7.76269 17.4893C6.97575 17.4766 6.33054 17.4491 5.77883 17.3894C4.80473 17.2838 4.3016 17.0923 3.94275 16.8316C3.64562 16.6157 3.38432 16.3544 3.16844 16.0572C2.90772 15.6984 2.71618 15.1953 2.61064 14.2212C2.50206 13.219 2.5 11.9083 2.5 10C2.5 8.09172 2.50206 6.781 2.61064 5.77883C2.71618 4.80473 2.90772 4.3016 3.16844 3.94275C3.38432 3.64562 3.64562 3.38432 3.94275 3.16844C4.3016 2.90772 4.80473 2.71617 5.77883 2.61064C6.33054 2.55086 6.97575 2.52337 7.7627 2.51073L9.2627 2.50036C9.49815 2.50004 9.74368 2.5 10 2.5C11.9083 2.5 13.219 2.50206 14.2212 2.61064C15.1953 2.71617 15.6984 2.90772 16.0572 3.16844C16.3544 3.38432 16.6157 3.64562 16.8316 3.94275C17.0923 4.3016 17.2838 4.80473 17.3894 5.77883C17.4979 6.781 17.5 8.09172 17.5 10C17.5 11.9083 17.4979 13.219 17.3894 14.2212C17.2838 15.1953 17.0923 15.6984 16.8316 16.0572C16.6157 16.3544 16.3544 16.6157 16.0572 16.8316C15.6984 17.0923 15.1953 17.2838 14.2212 17.3894Z'
        }
        fill={'currentColor'}
        fillRule={'evenodd'}
      />
      {/* sidebar vertical line */}
      <path
        className={sidebarLineVariants({ isOpen, position })}
        clipRule={'evenodd'}
        d={pipe(
          position === 'left',
          Boolean.match({
            onFalse: () =>
              'M12.24 18.3977L12.24 2.39844L10.74 2.40881L10.74 18.3874L12.24 18.3977Z',
            onTrue: () =>
              'M9.26269 18.3977L9.2627 2.39844L7.7627 2.40881L7.76269 18.3874L9.26269 18.3977Z',
          }),
        )}
        fill={'currentColor'}
        fillRule={'evenodd'}
        style={{
          transition: 'transform 200ms ease 0s, opacity 120ms ease 0s',
        }}
      />

      {/* sidebar small line */}
      <path
        className={sidebarItemVariants({ isOpen, position })}
        clipRule={'evenodd'}
        d={pipe(
          position === 'left',
          Boolean.match({
            onFalse: () =>
              'M13.1157 5C13.1157 4.58579 13.4515 4.25 13.8657 4.25H15.3657C15.7799 4.25 16.1157 4.58579 16.1157 5C16.1157 5.41421 15.7799 5.75 15.3657 5.75H13.8657C13.4515 5.75 13.1157 5.41421 13.1157 5Z',
            onTrue: () =>
              'M6.88428 7C6.88428 6.58579 6.54849 6.25 6.13428 6.25H4.63428C4.22006 6.25 3.88428 6.58579 3.88428 7C3.88428 7.41421 4.22006 7.75 4.63428 7.75H6.13428C6.54849 7.75 6.88428 7.41421 6.88428 7Z',
          }),
        )}
        fill={'currentColor'}
        fillRule={'evenodd'}
        style={{
          transition: 'transform 200ms ease 0s, opacity 120ms ease 0s',
        }}
      />

      {/* sidebar small line */}
      <path
        className={sidebarItemVariants({ isOpen, position })}
        clipRule={'evenodd'}
        d={pipe(
          position === 'left',
          Boolean.match({
            onFalse: () =>
              'M13.1157 7C13.1157 6.58579 13.4515 6.25 13.8657 6.25H15.3657C15.7799 6.25 16.1157 6.58579 16.1157 7C16.1157 7.41421 15.7799 7.75 15.3657 7.75H13.8657C13.4515 7.75 13.1157 7.41421 13.1157 7Z',
            onTrue: () =>
              'M6.88428 5C6.88428 4.58579 6.54849 4.25 6.13428 4.25H4.63428C4.22006 4.25 3.88428 4.58579 3.88428 5C3.88428 5.41421 4.22006 5.75 4.63428 5.75H6.13428C6.54849 5.75 6.88428 5.41421 6.88428 5Z',
          }),
        )}
        fill={'currentColor'}
        fillRule={'evenodd'}
        style={{
          transition: 'transform 200ms ease 0s, opacity 120ms ease 0s',
        }}
      />

      {/* arrow */}
      <path
        className={arrowVariants({ isOpen, position })}
        clipRule={'evenodd'}
        d={pipe(
          position === 'left',
          Boolean.match({
            onFalse: () =>
              pipe(
                isOpen,
                Boolean.match({
                  onFalse: () =>
                    'M14.5235 12.5371C14.2269 12.8262 13.7521 12.8201 13.4629 12.5235L11.4629 10.4717C11.3241 10.3293 11.2475 10.1375 11.2501 9.93849C11.2526 9.73955 11.3341 9.54979 11.4767 9.41096L13.4766 7.46276C13.7733 7.17373 14.2482 7.17996 14.5372 7.47667C14.8262 7.77338 14.82 8.24821 14.5233 8.53724L13.0607 9.96193L14.5371 11.4765C14.8262 11.7731 14.8201 12.2479 14.5235 12.5371Z',
                  onTrue: () =>
                    'M11.4765 12.5371C11.7731 12.8262 12.2479 12.8201 12.5371 12.5235L14.5371 10.4717C14.6759 10.3293 14.7525 10.1375 14.7499 9.93849C14.7474 9.73955 14.6659 9.54979 14.5233 9.41096L12.5234 7.46276C12.2266 7.17373 11.7518 7.17996 11.4628 7.47667C11.1738 7.77338 11.18 8.24821 11.4767 8.53724L12.9393 9.96193L11.4629 11.4765C11.1738 11.7731 11.1799 12.2479 11.4765 12.5371Z',
                }),
              ),
            onTrue: () =>
              pipe(
                isOpen,
                Boolean.match({
                  onFalse: () =>
                    'M5.47649 12.5371C5.7731 12.8262 6.24793 12.8201 6.53706 12.5235L8.53707 10.4717C8.67595 10.3293 8.75252 10.1375 8.74995 9.93849C8.74737 9.73955 8.66586 9.54979 8.52334 9.41096L6.52336 7.46276C6.22665 7.17373 5.75182 7.17996 5.46279 7.47667C5.17376 7.77338 5.17999 8.24821 5.4767 8.53724L6.93926 9.96193L5.46294 11.4765C5.17381 11.7731 5.17988 12.2479 5.47649 12.5371Z',
                  onTrue: () =>
                    'M8.52349 12.5371C8.22689 12.8262 7.75209 12.8201 7.46289 12.5235L5.46289 10.4717C5.32409 10.3293 5.24749 10.1375 5.25009 9.93849C5.25259 9.73955 5.33409 9.54979 5.47669 9.41096L7.47659 7.46276C7.77329 7.17373 8.24819 7.17996 8.53719 7.47667C8.82619 7.77338 8.81999 8.24821 8.52329 8.53724L7.06069 9.96193L8.53709 11.4765C8.82619 11.7731 8.82009 12.2479 8.52349 12.5371Z',
                }),
              ),
          }),
        )}
        fill={'currentColor'}
        fillRule={'evenodd'}
        style={{
          transition: 'transform 200ms ease 0s, opacity 120ms ease 0s',
        }}
      />
    </svg>
  )
})

SideBarIcon.displayName = 'SideBarIcon'
