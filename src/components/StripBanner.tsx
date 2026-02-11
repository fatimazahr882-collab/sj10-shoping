// src/components/StripBanner.tsx
import Image from 'next/image';
import Link from 'next/link';

export default function StripBanner() {
  return (
    // CLASS EXPLANATION:
    // `hidden`: Hides the component by default (on mobile).
    // `md:block`: At the "medium" breakpoint (768px and up), it changes the display to "block", making it visible.
    <div className="strip-banner-container hidden md:block w-full bg-white mb-4">
      <Link href="/campaign/ramadan" className="block w-full relative">
        <Image
          src="/banners/strip-banner.webp"
          alt="Grand Ramadan Bazaar"
          width={1200}
          height={120}
          className="w-full h-auto object-cover"
          priority={true}
          unoptimized={true}
        />
      </Link>
    </div>
  );
}