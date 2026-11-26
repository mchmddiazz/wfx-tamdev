import React from 'react';
import { render, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../ThemeContext';

jest.mock('../../lib/supabase', () => {
  const upsertMock = jest.fn().mockResolvedValue({ data: [], error: null });
  return {
    supabase: {
      from: jest.fn(() => ({ upsert: upsertMock })),
    },
    __upsertMock: upsertMock,
  };
});

const TestComponent = () => {
  const {
    theme,
    toggleTheme,
    activeThemeName,
    themeDraft,
    saveDraft,
    publishTheme,
  } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={toggleTheme} data-testid="toggle">toggle</button>
      <span data-testid="activeName">{activeThemeName}</span>
      <span data-testid="draft">{JSON.stringify(themeDraft)}</span>
      <button onClick={() => saveDraft({ foo: 'bar' })} data-testid="save">save</button>
      <button onClick={() => publishTheme()} data-testid="publish">publish</button>
    </div>
  );
};

describe('ThemeContext enhancements', () => {
  it('provides toggleTheme functionality', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    const themeSpan = getByTestId('theme');
    expect(themeSpan.textContent).toBe('dark');
    act(() => {
      getByTestId('toggle').click();
    });
    expect(themeSpan.textContent).toBe('light');
  });

  it('saves draft via Supabase and updates state', async () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    const saveBtn = getByTestId('save');
    await act(async () => {
      saveBtn.click();
    });
    const draftSpan = getByTestId('draft');
    expect(draftSpan.textContent).toBe(JSON.stringify({ foo: 'bar' }));
    const { __upsertMock } = require('../../lib/supabase');
    expect(__upsertMock).toHaveBeenCalledWith({ name: 'dark', draft: { foo: 'bar' } });
  });

  it('publishes theme via Supabase', async () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    const saveBtn = getByTestId('save');
    await act(async () => {
      saveBtn.click();
    });
    const publishBtn = getByTestId('publish');
    await act(async () => {
      publishBtn.click();
    });
    const { __upsertMock } = require('../../lib/supabase');
    expect(__upsertMock).toHaveBeenCalledWith({ name: 'dark', theme: { foo: 'bar' } });
  });
});
