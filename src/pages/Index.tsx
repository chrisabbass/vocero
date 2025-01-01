import React, { Suspense } from "react";
import VoiceRecorder from "@/components/VoiceRecorder";
import LoadingSpinner from "@/components/LoadingSpinner";

const Index = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Suspense fallback={<LoadingSpinner />}>
        <VoiceRecorder />
      </Suspense>
    </div>
  );
};

export default Index;