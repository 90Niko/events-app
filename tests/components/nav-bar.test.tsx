import { render, screen } from '@testing-library/react';
import React from 'react';
import NavBar from '@/components/NavBar';

describe('NavBar', () => {
  it('renders main nav icons with aria-labels', () => {
    render(<NavBar />);
    expect(screen.getByLabelText(/New Event/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Upcoming Events/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Past Events/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Expenses/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Income/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Stock/i)).toBeInTheDocument();
  });
});

