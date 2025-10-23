import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import AddStockForm from '@/components/AddStockForm';

describe('AddStockForm', () => {
  it('blocks non-positive weight', async () => {
    render(<AddStockForm users={['a@example.com','b@example.com']} />);
    fireEvent.change(screen.getByLabelText(/Price\/kg/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/Weight/i), { target: { value: '0' } });
    fireEvent.change(screen.getByLabelText(/Purchase date/i), { target: { value: '2025-01-01' } });
    fireEvent.change(screen.getByLabelText(/Purchased by/i), { target: { value: 'a@example.com' } });
    fireEvent.change(screen.getByLabelText(/Payment/i), { target: { value: 'cash' } });

    fireEvent.submit(screen.getByRole('button', { name: /add stock/i }));
    await waitFor(() => {
      expect(screen.getByText(/weight > 0/i)).toBeInTheDocument();
    });
  });
});

