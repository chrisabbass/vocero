import React from 'react';
import { Target, Heart, Sparkles, ChevronDown } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export type Personality = 'direct' | 'friendly' | 'enthusiastic';

interface ToneSelectorProps {
  personality: Personality;
  onPersonalityChange: (value: Personality) => void;
  disabled?: boolean;
}

const ToneSelector = ({ personality, onPersonalityChange, disabled }: ToneSelectorProps) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium text-gray-700">Choose your tone</span>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </div>
      </div>
      <ToggleGroup 
        type="single" 
        value={personality}
        onValueChange={(value: Personality) => value && onPersonalityChange(value)}
        className="justify-center"
        disabled={disabled}
      >
        <ToggleGroupItem 
          value="direct" 
          aria-label="Direct tone" 
          className={`flex items-center gap-2 transition-all ${personality === 'direct' ? 'bg-primary text-primary-foreground shadow-md scale-105' : ''}`}
        >
          <Target className="h-4 w-4" />
          <span>Direct</span>
        </ToggleGroupItem>
        <ToggleGroupItem 
          value="friendly" 
          aria-label="Friendly tone" 
          className={`flex items-center gap-2 transition-all ${personality === 'friendly' ? 'bg-primary text-primary-foreground shadow-md scale-105' : ''}`}
        >
          <Heart className="h-4 w-4" />
          <span>Friendly</span>
        </ToggleGroupItem>
        <ToggleGroupItem 
          value="enthusiastic" 
          aria-label="Enthusiastic tone" 
          className={`flex items-center gap-2 transition-all ${personality === 'enthusiastic' ? 'bg-primary text-primary-foreground shadow-md scale-105' : ''}`}
        >
          <Sparkles className="h-4 w-4" />
          <span>Enthusiastic</span>
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};

export default ToneSelector;