import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Home from '../page'

describe('Home page', () => {
  it('renders hero, value section, and login link', () => {
    render(<Home />)
    expect(screen.getByText(/Capture more leads/i)).toBeInTheDocument()
    const signInLinks = screen.getAllByRole("link", { name: /^Sign in$/i })
    expect(signInLinks.length).toBeGreaterThan(0)
    signInLinks.forEach((el) => expect(el).toHaveAttribute("href", "/login"))
    expect(screen.getByRole('heading', { name: /Turn chats into revenue/i })).toBeInTheDocument()
  })
})
