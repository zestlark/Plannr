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
  });
});
