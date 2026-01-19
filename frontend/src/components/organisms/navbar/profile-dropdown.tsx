import { Link } from '@tanstack/react-router'
import { useRef } from 'react'
import { BiSolidInvader } from 'react-icons/bi'
import { FaPlay, FaSignInAlt, FaSignOutAlt, FaUser } from 'react-icons/fa'
import { FaRankingStar } from 'react-icons/fa6'
import { IoBag } from 'react-icons/io5'
import { UserAvatar } from '@/components/molecules'
import { AuthState, useAuth } from '@/contexts/auth.context'
import { useDialogStore } from '@/contexts/modal.store'
import { useOutsideClick } from '@/hooks'
import { cn } from '@/lib/utils'
import { divisionMap, leaguesMap } from '@/utils/ranks'
import { CheatsModal, LogoutModal } from '../modals'

interface ProfileDropdownProps {
  isOpen: boolean
  onClose: () => void
}

interface DropdownItemProps {
  children: React.ReactNode
  onClick?: () => void
  danger?: boolean
  disabled?: boolean
  className?: string
}

function DropdownItem({ children, onClick, danger, disabled, className }: DropdownItemProps) {
  return (
    <div
      role="menuitem"
      tabIndex={disabled ? -1 : 0}
      onClick={disabled ? undefined : onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !disabled && onClick) onClick()
      }}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg',
        'font-serif text-sm tracking-wider uppercase',
        'transition-all duration-200 cursor-pointer select-none',
        danger
          ? 'text-red-300 hover:bg-red-500/20 hover:text-red-200'
          : 'text-gold-2 hover:bg-gold-6/30 hover:text-gold-1',
        disabled && 'opacity-50 cursor-not-allowed hover:bg-transparent',
        className
      )}
    >
      {children}
    </div>
  )
}

function DropdownDivider() {
  return <div className="h-px bg-gold-5/30 my-2" />
}

export function ProfileDropdown({ isOpen, onClose }: ProfileDropdownProps) {
  const ref = useRef<HTMLDivElement>(null)
  const auth = useAuth()
  const league = auth.user && leaguesMap[auth.user.rating.league]
  const openModal = useDialogStore((state) => state.showDialog)

  useOutsideClick(ref, onClose)

  function openLogoutModal() {
    onClose()
    openModal(<LogoutModal />, { closeOnOutsideClick: true })
  }

  function openCheatsModal() {
    onClose()
    openModal(<CheatsModal />, { closeOnOutsideClick: true })
  }

  return (
    <div
      ref={ref}
      role="menu"
      className={cn(
        'absolute top-full right-0 mt-2 w-80',
        'rounded-lg overflow-hidden',
        'border-2 border-gold-5/40',
        'bg-linear-to-b from-grey-3/95 to-grey-2/95',
        'backdrop-blur-xl shadow-2xl shadow-black/50',
        'transition-all duration-200 origin-top-right',
        isOpen
          ? 'opacity-100 scale-100 pointer-events-auto'
          : 'opacity-0 scale-95 pointer-events-none'
      )}
    >
      {/* Decorative corners */}
      <div className="absolute -top-0.5 -left-0.5 w-4 h-4 border-t-2 border-l-2 border-gold-3" />
      <div className="absolute -top-0.5 -right-0.5 w-4 h-4 border-t-2 border-r-2 border-gold-3" />
      <div className="absolute -bottom-0.5 -left-0.5 w-4 h-4 border-b-2 border-l-2 border-gold-3" />
      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 border-b-2 border-r-2 border-gold-3" />

      <div className="p-3">
        {/* Signed In - Profile Header */}
        {auth.state === AuthState.SignedIn && auth.user?.nickname && (
          <>
            <Link
              to="/me"
              onClick={onClose}
              className={cn(
                'flex items-center gap-4 p-3 rounded-lg',
                'transition-all duration-200',
                'hover:bg-gold-6/20',
                'group'
              )}
            >
              <UserAvatar
                icon={auth.user.summonerIcon}
                league={auth.user.rating.league}
                className="text-[50px] transition-transform group-hover:scale-105"
              />
              <div className="flex flex-col min-w-0">
                <span className="font-serif font-bold text-lg text-gold-1 truncate">
                  {auth.user.nickname}
                </span>
                <div className="flex items-center gap-2">
                  <img className="size-5" src={league?.icon} alt={league?.name} />
                  <span className="text-xs text-grey-1 capitalize">
                    {league?.name} {divisionMap[auth.user.rating.division || 0]} •{' '}
                    {auth.user.rating.points} LP
                  </span>
                </div>
              </div>
            </Link>
            <DropdownDivider />
          </>
        )}

        {/* Loading state */}
        {auth.state === AuthState.LoadingSession && (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-2 border-gold-3 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Menu Items - Signed In */}
        {auth.state === AuthState.SignedIn && (
          <>
            <Link to="/" onClick={onClose}>
              <DropdownItem>
                <FaPlay size={16} />
                Play
              </DropdownItem>
            </Link>

            <Link to="/me" onClick={onClose}>
              <DropdownItem>
                <FaUser size={16} />
                My Profile
              </DropdownItem>
            </Link>

            <DropdownItem disabled>
              <IoBag size={16} />
              Store
              <span className="ml-auto text-[10px] text-grey-1 normal-case tracking-normal">
                Coming soon
              </span>
            </DropdownItem>

            <Link to="/ranking" onClick={onClose} className="xs:hidden">
              <DropdownItem>
                <FaRankingStar size={16} />
                Top Players
              </DropdownItem>
            </Link>

            <DropdownItem onClick={openCheatsModal}>
              <BiSolidInvader size={16} />
              Cheats
            </DropdownItem>

            <DropdownDivider />

            <DropdownItem onClick={openLogoutModal} danger>
              <FaSignOutAlt size={16} />
              Sign Out
            </DropdownItem>
          </>
        )}

        {/* Menu Items - Not Signed In */}
        {auth.state === AuthState.NotSignedIn && (
          <>
            <Link to="/ranking" onClick={onClose} className="xs:hidden">
              <DropdownItem>
                <FaRankingStar size={16} />
                Top Players
              </DropdownItem>
            </Link>

            <Link to="/sign-in" onClick={onClose}>
              <DropdownItem>
                <FaSignInAlt size={16} />
                Sign In
              </DropdownItem>
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
