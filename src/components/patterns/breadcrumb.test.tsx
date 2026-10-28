import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { describe, expect, it } from 'vitest'

import { Breadcrumb } from './breadcrumb'

const items = [
  { label: 'Start', href: '/de-de' },
  { label: 'Modelle', href: '/de-de/modelle' },
  { label: 'Aurora </script>' },
]

describe('Breadcrumb', () => {
  it('should mark the last item as current page when rendered', () => {
    render(<Breadcrumb items={items} label="Brotkrumen" baseUrl="https://bavaria.example" />)
    expect(screen.getByRole('navigation', { name: 'Brotkrumen' })).toBeInTheDocument()
    expect(screen.getByText('Aurora </script>')).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Modelle' })).toHaveAttribute('href', '/de-de/modelle')
  })

  it('should emit escaped BreadcrumbList JSON-LD when rendered', () => {
    const { container } = render(
      <Breadcrumb items={items} label="Brotkrumen" baseUrl="https://bavaria.example" />,
    )
    const script = container.querySelector('script[type="application/ld+json"]')
    expect(script?.innerHTML).not.toContain('</script>')
    const data = JSON.parse(script?.textContent ?? '{}') as {
      itemListElement: Array<{ position: number; item?: string }>
    }
    expect(data.itemListElement[1]).toMatchObject({
      position: 2,
      item: 'https://bavaria.example/de-de/modelle',
    })
  })

  it('should have no axe violations when rendered', async () => {
    const { container } = render(
      <Breadcrumb items={items} label="Brotkrumen" baseUrl="https://bavaria.example" />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
