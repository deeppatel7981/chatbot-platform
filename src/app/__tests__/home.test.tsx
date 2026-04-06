import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Home from '../page'

describe('Home page', () => {
  it('renders hero, value section, and login link', () => {
    render(<Home />)
    expect(screen.getByText(/your team can trust/i)).toBeInTheDocument()
    expect(screen.getByText(/Sign in to dashboard/i)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Turn chats into revenue/i })).toBeInTheDocument()
  })
})
