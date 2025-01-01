import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils';
import RecordingSection from './RecordingSection';

describe('RecordingSection', () => {
  it('shows paywall when recording count is >= 3', () => {
    const mockShowPaywall = vi.fn();
    
    renderWithProviders(
      <RecordingSection
        isGenerating={false}
        onTranscriptGenerated={() => {}}
        recordingCount={3}
        onShowPaywall={mockShowPaywall}
      />
    );

    const recordButton = screen.getByRole('button');
    fireEvent.click(recordButton);
    
    expect(mockShowPaywall).toHaveBeenCalled();
  });

  it('shows loading spinner when generating', () => {
    renderWithProviders(
      <RecordingSection
        isGenerating={true}
        onTranscriptGenerated={() => {}}
        recordingCount={0}
        onShowPaywall={() => {}}
      />
    );

    expect(screen.getByText('Generating variations...')).toBeInTheDocument();
  });
});