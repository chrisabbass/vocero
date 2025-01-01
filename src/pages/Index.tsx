import React, { Suspense } from "react";
import VoiceRecorder from "@/components/VoiceRecorder";
import LoadingSpinner from "@/components/LoadingSpinner";
import { usePostManagement } from "@/hooks/usePostManagement";

const Index = () => {
  console.log('Rendering Index page'); // Debug log
  
  return (
    <div className="min-h-screen bg-slate-50">
      <Suspense fallback={<LoadingSpinner />}>
        <VoiceRecorder />
      </Suspense>
    </div>
  );
};

export default Index;