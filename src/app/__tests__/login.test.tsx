import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'

// Mock next-auth signIn
vi.mock('next-auth/react', () => ({ signIn: vi.fn() }))
// Mock next/navigation useRouter
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }))

import LoginPage from '../login/page'
import { signIn } from 'next-auth/react'

describe('Login page', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          ok: true,
          database: 'connected',
          userCount: 1,
          hint: 'Users exist',
        }),
      })
    )
  })

  it('calls signIn and redirects on success', async () => {
    vi.mocked(signIn).mockResolvedValue({ ok: true, error: undefined, status: 200, url: null })
    render(<LoginPage />)

    await waitFor(() => {
      expect(screen.queryByText(/Checking server mode/)).not.toBeInTheDocument()
    })

    const email = screen.getByLabelText(/Email/i)
    const password = screen.getByLabelText(/Password/i)
    const button = screen.getByRole('button', { name: /Continue/i })

    await userEvent.type(email, 'admin@example.com')
    await userEvent.type(password, 'admin')
    await userEvent.click(button)

    expect(signIn).toHaveBeenCalled()
  })
})
