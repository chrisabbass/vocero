import React from 'react';

export const LoginFeatures: React.FC<{ from: string }> = ({ from }) => {
  return (
    <div className="space-y-4 mb-6">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
          <span className="text-purple-600">1</span>
        </div>
        <p className="text-sm">Track performance across social platforms</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
          <span className="text-purple-600">2</span>
        </div>
        <p className="text-sm">View detailed engagement metrics</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
          <span className="text-purple-600">3</span>
        </div>
        <p className="text-sm">Get insights on your best performing content</p>
      </div>
    </div>
  );
};