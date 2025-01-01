import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface VariationsSectionProps {
  variations: string[];
  selectedVariation: string;
  onVariationChange: (value: string) => void;
  transcript: string;
  onTranscriptChange: (value: string) => void;
  isGenerating: boolean;
}

const VariationsSection = ({
  variations,
  selectedVariation,
  onVariationChange,
  transcript,
  onTranscriptChange,
  isGenerating
}: VariationsSectionProps) => {
  if (isGenerating) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        <span className="ml-2">Generating variations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {variations.length > 0 ? (
        <>
          <h2 className="font-semibold text-xl text-center mx-auto mb-6 text-gray-800">Pick your post</h2>
          <RadioGroup 
            value={selectedVariation} 
            onValueChange={onVariationChange}
            className="grid grid-cols-1 gap-4"
          >
            {variations.map((variation, index) => (
              <Card 
                key={index} 
                className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedVariation === variation ? 'ring-2 ring-primary shadow-lg' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <RadioGroupItem value={variation} id={`variation-${index}`} />
                  <Label 
                    htmlFor={`variation-${index}`} 
                    className="text-sm leading-relaxed cursor-pointer flex-1"
                  >
                    {variation}
                  </Label>
                </div>
              </Card>
            ))}
          </RadioGroup>
        </>
      ) : (
        <Textarea
          value={transcript}
          onChange={(e) => onTranscriptChange(e.target.value)}
          className="min-h-[150px] p-4"
          placeholder="Your transcribed text will appear here..."
        />
      )}
    </div>
  );
};

export default VariationsSection;