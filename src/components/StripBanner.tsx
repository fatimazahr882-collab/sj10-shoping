"use client";
import Image from 'next/image';
import Link from 'next/link';

export default function StripBanner() {
  return (
    <div className="desktop-strip-only">
      <Link href="/explore" className="block w-full">
        <Image
          src="/banners/animated-strip.gif" 
          alt="SJ10 Animated Promotion"
          width={1200}
          height={170}
          className="w-full h-auto block"
          priority={true}
          unoptimized={true}
        />
      </Link>

      <style jsx>{`
        /* This hides the desktop banner on everything less than 768px BEFORE React loads */
        .desktop-strip-only {
          display: none; 
        }

        /* Only show on tablets/desktop */
        @media (min-width: 768px) {
          .desktop-strip-only {
            display: block !important;
            width: 100%;
            margin: 15px 0;
          }
        }
      `}</style>
    </div>
  );
}