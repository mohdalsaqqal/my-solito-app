'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ComponentType, PropsWithChildren, useEffect, useMemo, useState } from 'react'
import {
  Activity,
  Bell,
  ChevronDown,
  ChevronRight,
  FileText,
  Languages,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Package,
  Search,
  Server,
  ShoppingBag,
  Store,
  Tags,
  User,
  Users,
  X,
} from 'lucide-react'
import { apiClient } from '../../apiClient'
import { breakpoints, colors, layout, radius, spacing, typography, fontWeights } from '@real/tokens'
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

const navItems: NavItem[] = [
  {
    id: 'dashboard',
    domain: 'dashboard',
    title: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    id: 'catalog',
    domain: 'catalog',
    title: 'Catalog',
    icon: ShoppingBag,
    items: [
      { id: 'catalog-products', domain: 'catalog', title: 'Products', href: '/admin/catalog/products', icon: Package },
      { id: 'catalog-categories', domain: 'catalog', title: 'Categories', href: '/admin/catalog/categories', icon: Tags },
      { id: 'catalog-brands', domain: 'catalog', title: 'Brands', href: '/admin/catalog/brands', icon: Store },
      { id: 'catalog-queries', domain: 'catalog', title: 'Queries', href: '/admin/catalog/queries', icon: Search },
    ],
  },
  {
    id: 'marketing',
    domain: 'marketing',
    title: 'Marketing',
    icon: Megaphone,
    items: [
      {
        id: 'marketing-promotions',
        domain: 'marketing',
        title: 'Promotions',
        href: '/admin/marketing/promotions',
        icon: Megaphone,
      },
      {
        id: 'marketing-cms',
        domain: 'marketing',
        title: 'CMS',
        icon: FileText,
        items: [
          {
            id: 'marketing-cms-releases',
            domain: 'marketing',
            title: 'Releases',
            href: '/admin/marketing/cms/releases',
            icon: FileText,
          },
          {
            id: 'marketing-cms-blocks',
            domain: 'marketing',
            title: 'Blocks',
            href: '/admin/marketing/cms/blocks',
            icon: FileText,
          },
          {
            id: 'marketing-cms-queries',
            domain: 'marketing',
            title: 'Queries',
            href: '/admin/marketing/cms/queries',
            icon: FileText,
          },
        ],
      },
    ],
  },
  {
    id: 'orders',
    domain: 'orders',
    title: 'Orders',
    href: '/admin/orders',
    icon: Package,
  },
  {
    id: 'customers',
    domain: 'customers',
    title: 'Customers',
    href: '/admin/customers',
    icon: Users,
  },
  {
    id: 'operations',
    domain: 'operations',
    title: 'Operations',
    icon: Server,
    items: [
      { id: 'operations-cache', domain: 'operations', title: 'Cache', href: '/admin/operations/cache', icon: Server },
      { id: 'operations-audit', domain: 'operations', title: 'Audit', href: '/admin/operations/audit', icon: Activity },
      {
        id: 'operations-translations',
        domain: 'operations',
        title: 'Translations',
        href: '/admin/operations/translations',
        icon: Languages,
      },
    ],
  },
]

const SIDEBAR_COLLAPSED_KEY = 'admin_sidebar_collapsed_v1'
const SIDEBAR_GROUP_KEY = 'admin_sidebar_group_open_v1'

function hasActiveRoute(item: NavItem, pathname: string): boolean {
  if (item.href && (pathname === item.href || pathname.startsWith(`${item.href}/`))) return true
  if (!item.items) return false
  return item.items.some((child) => hasActiveRoute(child, pathname))
}

function formatBreadcrumb(pathname: string) {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length <= 1) return '/admin/dashboard'
  return `/${segments.join('/')}`
}

export function AdminShell({ children }: PropsWithChildren) {
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})
  const [userName, setUserName] = useState('Admin User')
  const [userEmail, setUserEmail] = useState('admin@realcosmetics.com')
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [role, setRole] = useState<AdminRole>('admin')
  const [viewportWidth, setViewportWidth] = useState<number>(layout.admin.containerDefault)

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
  }, [pathname])

  useEffect(() => {
    void apiClient.auth
      .session()
      .then((session) => {
        if (!session) return
        setUserName(session.name || session.email || 'Admin User')
        setUserEmail(session.email || 'admin@realcosmetics.com')
        setRole(resolveAdminRole(session.role))
      })
      .catch(() => undefined)
  }, [])

  const visibleItems = useMemo(() => {
    const filterItem = (item: NavItem): NavItem | null => {
      if (!canAccessDomain(role, item.domain)) return null
      if (!item.items) return item
      const children = item.items.map(filterItem).filter(Boolean) as NavItem[]
      if (children.length === 0 && !item.href) return null
      return { ...item, items: children }
    }
    return navItems.map(filterItem).filter(Boolean) as NavItem[]
  }, [role])

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

  const sidebarWidth = isSidebarOpen ? layout.admin.sidebarExpanded : layout.admin.sidebarCollapsed
  const desktopOffset = isCompactViewport ? 0 : sidebarWidth
  const mobileDrawerWidth = `min(calc(100vw - ${spacing['24']}px), ${layout.admin.sidebarExpanded + spacing['24']}px)`
  const sidebarIsVisible = isCompactViewport ? isMobileDrawerOpen : true
  const breadcrumbSegments = formatBreadcrumb(pathname).split('/').filter(Boolean)
  const visibleBreadcrumbSegments = isNarrowViewport
    ? breadcrumbSegments.slice(-1)
    : breadcrumbSegments
  const contentPadding = isNarrowViewport ? spacing['12'] : isCompactViewport ? spacing['16'] : spacing['24']
  const runtimeEnv = (process.env.NEXT_PUBLIC_APP_ENV ?? process.env.NODE_ENV ?? 'development').toLowerCase()
  const envTone =
    runtimeEnv === 'production'
      ? colors.success
      : runtimeEnv === 'staging'
      ? colors.warning
      : colors.textSecondary

  const handleLogout = async () => {
    try {
      await apiClient.auth.logout()
    } catch {
      // Ignore logout API failures; continue with local redirect.
    }
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login'
    }
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        backgroundColor: colors.surfaceMuted,
        overflowX: 'hidden',
        width: '100%',
      }}
    >
      {isCompactViewport && sidebarIsVisible ? (
        <button
          type='button'
          aria-label='Close navigation drawer'
          onClick={() => setIsMobileDrawerOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 35,
            border: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.38)',
            cursor: 'pointer',
          }}
        />
      ) : null}

      <aside
        style={{
          position: 'fixed',
          top: 0,
          insetInlineStart: 0,
          zIndex: 40,
          width: isCompactViewport ? mobileDrawerWidth : sidebarWidth,
          height: '100dvh',
          backgroundColor: colors.surface,
          borderInlineEnd: `1px solid ${colors.border}`,
          transform: isCompactViewport ? `translateX(${sidebarIsVisible ? '0' : '-110%'})` : 'translateX(0)',
          transition: 'width 300ms cubic-bezier(0.16, 1, 0.3, 1), transform 300ms cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: isCompactViewport && sidebarIsVisible ? '0 24px 48px rgba(15, 23, 42, 0.22)' : 'none',
          overflowX: 'hidden',
        }}
      >
        <div
          style={{
            height: layout.admin.headerHeight,
            borderBottom: `1px solid ${colors.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing['8'],
              width: isSidebarOpen || isCompactViewport ? '100%' : 'auto',
              justifyContent: isSidebarOpen || isCompactViewport ? 'space-between' : 'center',
              paddingInline: isSidebarOpen || isCompactViewport ? spacing['24'] : 0,
            }}
          >
            {isSidebarOpen || isCompactViewport ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing['8'] }}>
                <div
                  style={{
                    width: spacing['32'],
                    height: spacing['32'],
                    borderRadius: radius.lg,
                    backgroundColor: colors.textPrimary,
                    color: colors.textInverted,
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: typography.sm,
                    fontWeight: Number(fontWeights.semibold),
                  }}
                >
                  R
                </div>
                <span
                  style={{
                    fontSize: typography.lg,
                    fontWeight: Number(fontWeights.semibold),
                    color: colors.textPrimary,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Real Cosmetics
                </span>
              </div>
            ) : (
              <div
                style={{
                  width: spacing['32'],
                  height: spacing['32'],
                  borderRadius: radius.lg,
                  backgroundColor: colors.textPrimary,
                  color: colors.textInverted,
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: typography.sm,
                  fontWeight: Number(fontWeights.semibold),
                }}
              >
                R
              </div>
            )}
            {isCompactViewport ? (
              <button
                type='button'
                onClick={() => setIsMobileDrawerOpen(false)}
                aria-label='Close sidebar'
                style={{
                  border: 0,
                  borderRadius: radius.md,
                  backgroundColor: 'transparent',
                  color: colors.textSecondary,
                  cursor: 'pointer',
                  padding: spacing['4'],
                }}
              >
                <X size={18} color={colors.textSecondary} />
              </button>
            ) : null}
          </div>
        </div>

        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            paddingBlock: spacing['16'],
            paddingInline: spacing['12'],
          }}
        >
          <nav style={{ display: 'grid', gap: spacing['4'] }}>
            {visibleItems.map((item) => (
              <SidebarItem
                key={item.id}
                item={item}
                isSidebarOpen={isCompactViewport ? true : isSidebarOpen}
                pathname={pathname}
                openGroups={openGroups}
                setOpenGroups={(next) => {
                  setOpenGroups(next)
                  if (typeof window !== 'undefined') {
                    window.localStorage.setItem(SIDEBAR_GROUP_KEY, JSON.stringify(next))
                  }
                }}
              />
            ))}
          </nav>
        </div>

        <div
          style={{
            borderTop: `1px solid ${colors.border}`,
            backgroundColor: colors.surface,
            padding: spacing['16'],
          }}
        >
          <div
            style={{
              border: `1px solid ${colors.border}`,
              borderRadius: radius.md,
              backgroundColor: colors.surfaceMuted,
              padding: `${spacing['4']}px ${spacing['8']}px`,
              marginBottom: spacing['12'],
              display: 'inline-flex',
              alignItems: 'center',
              gap: spacing['4'],
            }}
          >
            <span
              style={{
                width: spacing['8'],
                height: spacing['8'],
                borderRadius: radius.full,
                backgroundColor: envTone,
              }}
            />
            <span
              style={{
                color: colors.textSecondary,
                fontSize: typography.xs,
                textTransform: 'capitalize',
              }}
            >
              Environment: {runtimeEnv}
            </span>
          </div>
          <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing['12'],
                justifyContent: isSidebarOpen || isCompactViewport ? 'flex-start' : 'center',
              }}
            >
            <div
              style={{
                display: 'flex',
                width: spacing['32'],
                height: spacing['32'],
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: radius.full,
                backgroundColor: colors.surfaceMuted,
              }}
            >
              <User size={16} color={colors.textSecondary} />
            </div>

            {isSidebarOpen || isCompactViewport ? (
              <>
                <div style={{ display: 'grid', minWidth: 0 }}>
                  <span
                    style={{
                      color: colors.textPrimary,
                      fontSize: typography.sm,
                      fontWeight: Number(fontWeights.medium),
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {userName}
                  </span>
                  <span
                    style={{
                      color: colors.textSecondary,
                      fontSize: typography.xs,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {userEmail}
                  </span>
                </div>
                <button
                  type='button'
                  onClick={() => void handleLogout()}
                  style={{
                    border: 0,
                    backgroundColor: 'transparent',
                    color: colors.textSecondary,
                    borderRadius: radius.md,
                    padding: spacing['4'],
                    cursor: 'pointer',
                    marginInlineStart: 'auto',
                  }}
                  title='Logout'
                  aria-label='Logout'
                >
                  <LogOut size={16} color={colors.textSecondary} />
                </button>
              </>
            ) : null}
          </div>
        </div>
      </aside>

      <div
        style={{
          marginInlineStart: desktopOffset,
          minHeight: '100dvh',
          transition: 'margin-inline-start 300ms cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          width: isCompactViewport ? '100%' : `calc(100% - ${desktopOffset}px)`,
          maxWidth: isCompactViewport ? '100%' : `calc(100% - ${desktopOffset}px)`,
        }}
      >
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 30,
            display: 'flex',
            height: layout.admin.headerHeight,
            width: '100%',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${colors.border}`,
            backgroundColor: colors.surface,
            paddingInline: contentPadding,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing['12'], minWidth: 0 }}>
            <button
              type='button'
              onClick={toggleSidebar}
              aria-label='Toggle sidebar'
              style={{
                border: 0,
                borderRadius: radius.md,
                padding: spacing['8'],
                backgroundColor: 'transparent',
                color: colors.textSecondary,
                cursor: 'pointer',
              }}
            >
              <Menu size={20} color={colors.textSecondary} />
            </button>

            <nav aria-label='Breadcrumb'>
              <ol
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing['8'],
                  margin: 0,
                  padding: 0,
                  listStyle: 'none',
                  minWidth: 0,
                }}
              >
                {visibleBreadcrumbSegments.map((segment, index, arr) => (
                    <li key={`${segment}-${index}`} style={{ display: 'flex', alignItems: 'center' }}>
                      {index > 0 ? <span style={{ marginInline: spacing['8'], color: colors.textSecondary }}>/</span> : null}
                      <span
                        style={{
                          fontSize: typography.sm,
                          fontWeight: Number(fontWeights.medium),
                          color: index === arr.length - 1 ? colors.textPrimary : colors.textSecondary,
                          textTransform: 'capitalize',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: isNarrowViewport ? '52vw' : undefined,
                        }}
                      >
                        {segment.replace(/-/g, ' ')}
                      </span>
                    </li>
                  ))}
              </ol>
            </nav>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: spacing['12'] }}>
            {!isCompactViewport ? (
              <div style={{ position: 'relative', width: 256 }}>
                <Search
                  size={16}
                  color={colors.textSecondary}
                  style={{ position: 'absolute', insetInlineStart: 10, top: 11 }}
                />
                <input
                  type='search'
                  placeholder='Search...'
                  style={{
                    width: '100%',
                    height: spacing['40'],
                    borderRadius: radius.md,
                    border: `1px solid ${colors.border}`,
                    backgroundColor: colors.surface,
                    color: colors.textPrimary,
                    fontSize: typography.sm,
                    outline: 'none',
                    paddingInlineStart: spacing['32'] + spacing['8'],
                    paddingInlineEnd: spacing['12'],
                  }}
                />
              </div>
            ) : (
              <button
                type='button'
                style={{
                  border: 0,
                  backgroundColor: 'transparent',
                  color: colors.textSecondary,
                  borderRadius: radius.full,
                  padding: spacing['8'],
                  cursor: 'pointer',
                }}
                aria-label='Search'
              >
                <Search size={20} color={colors.textSecondary} />
              </button>
            )}

            <button
              type='button'
              style={{
                border: 0,
                backgroundColor: 'transparent',
                color: colors.textSecondary,
                borderRadius: radius.full,
                padding: spacing['8'],
                cursor: 'pointer',
              }}
              aria-label='Notifications'
            >
              <Bell size={20} color={colors.textSecondary} />
            </button>

            <div style={{ position: 'relative' }}>
              <button
                type='button'
                aria-haspopup='menu'
                aria-expanded={isUserMenuOpen}
                onClick={() => setIsUserMenuOpen((current) => !current)}
                style={{
                  width: spacing['32'],
                  height: spacing['32'],
                  borderRadius: radius.full,
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.surfaceMuted,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: colors.textSecondary,
                  fontSize: typography.xs,
                  fontWeight: Number(fontWeights.medium),
                  cursor: 'pointer',
                }}
              >
                {userName.trim().slice(0, 2).toUpperCase()}
              </button>
              {isUserMenuOpen ? (
                <div
                  role='menu'
                  style={{
                    position: 'absolute',
                    top: `calc(100% + ${spacing['8']}px)`,
                    insetInlineEnd: 0,
                    minWidth: 220,
                    border: `1px solid ${colors.border}`,
                    borderRadius: radius.xl,
                    backgroundColor: colors.surface,
                    boxShadow: '0 12px 24px rgba(15, 23, 42, 0.14)',
                    padding: spacing['8'],
                    zIndex: 70,
                  }}
                >
                  <div
                    style={{
                      padding: spacing['8'],
                      borderBottom: `1px solid ${colors.border}`,
                      marginBottom: spacing['8'],
                      display: 'grid',
                      gap: spacing['2'],
                    }}
                  >
                    <span
                      style={{
                        color: colors.textPrimary,
                        fontSize: typography.sm,
                        fontWeight: Number(fontWeights.medium),
                      }}
                    >
                      {userName}
                    </span>
                    <span style={{ color: colors.textSecondary, fontSize: typography.xs }}>{userEmail}</span>
                  </div>
                  <button
                    type='button'
                    role='menuitem'
                    style={menuItemStyle}
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    Profile
                  </button>
                  <button
                    type='button'
                    role='menuitem'
                    style={menuItemStyle}
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    Environment: {runtimeEnv}
                  </button>
                  <button
                    type='button'
                    role='menuitem'
                    style={{ ...menuItemStyle, color: colors.danger }}
                    onClick={() => {
                      setIsUserMenuOpen(false)
                      void handleLogout()
                    }}
                  >
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            backgroundColor: colors.surfaceMuted,
            padding: contentPadding,
            minWidth: 0,
          }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}

const menuItemStyle = {
  width: '100%',
  border: 0,
  backgroundColor: 'transparent',
  color: colors.textSecondary,
  borderRadius: radius.md,
  minHeight: spacing['40'],
  paddingInline: spacing['8'],
  textAlign: 'start',
  cursor: 'pointer',
  fontSize: typography.sm,
} as const

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
    if (!isChildActive) return
    if (openGroups[item.id]) return
    setOpenGroups({ ...openGroups, [item.id]: true })
  }, [isChildActive, item.id, openGroups, setOpenGroups])

  if (!isSidebarOpen && depth > 0) return null

  const triggerStyle = {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    justifyContent: isSidebarOpen ? 'space-between' : 'center',
    borderRadius: radius.md,
    minHeight: spacing['40'],
    border: 0,
    cursor: 'pointer',
    transition: 'background-color 160ms ease, color 160ms ease',
    paddingInline: isSidebarOpen ? spacing['12'] : spacing['8'],
    backgroundColor: isActive ? colors.surfaceMuted : 'transparent',
    color: isActive || isChildActive ? colors.brandPrimary : colors.textSecondary,
    borderInlineEnd: isActive ? `2px solid ${colors.brandPrimary}` : '2px solid transparent',
  } as const

  if (item.href && !hasChildren) {
    return (
      <Link href={item.href} style={{ textDecoration: 'none' }}>
        <div style={triggerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing['12'] }}>
            <Icon size={20} color={isActive ? colors.brandPrimary : colors.textSecondary} />
            {isSidebarOpen ? (
              <span style={{ fontSize: typography.sm, fontWeight: Number(fontWeights.medium), color: triggerStyle.color }}>
                {item.title}
              </span>
            ) : null}
          </div>
        </div>
      </Link>
    )
  }

  return (
    <div style={{ marginBottom: spacing['4'] }}>
      <button
        type='button'
        onClick={() => setOpenGroups({ ...openGroups, [item.id]: !isExpanded })}
        style={triggerStyle}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing['12'] }}>
          <Icon size={20} color={isChildActive ? colors.brandPrimary : colors.textSecondary} />
          {isSidebarOpen ? (
            <span style={{ fontSize: typography.sm, fontWeight: Number(fontWeights.medium), color: triggerStyle.color }}>
              {item.title}
            </span>
          ) : null}
        </div>
        {isSidebarOpen && hasChildren ? (
          <span style={{ marginInlineStart: spacing['8'] }}>
            {isExpanded ? <ChevronDown size={16} color={colors.textSecondary} /> : <ChevronRight size={16} color={colors.textSecondary} />}
          </span>
        ) : null}
      </button>

      {isSidebarOpen && hasChildren ? (
        <div
          style={{
            maxHeight: isExpanded ? 600 : 0,
            opacity: isExpanded ? 1 : 0,
            overflow: 'hidden',
            transition: 'max-height 220ms cubic-bezier(0.16, 1, 0.3, 1), opacity 180ms ease',
          }}
        >
          <div
            style={{
              marginInlineStart: spacing['16'],
              marginTop: spacing['4'],
              display: 'grid',
              gap: spacing['4'],
              borderInlineStart: `1px solid ${colors.border}`,
              paddingInlineStart: spacing['8'],
            }}
          >
            {item.items!.map((child) => (
              <SidebarItem
                key={child.id}
                item={child}
                isSidebarOpen={isSidebarOpen}
                pathname={pathname}
                openGroups={openGroups}
                setOpenGroups={setOpenGroups}
                depth={depth + 1}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
