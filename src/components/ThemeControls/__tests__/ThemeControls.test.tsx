import React from 'react';
import { render, act } from '@testing-library/react';
import { ThemeProvider } from '../../contexts/ThemeContext';
import ThemeControls from '../ThemeControls';

// Mock supabase
jest.mock('../../lib/supabase', () => {
  const upsertMock = jest.fn().mockResolvedValue({ data: [], error: null });
  return {
    supabase: {
      from: jest.fn(() => ({ upsert: upsertMock })),
    },
    __upsertMock: upsertMock,
  };
});

describe('ThemeControls component', () => {
  it('calls saveDraft and publishTheme on button clicks', async () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <ThemeControls />
      </ThemeProvider>
    );

    const saveBtn = getByTestId('save-draft');
    await act(async () => {
      saveBtn.click();
    });

    const { __upsertMock } = require('../../lib/supabase');
    expect(__upsertMock).toHaveBeenCalledWith({ name: 'dark', draft: { foo: 'bar' } });

    const publishBtn = getByTestId('publish-theme');
    await act(async () => {
      publishBtn.click();
    });
    expect(__upsertMock).toHaveBeenCalledWith({ name: 'dark', theme: { foo: 'bar' } });
  });
});
