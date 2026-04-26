import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { Input } from '../input'

describe('Input', () => {
  it('updates value on change', async () => {
    render(<Input placeholder="name" />)
    const input = screen.getByPlaceholderText('name') as HTMLInputElement
    await userEvent.type(input, 'Hello')
    expect(input.value).toBe('Hello')
  })
})
