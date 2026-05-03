'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ComponentType, PropsWithChildren, useEffect, useMemo, useState } from 'react'
import {
  Activity,
  BadgeCheck,
  Bell,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  CreditCard,
  FileText,
  HeartPulse,
  Image as ImageIcon,
  Languages,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Package,
  Search,
  Server,
  Settings2,
  ShoppingBag,
  Sparkles,
  Store,
  Tags,
  User,
  Users,
  X,
} from 'lucide-react'
import { apiClient } from '../../apiClient'
import { breakpoints, colors, elevation, layout, radius, spacing, typography, fontWeights } from '@real/tokens'
import { AdminDomain, canAccessDomain, resolveAdminRole } from './admin-permissions'

type AdminRole = 'admin' | 'marketing' | 'catalog' | 'support' | 'ops'
type NavItem = {
  id: string
  domain: AdminDomain
  title: string
  href?: string
  icon: ComponentType<{ size?: number; color?: string }>
  items?: NavItem[]
}

const copy = {
  brandPrimary: 'REAL',
  brandSecondary: 'Cosmetics',
  workspaceTitle: 'Workspace',
  env: 'Environment',
  search: 'Search admin surfaces...',
  navigation: 'Navigation',
  controls: 'Admin control room',
  upgrade: 'Upgrade plan',
  account: 'Account',
  billing: 'Billing',
  notifications: 'Notifications',
  logout: 'Log out',
}

const teams = [
  { name: 'REAL Default Store', plan: 'Enterprise' },
  { name: 'Marketing Ops', plan: 'Growth' },
  { name: 'Launch Sandbox', plan: 'Preview' },
] as const

const navItems: NavItem[] = [
  { id: 'dashboard', domain: 'dashboard', title: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  {
    id: 'catalog',
    domain: 'catalog',
    title: 'Catalog',
    icon: ShoppingBag,
    items: [
      { id: 'catalog-products', domain: 'catalog', title: 'Products', href: '/admin/catalog/products', icon: Package },
      { id: 'catalog-categories', domain: 'catalog', title: 'Categories', href: '/admin/catalog/categories', icon: Tags },
      { id: 'catalog-brands', domain: 'catalog', title: 'Brands', href: '/admin/catalog/brands', icon: Store },
      { id: 'catalog-queries', domain: 'catalog', title: 'Collections', href: '/admin/catalog/queries', icon: Search },
    ],
  },
  {
    id: 'marketing',
    domain: 'marketing',
    title: 'Marketing',
    icon: Megaphone,
    items: [
      { id: 'marketing-promotions', domain: 'marketing', title: 'Promotions', href: '/admin/marketing/promotions', icon: Megaphone },
      { id: 'marketing-referrals', domain: 'marketing', title: 'Referrals', href: '/admin/marketing/referrals', icon: Users },
      { id: 'marketing-notifications', domain: 'marketing', title: 'Notifications', href: '/admin/marketing/notifications', icon: Bell },
      {
        id: 'marketing-cms',
        domain: 'marketing',
        title: 'CMS',
        icon: FileText,
        items: [
          { id: 'marketing-cms-releases', domain: 'marketing', title: 'Releases', href: '/admin/marketing/cms/releases', icon: FileText },
          { id: 'marketing-cms-blocks', domain: 'marketing', title: 'Blocks', href: '/admin/marketing/cms/blocks', icon: FileText },
          { id: 'marketing-cms-queries', domain: 'marketing', title: 'Queries', href: '/admin/marketing/cms/queries', icon: FileText },
          { id: 'marketing-cms-offer-banners', domain: 'marketing', title: 'Offer Banners', href: '/admin/marketing/cms/offer-banners', icon: ImageIcon },
          { id: 'marketing-cms-banners', domain: 'marketing', title: 'Banners', href: '/admin/marketing/cms/banners', icon: Megaphone },
          { id: 'marketing-cms-menus', domain: 'marketing', title: 'Menus', href: '/admin/marketing/cms/menus', icon: Menu },
          { id: 'marketing-cms-site-config', domain: 'marketing', title: 'Site Config', href: '/admin/marketing/cms/site-config', icon: Settings2 },
          { id: 'marketing-cms-ugc', domain: 'marketing', title: 'UGC Gallery', href: '/admin/marketing/cms/ugc', icon: ImageIcon },
        ],
      },
    ],
  },
  {
    id: 'sales',
    domain: 'sales',
    title: 'Sales',
    icon: Activity,
    items: [{ id: 'sales-orders', domain: 'sales', title: 'Orders', href: '/admin/sales/orders', icon: Package }],
  },
  {
    id: 'inventory',
    domain: 'inventory',
    title: 'Inventory',
    icon: Package,
    items: [
      { id: 'inventory-stock', domain: 'inventory', title: 'Stock', href: '/admin/inventory/stock', icon: Package },
      { id: 'inventory-warehouses', domain: 'inventory', title: 'Warehouses', href: '/admin/inventory/warehouses', icon: Server },
    ],
  },
  {
    id: 'operations',
    domain: 'operations',
    title: 'Operations',
    icon: Settings2,
    items: [
      { id: 'operations-cache', domain: 'operations', title: 'Cache', href: '/admin/operations/cache', icon: Server },
      { id: 'operations-audit', domain: 'operations', title: 'Audit', href: '/admin/operations/audit', icon: Activity },
      { id: 'operations-translations', domain: 'operations', title: 'Translations', href: '/admin/operations/translations', icon: Languages },
      { id: 'operations-health', domain: 'operations', title: 'Health', href: '/admin/operations/health', icon: HeartPulse },
    ],
  },
  { id: 'customers', domain: 'customers', title: 'Customers', href: '/admin/customers', icon: Users },
  { id: 'settings', domain: 'settings', title: 'Settings', href: '/admin/settings', icon: User },
]

const SIDEBAR_COLLAPSED_KEY = 'admin_sidebar_collapsed_v3'
const SIDEBAR_GROUP_KEY = 'admin_sidebar_group_open_v3'
const adminShellTokens = {
  appBackground: `linear-gradient(180deg, ${colors.surface} 0%, ${colors.surfaceContainerLow} 100%)`,
  drawerBackdrop: colors.black,
  shellBorder: colors.border,
  shellBackground: `linear-gradient(180deg, ${colors.white} 0%, ${colors.surface} 100%)`,
  shellShadow: elevation.xl,
  brandMarkBackground: `linear-gradient(135deg, ${colors.textPrimary} 0%, ${colors.gray50} 100%)`,
  brandMarkInsetShadow: 'none',
  subtlePanelBackground: colors.surfaceContainerLow,
  statusPillBackground: colors.surfaceContainerLow,
  headerBorder: colors.border,
  headerBackground: colors.surfaceLowest,
  activeItemBorder: colors.brandPrimarySubtle,
  activeItemBackground: colors.brandPrimarySubtle,
  activeItemIconBackground: colors.white,
  navRailBorder: colors.border,
  sectionLabelColor: colors.textSecondary,
} as const

function userInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function hasActiveRoute(item: NavItem, pathname: string): boolean {
  if (item.href && (pathname === item.href || pathname.startsWith(`${item.href}/`))) return true
  if (!item.items) return false
  return item.items.some((child) => hasActiveRoute(child, pathname))
}

function formatBreadcrumb(pathname: string) {
  const segments = pathname.split('/').filter(Boolean)
  return segments.map((segment, index) => ({
    label: segment.replace(/-/g, ' '),
    href: `/${segments.slice(0, index + 1).join('/')}`,
  }))
}

export function AdminShell({ children }: PropsWithChildren) {
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})
  const [userName, setUserName] = useState('Admin User')
  const [userEmail, setUserEmail] = useState('admin@realcosmetics.com')
  const [role, setRole] = useState<AdminRole>('admin')
  const [domainPermissions, setDomainPermissions] = useState<Partial<Record<string, 'none' | 'read' | 'full'>>>()
  const [viewportWidth, setViewportWidth] = useState<number>(layout.admin.containerDefault)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isTeamMenuOpen, setIsTeamMenuOpen] = useState(false)
  const [activeTeam, setActiveTeam] = useState<(typeof teams)[number]>(teams[0])

  const isCompactViewport = viewportWidth <= breakpoints.tabletMax
  const isNarrowViewport = viewportWidth <= breakpoints.mobileMax

  useEffect(() => {
    if (typeof window === 'undefined') return
    const syncViewport = () => setViewportWidth(window.innerWidth)
    syncViewport()
    window.addEventListener('resize', syncViewport)
    return () => window.removeEventListener('resize', syncViewport)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const collapsed = window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1'
    setIsSidebarOpen(!collapsed)
    const groupState = window.localStorage.getItem(SIDEBAR_GROUP_KEY)
    if (groupState) {
      try {
        setOpenGroups(JSON.parse(groupState) as Record<string, boolean>)
      } catch {
        setOpenGroups({})
      }
    }
  }, [])

  useEffect(() => {
    setIsMobileDrawerOpen(false)
    setIsUserMenuOpen(false)
    setIsTeamMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    void apiClient.auth.session().then((session) => {
      if (!session) return
      setUserName(session.name || session.email || 'Admin User')
      setUserEmail(session.email || 'admin@realcosmetics.com')
      setRole(resolveAdminRole(session.role))

      // Load per-user domain permissions
      apiClient.admin.listUsers().then((users) => {
        const me = users.find((u) => u.email === session.email)
        if (me?.domainPermissions) setDomainPermissions(me.domainPermissions)
      }).catch(() => undefined)
    }).catch(() => undefined)
  }, [])

  const visibleItems = useMemo(() => {
    const filterItem = (item: NavItem): NavItem | null => {
      if (!canAccessDomain(role, item.domain, domainPermissions)) return null
      if (!item.items) return item
      const children = item.items.map(filterItem).filter(Boolean) as NavItem[]
      if (children.length === 0 && !item.href) return null
      return { ...item, items: children }
    }
    return navItems.map(filterItem).filter(Boolean) as NavItem[]
  }, [role, domainPermissions])

  const breadcrumbSegments = formatBreadcrumb(pathname)
  const visibleBreadcrumbSegments = isNarrowViewport ? breadcrumbSegments.slice(-1) : breadcrumbSegments
  const runtimeEnv = (process.env.NEXT_PUBLIC_APP_ENV ?? process.env.NODE_ENV ?? 'development').toLowerCase()
  const envTone = runtimeEnv === 'production' ? colors.success : runtimeEnv === 'staging' ? colors.warning : colors.brandPrimary

  const sidebarWidth = isSidebarOpen ? 288 : layout.admin.sidebarCollapsed + 8
  const desktopOffset = isCompactViewport ? 0 : sidebarWidth
  const mobileDrawerWidth = 'min(calc(100vw - 12px), 312px)'
  const sidebarIsVisible = isCompactViewport ? isMobileDrawerOpen : true
  const contentPadding = isNarrowViewport ? spacing['12'] : isCompactViewport ? spacing['16'] : spacing['24']

  const saveOpenGroups = (next: Record<string, boolean>) => {
    setOpenGroups(next)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(SIDEBAR_GROUP_KEY, JSON.stringify(next))
    }
  }

  const toggleSidebar = () => {
    if (isCompactViewport) {
      setIsMobileDrawerOpen((current) => !current)
      return
    }
    const next = !isSidebarOpen
    setIsSidebarOpen(next)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? '0' : '1')
    }
  }

  const handleLogout = async () => {
    try {
      await apiClient.auth.logout()
    } catch {
      // ignore
    }
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }

  return (
    <div style={{ minHeight: '100dvh', background: adminShellTokens.appBackground, overflowX: 'hidden' }}>
      {isCompactViewport && sidebarIsVisible ? (
        <button type='button' aria-label='Close navigation drawer' onClick={() => setIsMobileDrawerOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 45, border: 0, backgroundColor: adminShellTokens.drawerBackdrop, opacity: 0.38, cursor: 'pointer' }} />
      ) : null}

      <aside style={{ position: 'fixed', top: 0, insetInlineStart: 0, zIndex: 50, width: isCompactViewport ? mobileDrawerWidth : sidebarWidth, height: '100dvh', padding: spacing['8'], transform: isCompactViewport ? `translateX(${sidebarIsVisible ? '0' : '-110%'})` : 'translateX(0)', transition: 'width 280ms cubic-bezier(0.16, 1, 0.3, 1), transform 280ms cubic-bezier(0.16, 1, 0.3, 1)' }}>
        <div style={{ display: 'flex', height: '100%', flexDirection: 'column', overflow: 'hidden', border: `1px solid ${adminShellTokens.shellBorder}`, borderRadius: radius.xl + 4, background: adminShellTokens.shellBackground, boxShadow: adminShellTokens.shellShadow }}>
          <div style={{ borderBottom: `1px solid ${adminShellTokens.shellBorder}`, padding: `${spacing['8']}px ${spacing['8']}px ${spacing['6']}px`, display: 'grid', gap: spacing['6'] }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: isSidebarOpen || isCompactViewport ? 'space-between' : 'center' }}>
              {isSidebarOpen || isCompactViewport ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing['8'] }}>
                  <div style={{ width: 32, height: 32, borderRadius: radius.lg, background: adminShellTokens.brandMarkBackground, display: 'grid', placeItems: 'center', color: colors.textInverted, fontWeight: Number(fontWeights.bold), boxShadow: adminShellTokens.brandMarkInsetShadow, flexShrink: 0 }}>{copy.brandPrimary[0]}</div>
                  <div>
                    <div style={{ color: colors.textPrimary, fontSize: typography.sm, fontWeight: Number(fontWeights.bold), letterSpacing: '0.01em' }}>{copy.brandPrimary}</div>
                    <div style={{ color: colors.textSecondary, fontSize: typography.xs }}>{copy.brandSecondary}</div>
                  </div>
                </div>
              ) : (
                <div style={{ width: 32, height: 32, borderRadius: radius.lg, background: adminShellTokens.brandMarkBackground, display: 'grid', placeItems: 'center', color: colors.textInverted, fontWeight: Number(fontWeights.bold) }}>{copy.brandPrimary[0]}</div>
              )}
              {isCompactViewport ? (
                <button type='button' onClick={() => setIsMobileDrawerOpen(false)} aria-label='Close sidebar' style={iconButtonStyle}>
                  <X size={18} color={colors.textSecondary} />
                </button>
              ) : null}
            </div>

            <div style={{ position: 'relative' }}>
              <button type='button' aria-haspopup='menu' aria-expanded={isTeamMenuOpen} onClick={() => setIsTeamMenuOpen((current) => !current)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: spacing['8'], border: `1px solid ${adminShellTokens.shellBorder}`, borderRadius: radius.lg, backgroundColor: adminShellTokens.subtlePanelBackground, padding: `7px ${spacing['8']}px`, cursor: 'pointer' }}>
                <div style={{ width: 24, height: 24, borderRadius: radius.md, backgroundColor: colors.textPrimary, color: colors.textInverted, display: 'grid', placeItems: 'center', fontSize: typography.xs, fontWeight: Number(fontWeights.semibold), flexShrink: 0 }}>{activeTeam.name[0]}</div>
                {(isSidebarOpen || isCompactViewport) && (
                  <>
                    <div style={{ flex: 1, minWidth: 0, textAlign: 'start' }}>
                      <div style={{ color: colors.textPrimary, fontSize: typography.sm, fontWeight: Number(fontWeights.semibold), whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{activeTeam.name}</div>
                      <div style={{ color: colors.textSecondary, fontSize: typography.xs, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{copy.workspaceTitle} | {activeTeam.plan}</div>
                    </div>
                    <ChevronsUpDown size={16} color={colors.textSecondary} />
                  </>
                )}
              </button>
              {isTeamMenuOpen ? (
                <div role='menu' style={{ position: 'absolute', top: `calc(100% + ${spacing['8']}px)`, insetInlineStart: 0, width: '100%', border: `1px solid ${colors.border}`, borderRadius: radius.xl, backgroundColor: colors.surface, boxShadow: elevation.md, padding: spacing['8'], zIndex: 70 }}>
                  <div style={{ color: colors.textSecondary, fontSize: typography.xs, fontWeight: Number(fontWeights.semibold), padding: `${spacing['4']}px ${spacing['8']}px`, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{copy.workspaceTitle}</div>
                  {teams.map((team) => (
                    <button key={team.name} type='button' role='menuitem' onClick={() => { setActiveTeam(team); setIsTeamMenuOpen(false) }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: spacing['10'], border: 0, backgroundColor: activeTeam.name === team.name ? colors.surfaceMuted : 'transparent', borderRadius: radius.lg, padding: spacing['8'], cursor: 'pointer', textAlign: 'start' }}>
                      <div style={{ width: spacing['24'], height: spacing['24'], borderRadius: radius.md, border: `1px solid ${colors.border}`, display: 'grid', placeItems: 'center', color: colors.textSecondary, fontSize: typography.xs }}>{team.name[0]}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: colors.textPrimary, fontSize: typography.sm, fontWeight: Number(fontWeights.medium) }}>{team.name}</div>
                        <div style={{ color: colors.textSecondary, fontSize: typography.xs }}>{team.plan}</div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', padding: `${spacing['6']}px ${spacing['6']}px ${spacing['4']}px`, display: 'grid', gap: spacing['6'], alignContent: 'start' }}>
            <div style={{ display: 'grid', gap: spacing['3'], minWidth: 0 }}>
              {(isSidebarOpen || isCompactViewport) ? <div style={sectionLabelStyle}>{copy.navigation}</div> : null}
              {visibleItems.map((item) => (
                <SidebarItem key={item.id} item={item} isSidebarOpen={isCompactViewport ? true : isSidebarOpen} pathname={pathname} openGroups={openGroups} setOpenGroups={saveOpenGroups} />
              ))}
            </div>
          </div>

          <div style={{ borderTop: `1px solid ${adminShellTokens.shellBorder}`, padding: `${spacing['6']}px ${spacing['8']}px ${spacing['8']}px`, display: 'grid', gap: spacing['6'] }}>
            {(isSidebarOpen || isCompactViewport) ? (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: spacing['6'], border: `1px solid ${adminShellTokens.shellBorder}`, borderRadius: radius.full, backgroundColor: adminShellTokens.statusPillBackground, padding: `3px ${spacing['8']}px`, width: 'fit-content' }}>
                <span style={{ width: spacing['8'], height: spacing['8'], borderRadius: radius.full, backgroundColor: envTone }} />
                <span style={{ color: colors.textSecondary, fontSize: typography.xs, textTransform: 'capitalize' }}>{copy.env}: {runtimeEnv}</span>
              </div>
            ) : null}
            <div style={{ position: 'relative' }}>
              <button type='button' aria-label={`${userName} ${userEmail}`} aria-haspopup='menu' aria-expanded={isUserMenuOpen} onClick={() => setIsUserMenuOpen((current) => !current)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: spacing['8'], border: `1px solid ${adminShellTokens.shellBorder}`, borderRadius: radius.lg, backgroundColor: adminShellTokens.subtlePanelBackground, padding: `7px ${spacing['8']}px`, cursor: 'pointer' }}>
                <div style={{ width: 24, height: 24, borderRadius: radius.full, backgroundColor: colors.brandPrimary, color: colors.textInverted, display: 'grid', placeItems: 'center', fontSize: typography.xs, fontWeight: Number(fontWeights.semibold), flexShrink: 0 }}>{userInitials(userName) || 'A'}</div>
                {(isSidebarOpen || isCompactViewport) ? (
                  <>
                    <div style={{ flex: 1, minWidth: 0, textAlign: 'start' }}>
                      <div style={{ color: colors.textPrimary, fontSize: typography.sm, fontWeight: Number(fontWeights.semibold), whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName}</div>
                      <div style={{ color: colors.textSecondary, fontSize: typography.xs, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{role}</div>
                    </div>
                    <ChevronsUpDown size={16} color={colors.textSecondary} />
                  </>
                ) : null}
              </button>
              {isUserMenuOpen ? (
                <div role='menu' style={{ position: 'absolute', bottom: `calc(100% + ${spacing['8']}px)`, insetInlineStart: 0, width: '100%', border: `1px solid ${colors.border}`, borderRadius: radius.xl, backgroundColor: colors.surface, boxShadow: elevation.md, padding: spacing['8'], zIndex: 70 }}>
                  <UserMenuItem icon={Sparkles} label={copy.upgrade} onSelect={() => setIsUserMenuOpen(false)} />
                  <UserMenuItem icon={BadgeCheck} label={copy.account} onSelect={() => setIsUserMenuOpen(false)} />
                  <UserMenuItem icon={CreditCard} label={copy.billing} onSelect={() => setIsUserMenuOpen(false)} />
                  <UserMenuItem icon={Bell} label={copy.notifications} onSelect={() => setIsUserMenuOpen(false)} />
                  <UserMenuItem icon={LogOut} label={copy.logout} danger onSelect={() => { setIsUserMenuOpen(false); void handleLogout() }} />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </aside>

      <div style={{ marginInlineStart: desktopOffset, minHeight: '100dvh', transition: 'margin-inline-start 280ms cubic-bezier(0.16, 1, 0.3, 1)', display: 'flex', flexDirection: 'column', width: isCompactViewport ? '100%' : `calc(100% - ${desktopOffset}px)` }}>
        <header style={{ position: 'sticky', top: 0, zIndex: 30, display: 'flex', minHeight: layout.admin.headerHeight, alignItems: 'center', justifyContent: 'space-between', gap: spacing['12'], flexWrap: 'wrap', borderBottom: `1px solid ${adminShellTokens.headerBorder}`, backgroundColor: adminShellTokens.headerBackground, padding: `${spacing['12']}px ${contentPadding}px` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing['12'], minWidth: 0 }}>
            <button type='button' onClick={toggleSidebar} aria-label='Toggle sidebar' style={iconButtonStyle}>
              <Menu size={18} color={colors.textSecondary} />
            </button>
            <nav aria-label='Breadcrumb'>
              <ol style={{ display: 'flex', alignItems: 'center', gap: spacing['8'], margin: 0, padding: 0, listStyle: 'none', minWidth: 0 }}>
                {visibleBreadcrumbSegments.map((segment, index, arr) => (
                  <li key={`${segment.href}-${index}`} style={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
                    {index > 0 ? <span style={{ marginInline: spacing['6'], color: colors.textSecondary, fontSize: typography.xs }}>/</span> : null}
                    {index === arr.length - 1 ? (
                      <span style={{ fontSize: typography.sm, fontWeight: Number(fontWeights.semibold), color: colors.textPrimary, textTransform: 'capitalize', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: isNarrowViewport ? '56vw' : undefined }}>{segment.label}</span>
                    ) : (
                      <Link href={segment.href} style={{ fontSize: typography.sm, color: colors.textSecondary, textDecoration: 'none', textTransform: 'capitalize' }}>{segment.label}</Link>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: spacing['10'], flexWrap: 'wrap' }}>
            {!isCompactViewport ? (
              <div style={{ position: 'relative', width: 320, maxWidth: '100%' }}>
                <Search size={16} color={colors.textSecondary} style={{ position: 'absolute', insetInlineStart: spacing['12'], top: '50%', transform: 'translateY(-50%)' }} />
                <input type='search' name='admin-search' aria-label={copy.search} autoComplete='off' placeholder={copy.search} style={{ width: '100%', minHeight: 44, borderRadius: radius.md, border: `1px solid ${colors.border}`, backgroundColor: colors.surface, color: colors.textPrimary, fontSize: typography.sm, outline: 'none', paddingInlineStart: 44, paddingInlineEnd: spacing['16'], boxShadow: elevation.xs }} />
              </div>
            ) : null}
            <button type='button' aria-label='Notifications' style={iconButtonStyle}>
              <Bell size={18} color={colors.textSecondary} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing['10'], border: `1px solid ${colors.border}`, borderRadius: radius.md, backgroundColor: colors.surface, boxShadow: elevation.xs, padding: `6px ${spacing['8']}px 6px 6px` }}>
              <div style={{ width: spacing['32'], height: spacing['32'], borderRadius: radius.full, backgroundColor: colors.brandPrimary, color: colors.textInverted, display: 'grid', placeItems: 'center', fontSize: typography.xs, fontWeight: Number(fontWeights.semibold) }}>{userInitials(userName) || 'A'}</div>
              {!isNarrowViewport ? (
                <div style={{ display: 'grid' }}>
                  <span style={{ color: colors.textPrimary, fontSize: typography.sm, fontWeight: Number(fontWeights.semibold), whiteSpace: 'nowrap' }}>{userName}</span>
                  <span style={{ color: colors.textSecondary, fontSize: typography.xs, whiteSpace: 'nowrap' }}>{role}</span>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <main id='main-content' style={{ flex: 1, overflowY: 'auto', minWidth: 0, padding: contentPadding }}>
          {children}
        </main>
      </div>
    </div>
  )
}

function SidebarItem({
  item,
  isSidebarOpen,
  pathname,
  openGroups,
  setOpenGroups,
  depth = 0,
}: {
  item: NavItem
  isSidebarOpen: boolean
  pathname: string
  openGroups: Record<string, boolean>
  setOpenGroups: (next: Record<string, boolean>) => void
  depth?: number
}) {
  const Icon = item.icon
  const isActive = item.href ? pathname === item.href : false
  const hasChildren = Boolean(item.items?.length)
  const isChildActive = hasChildren ? item.items!.some((child) => hasActiveRoute(child, pathname)) : false
  const isExpanded = openGroups[item.id] ?? isChildActive

  useEffect(() => {
    if (!isChildActive || openGroups[item.id]) return
    setOpenGroups({ ...openGroups, [item.id]: true })
  }, [isChildActive, item.id, openGroups, setOpenGroups])

  if (!isSidebarOpen && depth > 0) return null

  const activeTone = isActive || isChildActive
  const triggerStyle = {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    justifyContent: isSidebarOpen ? 'space-between' : 'center',
    borderRadius: radius.lg,
    minHeight: 34,
    border: `1px solid ${activeTone ? adminShellTokens.activeItemBorder : 'transparent'}`,
    background: activeTone ? adminShellTokens.activeItemBackground : 'transparent',
    paddingInline: 7,
    cursor: 'pointer',
    minWidth: 0,
  } as const

  if (item.href && !hasChildren) {
    return (
      <Link href={item.href} style={{ textDecoration: 'none' }}>
        <div style={triggerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing['8'], minWidth: 0, flex: 1 }}>
          <div style={{ width: 22, height: 22, borderRadius: radius.md, backgroundColor: activeTone ? adminShellTokens.activeItemIconBackground : 'transparent', display: 'grid', placeItems: 'center', color: activeTone ? colors.brandPrimary : colors.textSecondary, flexShrink: 0 }}>
            <Icon size={16} />
          </div>
          {isSidebarOpen ? <span style={{ color: activeTone ? colors.textPrimary : colors.textSecondary, fontSize: typography.sm, fontWeight: Number(fontWeights.medium), minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</span> : null}
        </div>
      </div>
    </Link>
    )
  }

  return (
    <div style={{ display: 'grid', gap: spacing['4'] }}>
      <button type='button' onClick={() => setOpenGroups({ ...openGroups, [item.id]: !isExpanded })} style={triggerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing['8'], minWidth: 0, flex: 1 }}>
          <div style={{ width: 22, height: 22, borderRadius: radius.md, backgroundColor: activeTone ? adminShellTokens.activeItemIconBackground : 'transparent', display: 'grid', placeItems: 'center', color: activeTone ? colors.brandPrimary : colors.textSecondary, flexShrink: 0 }}>
            <Icon size={16} />
          </div>
          {isSidebarOpen ? <span style={{ color: activeTone ? colors.textPrimary : colors.textSecondary, fontSize: typography.sm, fontWeight: Number(fontWeights.medium), minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</span> : null}
        </div>
        {isSidebarOpen ? (isExpanded ? <ChevronDown size={15} color={colors.textSecondary} /> : <ChevronRight size={15} color={colors.textSecondary} />) : null}
      </button>
      {isSidebarOpen && hasChildren ? (
        <div style={{ maxHeight: isExpanded ? 720 : 0, opacity: isExpanded ? 1 : 0, overflow: 'hidden', transition: 'max-height 220ms cubic-bezier(0.16,1,0.3,1), opacity 180ms ease' }}>
          <div style={{ marginInlineStart: spacing['10'], borderInlineStart: `1px solid ${adminShellTokens.navRailBorder}`, paddingInlineStart: 7, display: 'grid', gap: spacing['3'], minWidth: 0 }}>
            {item.items!.map((child) => (
              <SidebarItem key={child.id} item={child} isSidebarOpen={isSidebarOpen} pathname={pathname} openGroups={openGroups} setOpenGroups={setOpenGroups} depth={depth + 1} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function UserMenuItem({
  icon: Icon,
  label,
  danger,
  onSelect,
}: {
  icon: ComponentType<{ size?: number }>
  label: string
  danger?: boolean
  onSelect: () => void
}) {
  return (
    <button type='button' role='menuitem' onClick={onSelect} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: spacing['10'], border: 0, backgroundColor: 'transparent', borderRadius: radius.lg, padding: spacing['8'], cursor: 'pointer', color: danger ? colors.danger : colors.textPrimary, textAlign: 'start' }}>
      <Icon size={16} />
      <span style={{ fontSize: typography.sm }}>{label}</span>
    </button>
  )
}

const sectionLabelStyle = {
  paddingInline: 7,
  color: adminShellTokens.sectionLabelColor,
  fontSize: typography.xs,
  fontWeight: Number(fontWeights.semibold),
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
} as const

const iconButtonStyle = {
  width: 44,
  height: 44,
  display: 'grid',
  placeItems: 'center',
  border: `1px solid ${adminShellTokens.shellBorder}`,
  borderRadius: radius.full,
  backgroundColor: colors.surface,
  boxShadow: elevation.md,
  cursor: 'pointer',
} as const
