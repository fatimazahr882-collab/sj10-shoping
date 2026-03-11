"use client";
import Image from 'next/image';
import Link from 'next/link';

export default function MobileStripBanner() {
  return (
    <div className="mobile-strip-only">
      <Link href="/explore" className="block w-full">
        <Image
          src="/banners/mobile-animated-strip.gif" 
          alt="SJ10 Mobile Promotion"
          width={1000}
          height={280}
          className="w-full h-auto block"
          priority={true}
          unoptimized={true}
        />
      </Link>

      <style jsx>{`
        /* Show on mobile by default */
        .mobile-strip-only {
          display: block;
          width: 100%;
          margin: 10px 0;
        }

        /* Hide on desktop */
        @media (min-width: 768px) {
          .mobile-strip-only {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}