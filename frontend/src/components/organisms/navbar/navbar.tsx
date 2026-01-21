import { League } from '@magic3t/common-types'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { GiShoppingBag, GiTrophy } from 'react-icons/gi'
import { IoPerson } from 'react-icons/io5'
import { AuthState, useAuth } from '@/contexts/auth.context.tsx'
import { authClient } from '@/lib/auth-client'
import { cn } from '@/lib/utils'
import { LogoutDialog } from './logout-dialog'
import { NavLink } from './nav-link'
import { ProfileAvatar } from './profile-avatar'
import { ProfileDropdown } from './profile-dropdown'

export function Navbar() {
  const { state: authState, user } = useAuth()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)

  const handleLogout = () => {
    authClient.signOut()
    setIsLogoutDialogOpen(false)
  }

  return (
    <nav
      className={cn(
        'relative w-full h-17 shrink-0',
        'flex items-center justify-between px-4',
        'bg-linear-to-r from-gold-5/20 to-gold-6/30',
        'border-b-2 border-gold-5/40',
        'backdrop-blur-xl',
        'shadow-lg shadow-black/30',
        'z-50'
      )}
    >
      {/* Decorative top border gradient */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-gold-4 to-transparent" />

      {/* Left side - Logo */}
      <Link
        to="/"
        className={cn(
          'relative flex items-center gap-3 px-4 py-2',
          'transition-all duration-300',
          'hover:bg-gradient-to-r hover:from-gold-6/30 hover:via-gold-5/20 hover:to-gold-6/30',
          'group overflow-hidden',
          'before:absolute before:inset-0 before:border-2 before:border-gold-5/40',
          'before:transition-all before:duration-300',
          'hover:before:border-gold-4/60 hover:before:shadow-lg hover:before:shadow-gold-5/20',
          // Decorative corners
          'after:absolute after:top-0 after:left-0 after:w-2 after:h-2',
          'after:border-l-2 after:border-t-2 after:border-gold-3/60',
          'after:transition-all after:duration-300',
          'hover:after:w-3 hover:after:h-3 hover:after:border-gold-2'
        )}
      >
        {/* Bottom right corner */}
        <div
          className={cn(
            'absolute bottom-0 right-0 w-2 h-2',
            'border-r-2 border-b-2 border-gold-3/60',
            'transition-all duration-300',
            'group-hover:w-3 group-hover:h-3 group-hover:border-gold-2'
          )}
        />

        {/* Text content */}
        <div className="flex items-baseline gap-1">
          <span
            className={cn(
              'font-serif text-xl text-gold-1/80 uppercase tracking-wide',
              'transition-colors duration-300',
              'group-hover:text-gold-1'
            )}
          >
            Play
          </span>
          <span
            className={cn(
              'font-serif text-xl font-bold text-gold-4 uppercase tracking-wider',
              'transition-all duration-300',
              'group-hover:text-gold-0 group-hover:drop-shadow-[0_0_8px_rgba(245,203,92,0.6)]'
            )}
          >
            Magic3T
          </span>
        </div>

        {/* Shine effect on hover */}
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-r from-transparent via-gold-2/0 to-transparent',
            'transition-all duration-700',
            'group-hover:via-gold-2/20',
            '-translate-x-full group-hover:translate-x-full'
          )}
        />
      </Link>

      {/* Right side - Navigation + Profile */}
      <div className="flex items-center h-full gap-1">
        {/* Navigation Links */}
        {authState === AuthState.SignedIn && (
          <NavLink href="." disabled className="hidden md:flex" tooltip="Store (Coming Soon)">
            <GiShoppingBag size={20} />
            Store
          </NavLink>
        )}

        <NavLink href="/ranking" tooltip="The best Magic3T players">
          <GiTrophy size={20} />
          <span className="hidden sm:inline-block">Ranking</span>
        </NavLink>

        {authState === AuthState.SignedIn && (
          <>
            <NavLink href="/me" tooltip="My Profile">
              <IoPerson size={20} />
              <span className="hidden sm:inline-block">Profile</span>
            </NavLink>

            {/* Divider */}
            <div className="hidden xs:block w-px h-8 bg-gold-5/30 mx-2" />

            <NavLink onClick={() => setIsLogoutDialogOpen(true)} className="hidden xs:flex">
              <span>Logout</span>
            </NavLink>
          </>
        )}

        {/* Logout Dialog */}
        <LogoutDialog
          isOpen={isLogoutDialogOpen}
          onClose={() => setIsLogoutDialogOpen(false)}
          onConfirm={handleLogout}
        />

        {/* Profile Button */}
        <div className="relative hidden">
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg',
              'transition-all duration-200',
              'hover:bg-gold-6/20',
              'focus:outline-none focus:ring-2 focus:ring-gold-4/50',
              isDropdownOpen && 'bg-gold-6/20'
            )}
          >
            <ProfileAvatar
              icon={user?.summonerIcon ?? 29}
              league={user?.rating.league ?? League.Provisional}
              isLoading={authState === AuthState.LoadingSession}
              size="md"
            />

            {/* Show nickname on larger screens when signed in */}
            {authState === AuthState.SignedIn && (
              <span className="hidden md:block font-serif text-sm text-gold-2 max-w-30 truncate">
                {user.nickname}
              </span>
            )}

            {/* Dropdown indicator */}
            <svg
              className={cn(
                'hidden xs:block w-4 h-4 text-gold-3 transition-transform duration-200',
                isDropdownOpen && 'rotate-180'
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <title>Toggle menu</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Dropdown Menu */}
          <ProfileDropdown isOpen={isDropdownOpen} onClose={() => setIsDropdownOpen(false)} />
        </div>
      </div>
    </nav>
  )
}
