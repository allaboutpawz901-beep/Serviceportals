'use client';

import React, { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App runtime error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white text-black text-center font-sans">
      <div className="w-12 h-12 border border-black bg-black text-white flex items-center justify-center font-bold text-lg mb-4">
        !
      </div>
      <h1 className="text-xl font-bold uppercase tracking-tight mb-2">Something Went Wrong</h1>
      <p className="text-sm text-neutral-600 max-w-md mb-6">
        An unexpected error occurred while loading this view.
      </p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-black text-white border border-black text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors cursor-pointer"
      >
        Try Again
      </button>
    </div>
  );
}
