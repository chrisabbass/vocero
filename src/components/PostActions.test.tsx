import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils';
import PostActions from './PostActions';

describe('PostActions', () => {
  const mockText = 'Test post content';

  beforeEach(() => {
    vi.spyOn(navigator.clipboard, 'writeText').mockImplementation(() => Promise.resolve());
  });

  it('renders save button only for non-saved posts', () => {
    const { rerender } = renderWithProviders(
      <PostActions
        textToShare={mockText}
        onSave={() => {}}
        isSavedPost={false}
      />
    );

    expect(screen.getByText('Save')).toBeInTheDocument();

    rerender(
      <PostActions
        textToShare={mockText}
        onSave={() => {}}
        isSavedPost={true}
      />
    );

    expect(screen.queryByText('Save')).not.toBeInTheDocument();
  });

  it('copies text to clipboard when copy button is clicked', async () => {
    renderWithProviders(
      <PostActions
        textToShare={mockText}
        onSave={() => {}}
        isSavedPost={false}
      />
    );

    const copyButton = screen.getByText('Copy');
    await fireEvent.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockText);
  });
});