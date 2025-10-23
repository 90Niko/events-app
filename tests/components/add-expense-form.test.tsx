import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import AddExpenseForm from '@/components/AddExpenseFormWithCategories';

describe('AddExpenseFormWithCategories', () => {
  it('shows error for negative amount', async () => {
    render(<AddExpenseForm events={[{ id: '1', name: 'Evt' }]} />);
    fireEvent.change(screen.getByLabelText(/Event/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: 'Food' } });
    fireEvent.change(screen.getByLabelText(/Amount/i), { target: { value: '-1' } });

    fireEvent.submit(screen.getByRole('button', { name: /add expense/i }));
    await waitFor(() => {
      expect(screen.getByText(/non-negative/i)).toBeInTheDocument();
    });
  });
});

