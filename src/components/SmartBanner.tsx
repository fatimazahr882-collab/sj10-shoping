"use client";
import Image from 'next/image';
import Link from 'next/link';

export default function SmartBanner() {
  return (
    <div className="smart-banner-root">
      
      {/* Desktop Version */}
      <div className="banner-desktop">
        <Link href="/explore">
          <Image
            src="/banners/animated-strip.gif"
            alt="SJ10 Desktop Sale"
            width={1200}
            height={150}
            className="banner-img"
            priority={true}
            unoptimized={true}
          />
        </Link>
      </div>

      {/* Mobile Version */}
      <div className="banner-mobile">
        <Link href="/explore">
          <Image
            src="/banners/mobile-animated-strip.gif"
            alt="SJ10 Mobile Sale"
            width={1000}
            height={250}
            className="banner-img"
            priority={true}
            unoptimized={true}
          />
        </Link>
      </div>

      <style jsx>{`
        .smart-banner-root { width: 100%; margin: 15px 0; }
        .banner-img { width: 100%; height: auto; display: block; }
        
        .banner-desktop { display: none; }
        .banner-mobile { display: block; }
        
        @media (min-width: 768px) {
          .banner-desktop { display: block; max-width: 1200px; margin: 0 auto; border-radius: 12px; overflow: hidden; }
          .banner-mobile { display: none; }
        }
      `}</style>
    </div>
  );
}