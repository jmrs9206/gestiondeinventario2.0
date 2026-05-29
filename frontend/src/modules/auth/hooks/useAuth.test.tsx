import React from 'react';
import { useAuth } from './useAuth';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

function TestComponent() {
  useAuth();
  return null;
}

const originalError = console.error;

describe('useAuth hook', () => {
  it('throws an error when used outside AuthProvider', () => {
    console.error = () => {}; // suppress error print
    expect(() => render(<TestComponent />)).toThrow('useAuth must be used within an AuthProvider');
    console.error = originalError; // restore console error
  });
});
