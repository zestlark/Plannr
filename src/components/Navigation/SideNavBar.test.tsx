import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SideNavBar } from './SideNavBar';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

describe('SideNavBar', () => {
  it('renders navigation tabs correctly', () => {
    render(
      <MemoryRouter initialEntries={['/p/123']}>
        <Routes>
          <Route path="/p/:planId/*" element={<SideNavBar isOpen={true} setIsOpen={() => {}} />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('People')).toBeInTheDocument();
    expect(screen.getByText('Expense Summary')).toBeInTheDocument();
    expect(screen.getByText('Data Portability')).toBeInTheDocument();
  });

  it('is hidden when isOpen is false', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/p/123']}>
        <Routes>
          <Route path="/p/:planId/*" element={<SideNavBar isOpen={false} setIsOpen={() => {}} />} />
        </Routes>
      </MemoryRouter>
    );

    const nav = container.querySelector('nav');
    expect(nav?.className).toContain('-translate-x-full');
  });
});
