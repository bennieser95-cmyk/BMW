export interface NavLink {
  label: string
  href: string
}

export interface NavGroup {
  title?: string
  links: NavLink[]
}

/** Top-level navigation entry: a plain link or a trigger for a mega-menu panel. */
export interface NavItem {
  id: string
  label: string
  href?: string
  groups?: NavGroup[]
}

export interface SiteHeaderLabels {
  mainNav: string
  mobileNav: string
  openMenu: string
  closeMenu: string
  homeLink: string
  search: string
  language: string
}
