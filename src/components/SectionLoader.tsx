"use client";
import React from 'react';

export default function SectionLoader({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="w-full py-8 px-4 bg-white border-t-8 border-gray-100">
      <div className="h-6 bg-gray-200 rounded w-48 mb-6 animate-pulse"></div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="aspect-square w-full bg-gray-200 rounded-xl animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  );
}