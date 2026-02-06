"use client"; // ✅ THIS IS THE FIX

export default function Loading() {
  return (
    <>
      {/* This style block injects the shimmer animation */}
      <style jsx global>{`
        @keyframes shimmer-effect {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .shimmer-bg {
          position: relative;
          overflow: hidden;
          background-color: #e5e7eb; /* Base color of the skeleton */
        }
        .shimmer-bg::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
          animation: shimmer-effect 1.5s infinite linear;
        }
      `}</style>

      <div className="bg-gray-50 min-h-screen pb-10">
        
        {/* 1. Fake Sticky Search Bar */}
        <div className="sticky top-[70px] z-40 bg-white px-4 py-3 border-b border-gray-100">
          <div className="h-10 rounded-lg w-full shimmer-bg" />
        </div>

        {/* 2. Banners Layout */}
        <div className="flex flex-col md:flex-row gap-4 p-4">
          <div className="hidden md:block w-[250px] h-[350px] rounded-lg shrink-0 shimmer-bg" />
          <div className="flex-1 h-[200px] md:h-[350px] rounded-lg shimmer-bg" />
        </div>

        {/* 3. Subcategories Row */}
        <div className="bg-white py-4 border-b border-gray-100">
            <div className="h-6 w-40 rounded mb-4 ml-4 shimmer-bg" />
            <div className="flex gap-4 overflow-hidden px-4">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2 shrink-0">
                <div className="w-20 h-20 rounded-full shimmer-bg" />
                <div className="w-16 h-3 rounded shimmer-bg" />
                </div>
            ))}
            </div>
        </div>

        {/* 4. Promoted Products Slider */}
        <div className="mt-4 bg-white py-4 px-4 border-t-8 border-gray-100">
          <div className="h-6 w-32 rounded mb-4 shimmer-bg" />
          <div className="flex gap-3 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-[160px] shrink-0">
                <div className="h-[150px] rounded-lg shimmer-bg" />
                <div className="mt-2 h-4 w-full rounded shimmer-bg" />
                <div className="mt-2 h-4 w-3/4 rounded shimmer-bg" />
              </div>
            ))}
          </div>
        </div>

        {/* 5. Popular Products Grid */}
        <div className="mt-4 bg-white py-4 px-4 border-t-8 border-gray-100">
          <div className="h-6 w-48 rounded mb-4 shimmer-bg" />
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-full">
                <div className="h-[180px] rounded-lg shimmer-bg" />
                <div className="mt-2 h-4 w-full rounded shimmer-bg" />
                <div className="mt-2 h-4 w-3/4 rounded shimmer-bg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}