import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore'
import { toggleSidebar, setLang } from '@/store/slices/uiSlice'
import { HiMenu, HiTranslate, HiLogout } from 'react-icons/hi'
import { toast } from 'sonner'
import { useAuth } from '@/features/auth/hooks/useAuth'

export default function Header() {
  const { t, i18n } = useTranslation()
  const dispatch = useAppDispatch()
  const lang = useAppSelector((s) => s.ui.lang)
  const { logout, user } = useAuth()
  const switchLang = () => {
    const next = lang === 'en' ? 'ar' : 'en'
    i18n.changeLanguage(next)
    dispatch(setLang(next))
    document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = next
  }

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
  }

  // Get initials from user name, fallback to 'AD'
  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : 'AD'

  return (
    <header
      className="h-16 shrink-0 flex items-center justify-end px-5
        bg-[var(--bg-card)] border-b border-[var(--border)]"
    >
   

      {/* Right */}
      <div className="flex items-center gap-3">
    

        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center
            text-white text-xs font-bold"
          title={user?.name ?? ''}
        >
          {initials}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="p-2 rounded-[var(--radius)] text-[var(--text-muted)]
            hover:bg-red-50 hover:text-[var(--danger)] transition-colors"
          aria-label="Logout"
          title="Logout"
        >
          <HiLogout size={18} />
          
        </button>
      </div>
    </header>
  )
}