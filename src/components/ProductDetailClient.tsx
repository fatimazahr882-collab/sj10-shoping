"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import ProductCard, { type Product } from './ProductCard';
import SjLoader from './SjLoader';

// --- Types ---
interface NavigatorWithShare {
  canShare?: (data?: ShareData) => boolean;
  share?: (data: ShareData) => Promise<void>;
}

export type Variant = { 
  id: string | number; 
  name?: string; 
  price: string; 
  discounted_price?: string; 
  sku?: string; 
  custom_color?: string; 
  custom_size?: string; 
  image_url?: string;
  [key: string]: any; 
};

type Supplier = { 
  id: string; 
  name: string; 
  profile_pic?: string | null; 
  followers_count?: number; 
  average_rating?: number;
  total_products?: number;
  verified_status?: string; 
  is_following?: boolean; 
};

type Review = {
    id: string;
    user_name: string;
    rating: number;
    comment: string;
    created_at: string;
    image_url?: string | null;
    image_urls?: string | null;
    user_avatar?: string | null;
};

type ProductWithDetails = Product & {
  description: string;
  video_url?: string;
  variants: Variant[];
  supplier: Supplier | null;
  supplier_id?: string | number;
  quantity: number;
  attributes?: string | Record<string, any>;
  is_favorite?: boolean;
  reviews?: Review[];
  total_reviews_count?: number;
  avg_rating?: number;
  imported_region?: string | null;
  sku?: string;
  discount_percentage?: number;
  is_promoted?: boolean;
  discount_label?: string | null;
  discount?: {
    id: string;
    name: string;
    discount_percentage: number;
    type: 'percentage' | 'fixed';
    valid_until?: string;
  } | null;
  stats?: {
    views: number;
    favorites: number;
  };
  category_info?: {
    id?: number | string;
    name?: string;
    slug?: string;
    parent_name?: string;
    parent_slug?: string;
  };
  warranty?: string;
};

type Props = {
  product: ProductWithDetails;
  relatedProducts: Product[];
  sellerProducts: Product[];
};

const PLACEHOLDER_IMAGE = '/placeholder.jpg';
const OFFICIAL_SUPPLIER_ID = '854ee7de-425b-4057-a8f7-eb310491c6b0';

// Pakistan major cities for delivery dropdown
const PAKISTANI_CITIES =[
  "Islamabad", "Karachi", "Lahore", "Rawalpindi", "Peshawar", "Quetta", 
  "Multan", "Faisalabad", "Gujranwala", "Sialkot", "Hyderabad", "Sukkur", "Bahawalpur"
];

// --- Helpers ---
const getYouTubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

const getInitials = (name: string) => {
    if (!name) return "S";
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

const getToken = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('user_token') || localStorage.getItem('token') || localStorage.getItem('authToken');
};

const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-GB', options);
};

const truncateTitle = (title: string, maxLength: number = 40) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + '...';
};

// --- Sub-Components ---
const StarRatingHTML = ({ rating, reviewCount }: { rating: number | null; reviewCount: number | null }) => {
  if (!rating || rating === 0) return <div style={{ height: '21px', marginTop: '5px' }}></div>;
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '5px 0' }}>
      <div className="star-rating" style={{ color: '#ffc107', fontSize: '15px' }}>
        {[...Array(fullStars)].map((_, i) => <i key={`full-${i}`} className="fas fa-star"></i>)}
        {halfStar && <i className="fas fa-star-half-alt"></i>}
        {[...Array(emptyStars)].map((_, i) => <i key={`empty-${i}`} className="far fa-star"></i>)}
      </div>
      {reviewCount != null && reviewCount > 0 && <span className="review-count" style={{ fontSize: '13px', color: '#666', fontWeight: '500' }}>({reviewCount} reviews)</span>}
    </div>
  );
};

const VerificationBadge = ({ status }: { status?: string }) => {
    const isVerified = status === 'verified' || status === 'true';
    if (isVerified) {
        return (
            <div className="verified-badge-container animated-shine">
                <i className="fas fa-check-circle"></i>
                <span>Verified Supplier</span>
            </div>
        );
    } else {
        return (
            <div className="unverified-badge-container">
                <i className="fas fa-times-circle"></i>
                <span>Unverified</span>
            </div>
        );
    }
};

const OfficialAccountBadge = () => {
    return (
        <div className="official-badge-container animated-shine">
            <i className="fas fa-crown" style={{ fontSize: '12px', marginBottom:'1px' }}></i>
            <span>Official Store</span>
        </div>
    );
};

const DiscountBadge = ({ discount, label }: { discount?: any, label?: string }) => {
    const text = label || (discount ? (discount.name || `${discount.discount_percentage}% OFF`) : null);
    if (!text) return null;
    return (
        <div className="discount-badge-card">
            <i className="fas fa-tag"></i> <span>{text}</span>
        </div>
    );
};

const PromotedLabel = () => (
    <span className="promoted-label">
        <i className="fas fa-bolt"></i> Promoted
    </span>
);

export default function ProductDetailClient({ product, relatedProducts, sellerProducts }: Props) {
  const router = useRouter();
  
  // UI States
  const[activeAccordion, setActiveAccordion] = useState<string | null>('details');
  const[isMediaLoading, setIsMediaLoading] = useState(false); 
  const[isImageModalOpen, setIsImageModalOpen] = useState(false);
  const[zoomImageSrc, setZoomImageSrc] = useState<string>('');
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const[isSharing, setIsSharing] = useState(false);
  const[isDescriptionCopied, setIsDescriptionCopied] = useState(false);
  const [selectedReviewImage, setSelectedReviewImage] = useState<string | null>(null);
  
  // Advanced Location State
  const[deliveryCity, setDeliveryCity] = useState("Islamabad");
  const [detailedLocation, setDetailedLocation] = useState("Detecting location...");
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // Data/Action States
  const [isFollowing, setIsFollowing] = useState(product.supplier?.is_following || false);
  const [followerCount, setFollowerCount] = useState(product.supplier?.followers_count || 0);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  
  // Favorites & Stats
  const [isFavorite, setIsFavorite] = useState(product.is_favorite || false);
  const [favoriteCount, setFavoriteCount] = useState(product.stats?.favorites || 0);
  const [viewCount, setViewCount] = useState(product.stats?.views || 0);
  
  const [toast, setToast] = useState<{ show: boolean, message: string, icon: string, color: string }>({ 
      show: false, message: '', icon: '', color: '' 
  });

  const showToast = (message: string, icon: string = 'fa-check-circle', color: string = '#00b862') => {
      setToast({ show: true, message, icon, color });
      setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  // --- Image Processing ---
  const images = useMemo(() => {
    try {
      let parsedImages: string[] =[];
      if (typeof product.image_urls === 'string' && product.image_urls.startsWith('[')) {
        parsedImages = JSON.parse(product.image_urls);
      } else if (Array.isArray(product.image_urls)) {
        parsedImages = product.image_urls;
      }
      return parsedImages.length > 0 ? parsedImages : [PLACEHOLDER_IMAGE];
    } catch (e) { return[PLACEHOLDER_IMAGE]; }
  }, [product.image_urls]);

  const mediaItems = useMemo(() => {
    const items = images.map(url => ({ type: 'image' as const, url }));
    if (product.video_url) {
        return[{ type: 'video' as const, url: product.video_url }, ...items];
    }
    return items;
  },[images, product.video_url]);

  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const activeMedia = mediaItems[activeMediaIndex] || mediaItems[0];

  const handleNextMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMediaIndex((prev) => (prev + 1) % mediaItems.length);
  };

  const handlePrevMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMediaIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);
  };

  const fetchUpdatedStats = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_PRODUCT_API_URL}/products/${product.id}/stats`);
      if (res.ok) {
        const stats = await res.json();
        setViewCount(stats.views);
        setFavoriteCount(stats.favorites);
      }
    } catch (error) { console.error("Stats Error", error); }
  };

  // 1. Smart IP Location Fetcher (On Load)
  useEffect(() => {
    const fetchIpLocation = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        if (data && data.country_code === 'PK' && data.city) {
          const detectedCity = data.city;
          if (PAKISTANI_CITIES.includes(detectedCity)) {
             setDeliveryCity(detectedCity);
          } else {
             setDeliveryCity("Islamabad");
          }
          setDetailedLocation(`${data.city}, ${data.region || 'Pakistan'}`);
        } else {
          setDeliveryCity("Islamabad");
          setDetailedLocation("Islamabad, Capital Territory");
        }
      } catch (e) {
        setDeliveryCity("Islamabad");
        setDetailedLocation("Islamabad, Pakistan");
      }
    };
    fetchIpLocation();
  },[]);

  // 2. Precision GPS & Reverse Geocoding Fetcher
  const handleDetectExactLocation = () => {
      if (!navigator.geolocation) {
          return showToast("Geolocation is not supported by your browser", "fa-exclamation-triangle", "#ff9800");
      }
      
      setIsDetectingLocation(true);
      setDetailedLocation("Pinpointing exact location...");
      
      navigator.geolocation.getCurrentPosition(async (position) => {
          try {
              const { latitude, longitude } = position.coords;
              const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
              const data = await res.json();
              
              if (data && data.address) {
                  const city = data.address.city || data.address.town || data.address.county || "";
                  const state = data.address.state || "";
                  const neighborhood = data.address.suburb || data.address.neighbourhood || data.address.residential || "";
                  
                  const matchedCity = PAKISTANI_CITIES.find(c => c.toLowerCase() === city.toLowerCase());
                  if (matchedCity) {
                      setDeliveryCity(matchedCity);
                  }

                  const detailsArray =[neighborhood, city, state].filter(Boolean);
                  setDetailedLocation(detailsArray.join(', '));
                  showToast("Precise location captured!", "fa-map-marker-alt", "#00b862");
              } else {
                  setDetailedLocation("Unable to determine detailed area.");
              }
          } catch (error) {
              setDetailedLocation("Location lookup failed.");
          } finally {
              setIsDetectingLocation(false);
          }
      }, (error) => {
          setIsDetectingLocation(false);
          setDetailedLocation(`${deliveryCity}, Pakistan`);
          showToast("Location permission denied", "fa-info-circle", "#ff9800");
      });
  };

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    
    // Check Follow Status
    if (product.supplier?.id) {
        fetch(`${process.env.NEXT_PUBLIC_PRODUCT_API_URL}/social/follow/status/${product.supplier.id}`, { 
            headers: { 'Authorization': `Bearer ${token}` } 
        })
        .then(res => res.json())
        .then(data => {
            if (data && typeof data.isFollowing === 'boolean') {
                setIsFollowing(data.isFollowing);
            }
        })
        .catch(e => console.error("Follow check failed", e));
    }

    // Check Favorite Status
    fetch(`${process.env.NEXT_PUBLIC_PRODUCT_API_URL}/social/favorite/status/${product.id}`, { 
        headers: { 'Authorization': `Bearer ${token}` } 
    })
    .then(res => res.json())
    .then(data => {
        if (data && typeof data.isFavorite === 'boolean') {
            setIsFavorite(data.isFavorite);
        }
    })
    .catch(e => console.error("Fav check failed", e));

  },[product.supplier?.id, product.id]);

  // View Counter & Initial Stats
  useEffect(() => {
    const init = async () => { 
      try { 
        await fetch(`${process.env.NEXT_PUBLIC_PRODUCT_API_URL}/products/${product.id}/view`, { method: 'POST' }); 
        await fetchUpdatedStats();
      } catch (e) {} 
    };
    init();
  },[product.id]);

  // --- Calculation ---
  const[selectedVariant, setSelectedVariant] = useState<Variant | null>(product.variants?.[0] || null);
  const ratingData = { avg_rating: product.avg_rating || null, review_count: product.total_reviews_count || null };
  const price = parseFloat(String(selectedVariant?.discounted_price || product.discounted_price || product.price));
  const originalPrice = parseFloat(String(selectedVariant?.price || product.price));
  const hasDiscount = price < originalPrice;
  const isOutOfStock = product.quantity <= 0;
  const discountPercentage = hasDiscount ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const displayDiscountLabel = product.discount_label || (hasDiscount ? `-${discountPercentage}%` : null);

  const regionFlag = useMemo(() => {
      if (!product.imported_region) return null;
      const region = product.imported_region.toLowerCase();
      if (region.includes('pakistan')) return { icon: '/pakistan.png', label: 'Pakistan' };
      if (region.includes('china')) return { icon: '/china.png', label: 'China' };
      return null;
  }, [product.imported_region]);

  const parsedAttributes = useMemo(() => {
      if (!product.attributes) return null;
      try { return typeof product.attributes === 'object' ? product.attributes : JSON.parse(product.attributes); } catch (e) { return null; }
  },[product.attributes]);

  const isOfficialSupplier = product.supplier?.id === OFFICIAL_SUPPLIER_ID;

  // --- Handlers ---
  const handleVisitStore = () => {
    const targetSupplierId = product.supplier?.id || product.supplier_id;
    if (targetSupplierId) {
        router.push(`/suppliers/${targetSupplierId}`);
    } else {
        alert("Supplier details are currently unavailable.");
    }
  };
  
  const handleAccordionClick = (itemName: string) => setActiveAccordion(prev => (prev === itemName ? null : itemName));
  const handleZoomImage = (src: string) => { setZoomImageSrc(src); setIsImageModalOpen(true); };
  
  const handleCopyDescription = async () => {
    try {
        const descText = product.description || "";
        const attrText = parsedAttributes ? Object.entries(parsedAttributes).map(([k, v]) => `${k}: ${v}`).join('\n') : "";
        const skuText = product.sku ? `SKU: ${product.sku}\n` : "";
        await navigator.clipboard.writeText(`${product.title}\n${skuText}\n${descText}\n\n${attrText}`);
        setIsDescriptionCopied(true); 
        setTimeout(() => setIsDescriptionCopied(false), 2000); 
        showToast("Description copied!", "fa-copy");
    } catch (e) { showToast("Failed to copy", "fa-exclamation-circle", "red"); }
  };

  const getLoginRedirectUrl = () => `/auth?view=login&redirect=${encodeURIComponent(window.location.href)}`;

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    if (!getToken()) { router.push(getLoginRedirectUrl()); return; }
    if (product.variants?.length && !selectedVariant) { showToast("Please select a variant option", "fa-exclamation-circle", "#ff9800"); return; }
    
    const params = new URLSearchParams();
    const currentSlug = typeof window !== 'undefined' ? window.location.pathname.split('/').pop() : null;
    params.set('productId', currentSlug || String(product.id));
    if (selectedVariant) params.set('variantId', String(selectedVariant.id));
    router.push(`/place-order?${params.toString()}`);
  };

  const handleFollow = async () => {
    if (!getToken()) { router.push(getLoginRedirectUrl()); return; }
    if (!product.supplier?.id || isFollowLoading) return;
    
    setIsFollowLoading(true);
    const previousState = isFollowing; 
    setIsFollowing(!isFollowing); 
    setFollowerCount(prev => !previousState ? prev + 1 : prev - 1);
    
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_PRODUCT_API_URL}/social/follow/${product.supplier.id}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` }
        });
        if (!res.ok) throw new Error("Action failed");
        showToast(!previousState ? "Following Supplier" : "Unfollowed Supplier", "fa-user-check");
    } catch (error) { 
        setIsFollowing(previousState); 
        setFollowerCount(product.supplier?.followers_count || 0); 
        showToast("Unable to follow.", "fa-times-circle", "#e91e63"); 
    } finally { setIsFollowLoading(false); }
  };

  const handleToggleFavorite = async () => {
      if (!getToken()) { router.push(getLoginRedirectUrl()); return; }
      
      const previousState = isFavorite; 
      setIsFavorite(!isFavorite);
      setFavoriteCount(prev => !previousState ? prev + 1 : prev - 1);
      
      if (!previousState) showToast("Added to Favorites", "fa-heart", "#e91e63");
      
      try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_PRODUCT_API_URL}/social/favorite/${product.id}`, {
              method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` }
          });
          if (!res.ok) throw new Error("Request failed");
          await fetchUpdatedStats();
      } catch (error) { 
          setIsFavorite(previousState); 
          setFavoriteCount(prev => !previousState ? prev - 1 : prev + 1);
          showToast("Could not save favorite", "fa-times-circle", "#e91e63"); 
      }
  };

  const handleShareButton = async () => {
      if (isSharing) return;
      setIsSharing(true);
      const shareText = `*${product.title}*\n\nPrice: Rs. ${price}\nSKU: ${product.sku || 'N/A'}\nOrder Here: ${window.location.href}`;
      try { await navigator.clipboard.writeText(shareText); } catch(e){}
      
      const files: File[] =[];
      try {
          const nav = navigator as NavigatorWithShare;
          if (nav.canShare) {
             for(let i=0; i < Math.min(images.length, 3); i++) {
                 const res = await fetch(images[i] + `?t=${Date.now()}-${i}`, { mode: 'cors' });
                 if(res.ok) files.push(new File([await res.blob()], `img_${i}.jpg`, { type: 'image/jpeg' }));
             }
          }
      } catch (e) {}

      const nav = navigator as NavigatorWithShare;
      if (nav.canShare && nav.canShare({ files }) && files.length > 0) {
        try { if (nav.share) await nav.share({ text: shareText, files }); } catch (e) {}
      } else if (nav.share) {
          try { await nav.share({ title: product.title, text: shareText, url: window.location.href }); } catch (e) {}
      }
      showToast("Link Copied!", "fa-copy", "#2196f3"); setIsSharing(false);
  };

  return (
    <>
      <style jsx global>{`
        .pdp-font { font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
        
        /* ✅ STICKY PAGE HEADER */
        .page-header { 
            position: sticky; 
            top: 70px; /* Sticking just below main nav */
            z-index: 50; 
            background: rgba(255,255,255,0.95); 
            backdrop-filter: blur(10px);
            border-bottom: 1px solid #eaeaea; 
            display: flex; 
            align-items: center; 
            padding: 12px 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.03);
        }

        /* ✅ BREADCRUMBS STYLING */
        .breadcrumbs-container {
            padding: 12px 20px;
            font-size: 13px;
            color: #777;
            background: #fafafa;
            border-bottom: 1px solid #f0f0f0;
            display: flex;
            align-items: center;
            gap: 8px;
            white-space: nowrap;
            overflow-x: auto;
            scrollbar-width: none;
            -webkit-overflow-scrolling: touch;
        }
        .breadcrumbs-container::-webkit-scrollbar { display: none; }
        .breadcrumb-link { color: #555; text-decoration: none; transition: color 0.2s; font-weight: 500; }
        .breadcrumb-link:hover { color: #00b862; }
        .breadcrumb-separator { color: #ccc; font-size: 10px; margin-top: 1px; }

        /* ✅ MODERN DESKTOP GRID LAYOUT */
        @media (min-width: 769px) {
            .pdp-desktop-layout { display: flex; align-items: flex-start; gap: 40px; padding: 30px 40px; max-width: 1400px; margin: 0 auto; }
            .pdp-left-column { flex: 0 0 45%; position: sticky; top: 130px; }
            .pdp-right-column { flex: 1; min-width: 0; }
            .pdp-bottom-bar { display: none !important; }
            .pdp-desktop-actions { display: block; margin-top: 30px; }
        }

        /* ✅ MOBILE RESPONSIVENESS AND BOTTOM BAR OVERLAP FIX */
        @media (max-width: 768px) {
            .pdp-desktop-layout { display: flex; flex-direction: column; padding: 15px; }
            .pdp-desktop-actions { display: none !important; }
            
            /* ADD EXTRA PADDING TO PREVENT CONTENT HIDING BEHIND BOTH NAV BARS */
            #product-detail-page { padding-bottom: 150px; } 
            
            /* FIXED MOBILE BOTTOM BAR - MOVED UP TO PREVENT OVERLAP */
            .pdp-bottom-bar { 
                display: flex; 
                position: fixed; 
                /* Set bottom to 65px so it floats precisely above your global app footer */
                bottom: 65px; 
                left: 0; 
                right: 0; 
                background: #ffffff; 
                padding: 12px 15px;
                box-shadow: 0 -4px 15px rgba(0,0,0,0.06); 
                z-index: 999; 
                border-top: 1px solid #eaeaea;
            }
        }

        /* ✅ BUTTON STYLING (Used on both mobile and desktop) */
        .pdp-action-buttons { display: flex; gap: 12px; width: 100%; align-items: center; }
        .share-now-btn {
            flex: 0 0 auto;
            padding: 14px 20px;
            background: #f0fdf4 !important;
            color: #00b862 !important;
            border: 1px solid #bbf7d0 !important;
            border-radius: 12px;
            font-weight: 700;
            font-size: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            cursor: pointer;
            transition: all 0.2s;
        }
        .share-now-btn:hover { background: #dcfce7 !important; transform: scale(1.02); }
        .buy-now-btn {
            flex: 1;
            padding: 14px 24px;
            background: linear-gradient(135deg, #00b862 0%, #009952 100%);
            color: white;
            border: none;
            border-radius: 12px;
            font-weight: 700;
            font-size: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            cursor: pointer;
            box-shadow: 0 6px 15px rgba(0, 184, 98, 0.25);
            transition: all 0.2s ease-in-out;
        }
        .buy-now-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0, 184, 98, 0.35); }
        .buy-now-btn:active:not(:disabled) { transform: translateY(0); }
        .buy-now-btn:disabled, .buy-now-btn.out-of-stock {
            background: #e0e0e0;
            color: #888;
            box-shadow: none;
            cursor: not-allowed;
            transform: none;
        }

        /* ✅ MAIN IMAGE & THUMBNAILS */
        .main-image-container { position: relative; width: 100%; height: 450px; background-color: #fafafa; border-radius: 16px; overflow: hidden; display: flex; align-items: center; justify-content: center; margin-bottom: 15px; border: 1px solid #eaeaea; }
        .pdp-main-image { width: 100%; height: 100%; object-fit: contain; display: block; mix-blend-mode: multiply; }
        @media (max-width: 768px) { .main-image-container { height: 350px; } }
        
        .thumbnail-container { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 8px; scrollbar-width: none; }
        .thumbnail-container::-webkit-scrollbar { display: none; }
        .thumbnail { width: 70px; height: 70px; border-radius: 12px; border: 2px solid transparent; overflow: hidden; position: relative; cursor: pointer; transition: all 0.2s; flex-shrink: 0; background: #fafafa; }
        .thumbnail.active { border-color: #00b862; box-shadow: 0 4px 10px rgba(0,184,98,0.2); }
        .video-thumbnail-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 20px; }

        /* ✅ TYPOGRAPHY & INFO */
        .header-title { font-size: 16px; font-weight: 600; margin-left: 12px; color: #333; }
        .title { font-size: 24px; font-weight: 800; line-height: 1.4; color: #1a1a1a; margin-bottom: 10px; }
        .price { font-size: 30px; font-weight: 900; color: #ff4747; display: flex; align-items: baseline; gap: 5px; }
        .original-price { font-size: 18px; text-decoration: line-through; color: #999; font-weight: 500; }
        
        /* ✅ BADGES */
        .verified-badge-container { display: inline-flex; align-items: center; gap: 6px; background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); color: #fff; padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; box-shadow: 0 4px 10px rgba(255, 165, 0, 0.3); margin-top: 5px; position: relative; overflow: hidden; }
        .official-badge-container { display: inline-flex; align-items: center; gap: 6px; background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); color: #fff; padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; box-shadow: 0 4px 10px rgba(30, 58, 138, 0.25); margin-top: 5px; position: relative; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); }
        .discount-badge-card { position: absolute; top: 12px; left: 12px; background: linear-gradient(135deg, #ff416c, #ff4b2b); color: white; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 800; z-index: 10; box-shadow: 0 4px 12px rgba(255, 75, 43, 0.3); animation: pulse 2s infinite; display: flex; align-items: center; gap: 6px; }
        .promoted-label { display: inline-flex; align-items: center; gap: 4px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 4px 12px; border-radius: 15px; font-size: 12px; font-weight: 700; box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3); }

        .animated-shine::after { content: ""; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent); animation: shine 2.2s infinite; }
        @keyframes shine { 0% { left: -100%; } 100% { left: 100%; } }
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
        
        .unverified-badge-container { display: inline-flex; align-items: center; gap: 6px; background: #f1f1f1; color: #777; border: 1px solid #ddd; padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-top: 5px; }

        /* ✅ VARIANTS HORIZONTAL SCROLL */
        .variants-scroll-container { display: flex; gap: 12px; overflow-x: auto; scrollbar-width: none; -webkit-overflow-scrolling: touch; padding-bottom: 8px; margin-top: 12px; }
        .variants-scroll-container::-webkit-scrollbar { display: none; }
        .option-btn { border: 1px solid #eaeaea; border-radius: 24px; background: #fff; cursor: pointer; transition: all 0.2s; padding: 8px 16px; font-size: 14px; color: #444; font-weight: 500; }
        .option-btn:hover { border-color: #ccc; }
        .option-btn.active { border-color: #00b862; color: #00b862; background: #f0fdf4; font-weight: 700; box-shadow: 0 4px 10px rgba(0,184,98,0.1); }

        /* ✅ ADVANCED PROFESSIONAL DELIVERY CARD */
        .delivery-card { border: 1px solid #eaeaea; border-radius: 16px; padding: 18px; background: #fff; margin: 25px 0; box-shadow: 0 4px 15px rgba(0,0,0,0.03); transition: box-shadow 0.3s; }
        .delivery-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.06); }
        .delivery-header { display: flex; align-items: center; justify-content: space-between; font-size: 15px; font-weight: 800; margin-bottom: 15px; color: #222; text-transform: uppercase; letter-spacing: 0.5px; }
        .delivery-header i.fa-map-marker-alt { color: #ff7f00; font-size: 18px; }
        
        .auto-detect-btn { background: #f0fdf4; color: #00b862; border: 1px solid #bbf7d0; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 5px; transition: all 0.2s; }
        .auto-detect-btn:hover { background: #00b862; color: #fff; }
        .auto-detect-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .city-select { width: 100%; padding: 12px 15px; border-radius: 10px; border: 1px solid #e0e0e0; font-size: 14px; margin-bottom: 8px; outline: none; background: #fbfbfb; color: #333; font-weight: 600; cursor: pointer; transition: all 0.2s; appearance: none; background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2300b862%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E"); background-repeat: no-repeat; background-position: right 15px top 50%; background-size: 12px auto; }
        .city-select:focus { border-color: #00b862; background-color: #fff; box-shadow: 0 0 0 3px rgba(0,184,98,0.1); }
        .detailed-location-text { font-size: 13px; color: #666; display: flex; align-items: flex-start; gap: 6px; margin-bottom: 20px; line-height: 1.4; }
        .detailed-location-text i { color: #00b862; margin-top: 2px; }

        .delivery-details-list { display: flex; flex-direction: column; gap: 16px; border-top: 1px dashed #eee; padding-top: 15px; }
        .delivery-item { display: flex; align-items: flex-start; gap: 14px; font-size: 14px; color: #444; }
        .delivery-item i { margin-top: 2px; font-size: 16px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: #f0fdf4; border-radius: 50%; color: #00b862; }
        .delivery-item .d-title { font-weight: 700; margin-bottom: 3px; color: #222; }
        .delivery-item .d-sub { font-size: 13px; color: #777; }

        /* ✅ SUPPLIER CARD & REVIEWS */
        .supplier-card-container { background: #fff; border: 1px solid #eaeaea; border-radius: 16px; padding: 20px; margin: 25px 0; box-shadow: 0 4px 15px rgba(0,0,0,0.02); }
        .supplier-profile-header { display: flex; align-items: center; gap: 15px; margin-bottom: 20px; }
        .supplier-avatar-large { position: relative; width: 56px; height: 56px; border-radius: 50%; overflow: hidden; background: linear-gradient(135deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
        .supplier-stats-row { display: flex; justify-content: space-between; gap: 10px; margin-bottom: 20px; background: #fafafa; padding: 15px; border-radius: 12px; }
        .stat-box { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
        .stat-value { font-size: 16px; font-weight: 800; color: #222; margin-bottom: 4px; }
        .stat-label { font-size: 12px; color: #777; font-weight: 500; display: flex; align-items: center; gap: 4px; }
        .supplier-actions-row { display: flex; gap: 12px; }
        .btn-supplier-action { flex: 1; padding: 12px; border-radius: 10px; font-weight: 700; font-size: 14px; cursor: pointer; transition: all 0.2s; border: none; }
        .btn-follow { background: #f0fdf4; color: #00b862; border: 1px solid #bbf7d0; }
        .btn-follow:hover { background: #dcfce7; }
        .btn-follow.following { background: #00b862; color: #fff; border-color: #00b862; }
        .btn-visit { background: #f5f5f5; color: #444; border: 1px solid #ddd; }
        .btn-visit:hover { background: #e0e0e0; }

        .review-card { background: #fff; border: 1px solid #eaeaea; border-radius: 16px; padding: 18px; margin-bottom: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.02); }
        
        /* ✅ ACCORDION & LISTS */
        .pdp-info-list { list-style: none; padding: 0; margin: 20px 0; border: 1px solid #eaeaea; border-radius: 16px; overflow: hidden; }
        .info-item-header { display: flex; align-items: center; padding: 18px 20px; background: #fafafa; cursor: pointer; font-weight: 700; font-size: 15px; color: #333; transition: background 0.2s; }
        .info-item-header:hover { background: #f0f0f0; }
        .info-item-header .icon { margin-right: 12px; color: #ff7f00; font-size: 18px; }
        .info-item-header .text { flex: 1; }
        .info-item-header .chevron { transition: transform 0.3s ease; color: #999; }
        .info-item.active .chevron { transform: rotate(180deg); }
        .info-item-content { max-height: 0; overflow: hidden; transition: max-height 0.3s ease, padding 0.3s ease; background: #fff; font-size: 14px; line-height: 1.6; color: #555; }
        .info-item.active .info-item-content { max-height: 2000px; padding: 20px; border-top: 1px solid #eaeaea; }

        .copy-desc-btn { margin-top: 15px; padding: 10px 18px; background: #f0fdf4; color: #00b862; border: 1px solid #bbf7d0; border-radius: 8px; font-size: 14px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s; }
        .copy-desc-btn:hover { background: #dcfce7; }
        .copy-desc-btn.copied { background: #00b862; color: white; border-color: #00b862; }

        /* ✅ RELATED PRODUCTS SLIDER */
        .pdp-related-section { margin-top: 50px; margin-bottom: 20px; padding: 0; overflow: visible; }
        .section-title { font-size: 20px; font-weight: 900; color: #1a1a1a; margin-bottom: 20px; border-left: 5px solid #ff7f00; padding-left: 12px; }
        .product-slider-container { display: flex; gap: 16px; overflow-x: auto; padding-bottom: 24px; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
        .slider-card { flex: 0 0 160px; scroll-snap-align: start; }
        @media (min-width: 768px) { .slider-card { flex: 0 0 220px; } }

        /* Helpers */
        .stats-row { display: flex; gap: 20px; margin: 15px 0; padding: 15px 0; border-top: 1px solid #eaeaea; border-bottom: 1px solid #eaeaea; }
        .stat-item { display: flex; align-items: center; gap: 6px; font-size: 14px; color: #666; }
        .stat-count { font-weight: 800; color: #222; margin-left: 2px; }
        .sku-display { background: #f9f9f9; padding: 10px 15px; border-radius: 10px; font-size: 14px; margin: 15px 0; display: inline-block; border: 1px dashed #ccc; }
        .sku-display strong { color: #444; margin-right: 8px; }
        .sku-display span { font-family: 'Courier New', monospace; font-weight: 700; color: #00b862; letter-spacing: 0.5px; }

        /* Navigation Arrows */
        .img-nav-btn { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.8); color: #333; border: none; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 20; transition: all 0.2s; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
        .img-nav-btn:hover { background: #fff; transform: translateY(-50%) scale(1.1); }
        .img-nav-left { left: 15px; }
        .img-nav-right { right: 15px; }

        .download-btn { width: 48px; height: 45px; border-radius: 12px; border: 1px solid #e5e7eb; background-color: #fff; color: #666; display: flex; align-items: center; justify-content: center; font-size: 20px; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); margin-left: 8px; }
        .download-btn:hover { background-color: #f0fdf4; color: #00b862; border-color: #00b862; }

        /* Modals */
        .download-modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); z-index: 10001; animation: fadeIn 0.3s; backdrop-filter: blur(3px); }
        .download-modal-sheet { position: fixed; bottom: 0; left: 0; right: 0; background: white; border-radius: 24px 24px 0 0; padding: 25px; z-index: 10002; transform: translateY(0); animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); max-height: 85vh; overflow-y: auto; }
        .dm-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 1px solid #eee; }
        .dm-option { display: flex; justify-content: space-between; align-items: center; padding: 18px; border: 1px solid #eaeaea; border-radius: 14px; margin-bottom: 12px; cursor: pointer; transition: all 0.2s; background: #fafafa; }
        .dm-option.selected { border-color: #00b862; background: #f0fdf4; box-shadow: 0 4px 12px rgba(0,184,98,0.1); }
        .dm-check { width: 24px; height: 24px; border-radius: 50%; border: 2px solid #ddd; position: relative; transition: all 0.2s; }
        .dm-option.selected .dm-check { border-color: #00b862; background: #00b862; }
        .dm-option.selected .dm-check::after { content: '✓'; position: absolute; color: white; font-size: 14px; top: 50%; left: 50%; transform: translate(-50%, -50%); }
        .dm-action-btn { width: 100%; padding: 18px; border: none; border-radius: 14px; font-size: 16px; font-weight: 800; cursor: pointer; transition: all 0.3s; position: relative; overflow: hidden; }
        .dm-action-btn:not(.success) { background: linear-gradient(135deg, #00b862 0%, #009952 100%); color: white; box-shadow: 0 6px 15px rgba(0,184,98,0.3); }
        .dm-action-btn.success { background: #4CAF50; color: white; }
        
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>

      <div id="product-detail-page" className="pdp-font">
        {/* ✅ STICKY HEADER */}
        <header className="page-header">
            <button className="back-button" onClick={() => router.back()} style={{background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#111'}}><i className="fas fa-arrow-left"></i></button>
            <h3 className="header-title">{truncateTitle(product.title, 40)}</h3>
        </header>

        {/* ✅ DYNAMIC BREADCRUMBS */}
        <div className="breadcrumbs-container">
            <Link href="/" className="breadcrumb-link">Home</Link>
            {product.category_info?.parent_name && (
                <>
                    <i className="fas fa-chevron-right breadcrumb-separator"></i>
                    <Link href={`/category/${product.category_info.parent_slug}`} className="breadcrumb-link">
                        {product.category_info.parent_name}
                    </Link>
                </>
            )}
            {product.category_info?.name && (
                <>
                    <i className="fas fa-chevron-right breadcrumb-separator"></i>
                    <Link href={`/category/${product.category_info.slug}`} className="breadcrumb-link">
                        {product.category_info.name}
                    </Link>
                </>
            )}
        </div>
        
        <div id="product-detail-content">
          <div className="pdp-desktop-layout">
            
            {/* LEFT: IMAGES */}
            <div className="pdp-left-column">
              <div className="pdp-image-gallery">
                <div className="main-image-container" onClick={() => activeMedia.type === 'image' && handleZoomImage(activeMedia.url)}>
                  {isMediaLoading && <SjLoader />}
                  
                  {/* Badges */}
                  <DiscountBadge discount={product.discount} label={displayDiscountLabel || undefined} />
                  
                  {mediaItems.length > 1 && <button className="img-nav-btn img-nav-left" onClick={handlePrevMedia}><i className="fas fa-chevron-left"></i></button>}
                  {mediaItems.length > 1 && <button className="img-nav-btn img-nav-right" onClick={handleNextMedia}><i className="fas fa-chevron-right"></i></button>}
                  
                  {activeMedia.type === 'video' ? (
                     getYouTubeId(activeMedia.url) ? (
                        <iframe src={`https://www.youtube.com/embed/${getYouTubeId(activeMedia.url)}?autoplay=1&mute=1&controls=0&loop=1&playlist=${getYouTubeId(activeMedia.url)}&modestbranding=1&rel=0&showinfo=0`} className="pdp-main-video" allow="autoplay; encrypted-media" title="Product Video" onLoad={() => setIsMediaLoading(false)} style={{ opacity: isMediaLoading ? 0 : 1, pointerEvents: 'none', width: '100%', height: '100%', border: 'none' }} />
                     ) : ( <video key={activeMedia.url} src={activeMedia.url} className="pdp-main-video" onCanPlay={() => setIsMediaLoading(false)} controls autoPlay muted loop playsInline style={{ opacity: isMediaLoading ? 0 : 1, width: '100%', height: '100%', objectFit: 'contain' }} /> )
                  ) : ( <Image src={activeMedia.url} alt={product.title} className="pdp-main-image" fill style={{ objectFit: 'contain', opacity: isMediaLoading ? 0 : 1 }} priority={true} quality={80} unoptimized onLoad={() => setIsMediaLoading(false)} /> )}
                </div>
                
                <div className="thumbnail-container">
                  {mediaItems.map((media: any, index: number) => (
                    <div key={index} className={`thumbnail ${activeMediaIndex === index ? 'active' : ''}`} onClick={() => setActiveMediaIndex(index)}>
                      <Image src={media.type === 'video' ? images[0] : media.url} alt="thumb" fill style={{objectFit:'cover'}} unoptimized/>
                      {media.type === 'video' && <div className="video-thumbnail-overlay"><i className="fas fa-play"></i></div>}
                    </div>
                  ))}
                </div>
                
                <div className="media-actions-bar" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '15px', padding: '0 5px' }}>
                    <button className="favorite-btn" onClick={handleToggleFavorite} style={{ width: '48px', height: '45px', borderRadius: '12px', border: '1px solid #e5e7eb', backgroundColor: '#fff', color: isFavorite ? '#e91e63' : '#666', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                      <i className={isFavorite ? "fas fa-heart" : "far fa-heart"}></i>
                    </button>
                    <button className="download-btn" onClick={() => setIsDownloadModalOpen(true)}>
                      <i className="fas fa-download"></i>
                    </button>
                </div>
              </div>
            </div>

            {/* RIGHT: INFO */}
            <div className="pdp-right-column">
                <div className="pdp-main-info">
                    <h1 className="title">{product.title}</h1>
                    
                    {/* Stats Row */}
                    <div className="stats-row">
                        <div className="stat-item">
                            <i className="fas fa-heart" style={{ color: isFavorite ? '#e91e63' : '#999' }}></i>
                            <span className="stat-count">{favoriteCount}</span>
                            <span>Favorites</span>
                        </div>
                        <div className="stat-item">
                            <i className="fas fa-eye" style={{ color: '#00b862' }}></i>
                            <span className="stat-count">{viewCount}</span>
                            <span>Views</span>
                        </div>
                    </div>

                    <StarRatingHTML rating={ratingData.avg_rating} reviewCount={ratingData.review_count} />
                    
                    <div className="price-container" style={{display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap', margin: '15px 0'}}>
                        <span className="price">Rs. {price.toLocaleString()}</span>
                        {hasDiscount && <span className="original-price">Rs. {originalPrice.toLocaleString()}</span>}
                        {regionFlag && (<span style={{ display:'inline-flex', alignItems:'center', gap:'6px', fontSize:'13px', fontWeight:'700', color:'#555', background:'#f0f0f0', padding:'5px 10px', borderRadius:'15px', border:'1px solid #e0e0e0' }}><Image src={regionFlag.icon} alt={regionFlag.label} width={20} height={20} style={{objectFit:'contain'}} unoptimized /><span>{regionFlag.label}</span></span>)}
                        {product.is_promoted && <PromotedLabel />}
                    </div>

                    {product.sku && (
                        <div className="sku-display">
                            <strong>SKU:</strong>
                            <span>{product.sku}</span>
                        </div>
                    )}
                </div>
                
                <div style={{display:'flex', gap:'20px', margin:'15px 0', fontSize:'13px', color:'#555', fontWeight: '600'}}>
                    <span style={{display:'flex', alignItems:'center', gap:'6px'}}><i className="fas fa-shield-check" style={{color:'#00b862', fontSize:'16px'}}></i> 100% Secure Payment</span>
                    <span style={{display:'flex', alignItems:'center', gap:'6px'}}><i className="fas fa-undo-alt" style={{color:'#00b862', fontSize:'16px'}}></i> 7 Days Easy Return</span>
                </div>
                <div style={{fontWeight: '700', color: !isOutOfStock ? '#00b862' : '#ff4747', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px'}}>
                  <i className={`fas ${!isOutOfStock ? 'fa-check-circle' : 'fa-times-circle'}`}></i> 
                  {!isOutOfStock ? `In Stock (${product.quantity})` : 'Out of Stock'}
                </div>

                {product.variants?.length > 0 && (
                    <div className="pdp-options-selector" style={{ marginTop: '25px' }}>
                        <div className="options-label" style={{ fontWeight: '800', fontSize: '15px', color: '#111' }}>Select Variant:</div>
                        <div className="variants-scroll-container">
                            {product.variants.map(v => {
                                const label = `${v.custom_color || ''} ${v.custom_size || ''}`.trim() || v.sku || `Variant #${v.id}`;
                                return (
                                    <button key={v.id} className={`option-btn ${selectedVariant?.id === v.id ? 'active' : ''}`} onClick={() => setSelectedVariant(v)} style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
                                        {v.image_url && (<div style={{ width: '28px', height: '28px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #ddd', flexShrink: 0 }} onClick={(e) => { e.stopPropagation(); handleZoomImage(v.image_url!); }}><Image src={v.image_url} alt={label} width={28} height={28} style={{ objectFit: 'cover', width: '100%', height: '100%' }} unoptimized /></div>)}
                                        <span>{label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
                
                {/* ✅ ADVANCED SMART DELIVERY SECTION CARD */}
                <div className="delivery-card">
                    <div className="delivery-header">
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                            <i className="fas fa-map-marker-alt"></i> Delivery Location
                        </div>
                        <button 
                            className="auto-detect-btn" 
                            onClick={handleDetectExactLocation}
                            disabled={isDetectingLocation}
                        >
                            <i className={isDetectingLocation ? "fas fa-spinner fa-spin" : "fas fa-crosshairs"}></i>
                            {isDetectingLocation ? 'Locating...' : 'Auto Detect'}
                        </button>
                    </div>

                    <select 
                        className="city-select"
                        value={deliveryCity}
                        onChange={(e) => {
                            setDeliveryCity(e.target.value);
                            setDetailedLocation(`${e.target.value}, Pakistan`);
                        }}
                    >
                        {PAKISTANI_CITIES.map(city => (
                            <option key={city} value={city}>{city}</option>
                        ))}
                    </select>

                    <div className="detailed-location-text">
                        <i className="fas fa-info-circle"></i>
                        <span>{detailedLocation}</span>
                    </div>
                    
                    <div className="delivery-details-list">
                        <div className="delivery-item">
                            <i className="fas fa-truck"></i>
                            <div>
                                <div className="d-title">Standard Delivery</div>
                                <div className="d-sub">3 - 5 business days across Pakistan</div>
                            </div>
                        </div>
                        <div className="delivery-item">
                            <i className="fas fa-hand-holding-usd"></i>
                            <div>
                                <div className="d-title">Cash on Delivery</div>
                                <div className="d-sub">Available for this product</div>
                            </div>
                        </div>
                        <div className="delivery-item">
                            <i className="fas fa-shield-alt"></i>
                            <div>
                                <div className="d-title">Warranty</div>
                                <div className="d-sub">{product.warranty || "No Warranty Available"}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <ul className="pdp-info-list">
                    <li className={`info-item ${activeAccordion === 'details' ? 'active' : ''}`}>
                        <div className="info-item-header" onClick={() => handleAccordionClick('details')}><i className="icon fas fa-file-alt"></i><span className="text">Product Details</span><i className="chevron fas fa-chevron-down"></i></div>
                        <div className="info-item-content">
                            {parsedAttributes && (<div className="attributes-section" style={{marginBottom: '20px', padding: '15px', background: '#fafafa', border: '1px solid #eee', borderRadius: '12px'}}><h5 style={{margin: '0 0 12px', fontSize: '15px', fontWeight: '800'}}>Specifications:</h5>{Object.entries(parsedAttributes).map(([key, value]) => (<div key={key} style={{display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px', borderBottom: '1px dashed #ddd', paddingBottom: '4px'}}><span style={{fontWeight: '700', color: '#444', textTransform: 'capitalize'}}>{key.replace(/_/g, ' ')}:</span><span style={{color: '#222'}}>{String(value)}</span></div>))}</div>)}
                            <div style={{ whiteSpace: 'pre-wrap', color: '#444', fontSize: '15px' }}>{product.description || "No details available."}</div>
                            <button className={`copy-desc-btn ${isDescriptionCopied ? 'copied' : ''}`} onClick={handleCopyDescription}>{isDescriptionCopied ? <i className="fas fa-check"></i> : <i className="far fa-copy"></i>}{isDescriptionCopied ? "Description Copied!" : "Copy Description"}</button>
                        </div>
                    </li>
                </ul>

                {/* Reviews with Smart Images */}
                {product.reviews && product.reviews.length > 0 && (
                    <div className="reviews-section" style={{ margin: '30px 0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                          <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#1a1a1a' }}>Product Reviews</h3>
                          {ratingData.review_count && ratingData.review_count > 5 && (
                            <span onClick={() => router.push(`/products/${product.id}/reviews`)} style={{ color: '#00b862', fontSize: '14px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>See All ({ratingData.review_count}) <i className="fas fa-arrow-right"></i></span>
                          )}
                        </div>
                        <div className="review-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                          {product.reviews.slice(0, 3).map((review) => {
                            let reviewImgs: string[] =[];
                            try {
                                if (review.image_urls) reviewImgs = JSON.parse(review.image_urls);
                                else if (review.image_url) {
                                    reviewImgs = review.image_url.startsWith('[') ? JSON.parse(review.image_url) : [review.image_url];
                                }
                            } catch(e){}

                            return (
                                <div key={review.id} className="review-card">
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                      <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '14px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                                        {review.user_avatar ? <Image src={review.user_avatar} alt={review.user_name} width={38} height={38} style={{ borderRadius: '50%', objectFit: 'cover' }} /> : getInitials(review.user_name)}
                                      </div>
                                      <div>
                                        <span style={{ fontWeight: '800', fontSize: '15px', color: '#222', display: 'block' }}>{review.user_name}</span>
                                        <span style={{ fontSize: '12px', color: '#888', fontWeight: '500' }}>{formatDate(review.created_at)}</span>
                                      </div>
                                    </div>
                                    <div style={{ color: '#ffc107', fontSize: '13px' }}>
                                      {[...Array(5)].map((_, i) => <i key={i} className={i < review.rating ? "fas fa-star" : "far fa-star"}></i>)}
                                    </div>
                                  </div>
                                  <p style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#555', lineHeight: '1.6' }}>{review.comment}</p>
                                  {reviewImgs.length > 0 && (
                                    <div className="review-images-grid" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                      {reviewImgs.map((img, idx) => (
                                          <div key={idx} style={{ position: 'relative', width: '70px', height: '70px', borderRadius: '10px', overflow: 'hidden', cursor: 'pointer', border: '1px solid #eaeaea' }} onClick={() => setSelectedReviewImage(img)}>
                                            <Image src={img} alt="Review" fill style={{objectFit: 'cover'}} unoptimized />
                                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}><i className="fas fa-expand" style={{color: 'white', fontSize: '18px'}}></i></div>
                                          </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                            );
                          })}
                        </div>
                    </div>
                )}

                {product.supplier && (
                    <div className="supplier-card-container">
                        <div className="supplier-profile-header">
                            <div className="supplier-avatar-large">{product.supplier.profile_pic ? (<Image src={product.supplier.profile_pic} alt="Seller" fill style={{objectFit:'cover'}} unoptimized />) : (<span className="supplier-initials">{getInitials(product.supplier.name)}</span>)}</div>
                            <div className="supplier-info-block" style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#1a1a1a' }}>{product.supplier.name}</h4>
                                {product.supplier.verified_status === 'verified' ? (<i className="fas fa-check-circle" style={{color: '#00b862', fontSize: '16px'}} title="Verified Supplier"></i>) : null}
                              </div>
                              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                <VerificationBadge status={product.supplier.verified_status} />
                                {isOfficialSupplier && <OfficialAccountBadge />}
                              </div>
                            </div>
                        </div>
                        <div className="supplier-stats-row">
                          <div className="stat-box"><span className="stat-value">{product.supplier.average_rating ? Number(product.supplier.average_rating).toFixed(1) : 'N/A'}</span><span className="stat-label"><i className="fas fa-star" style={{color: '#ffc107'}}></i> Rating</span></div>
                          <div className="stat-box" style={{borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd', padding: '0 20px'}}><span className="stat-value">{followerCount}</span><span className="stat-label"><i className="fas fa-users"></i> Followers</span></div>
                          <div className="stat-box"><span className="stat-value">{product.supplier.total_products || '10+'}</span><span className="stat-label"><i className="fas fa-box"></i> Products</span></div>
                        </div>
                        <div className="supplier-actions-row">
                          <button className={`btn-supplier-action btn-follow ${isFollowing ? 'following' : ''}`} onClick={handleFollow} disabled={isFollowLoading}>
                            {isFollowing ? <><i className="fas fa-check"></i> Following</> : <><i className="fas fa-plus"></i> Follow Store</>}
                          </button>
                          <button className="btn-supplier-action btn-visit" onClick={handleVisitStore}><i className="fas fa-store"></i> Visit Store</button>
                        </div>
                    </div>
                )}
                
                {/* ✅ CORRECT ACTION BUTTONS (DESKTOP) */}
                <div className="pdp-desktop-actions">
                  <div className="pdp-action-buttons">
                    <button className="share-now-btn" onClick={handleShareButton}>
                      {isSharing ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-share-alt"></i> Share</>}
                    </button>
                    <button className={`buy-now-btn ${isOutOfStock ? 'out-of-stock' : ''}`} onClick={handleBuyNow} disabled={isOutOfStock}>
                      {isOutOfStock ? <><i className="fas fa-ban"></i> Out of Stock</> : <><i className="fas fa-shopping-bag"></i> Buy Now</>}
                    </button>
                  </div>
                </div>
            </div>
          </div>

          {/* ✅ RELATED & MORE FROM SELLER (Strictly limit to 7) */}
          {sellerProducts && sellerProducts.length > 0 && (
            <div className="pdp-related-section">
                <h2 className="section-title">More from this seller</h2>
                <div className="product-slider-container">
                    {sellerProducts.slice(0, 7).map((p) => (<div key={p.id} className="slider-card"><ProductCard product={p} /></div>))}
                </div>
            </div>
          )}
          {relatedProducts && relatedProducts.length > 0 && (
            <div className="pdp-related-section">
                <h2 className="section-title">Related Products</h2>
                <div className="product-slider-container">
                    {relatedProducts.slice(0, 7).map((p) => (<div key={p.id} className="slider-card"><ProductCard product={p} /></div>))}
                </div>
            </div>
          )}

        </div>
        
        {/* ✅ CORRECT ACTION BUTTONS (MOBILE BOTTOM BAR) */}
        <div className="pdp-bottom-bar">
          <div className="pdp-action-buttons">
            <button className="share-now-btn" onClick={handleShareButton}>
              {isSharing ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-share-alt"></i> Share</>}
            </button>
            <button className={`buy-now-btn ${isOutOfStock ? 'out-of-stock' : ''}`} onClick={handleBuyNow} disabled={isOutOfStock}>
              {isOutOfStock ? <><i className="fas fa-ban"></i> Out of Stock</> : <><i className="fas fa-shopping-bag"></i> Buy Now</>}
            </button>
          </div>
        </div>
      </div>

      {/* --- Modals --- */}
      {isImageModalOpen && <ImageZoomModal src={zoomImageSrc || activeMedia.url} onClose={() => setIsImageModalOpen(false)} />}
      
      {isDownloadModalOpen && <DownloadOptionsModal images={images} videoUrl={product.video_url} product={product} onClose={() => setIsDownloadModalOpen(false)} />}
      
      {selectedReviewImage && (
        <ReviewImageModal src={selectedReviewImage} onClose={() => setSelectedReviewImage(null)} />
      )}
      
      <div className={`fav-toast-container ${toast.show ? 'show' : ''}`} style={{ 
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%) scale(0.8)', 
        background: 'rgba(0, 0, 0, 0.9)', color: 'white', padding: '24px 35px', borderRadius: '16px', 
        zIndex: 100000, opacity: 0, pointerEvents: 'none', transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', 
        textAlign: 'center', backdropFilter: 'blur(8px)', boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
      }}>
        <i className={`fas ${toast.icon}`} style={{ fontSize: '45px', color: toast.color, marginBottom: '12px', display: 'block' }}></i>
        <span style={{ fontSize: '16px', fontWeight: '700', letterSpacing: '0.5px' }}>{toast.message}</span>
      </div>
    </>
  );
}

// --- SUB COMPONENTS FOR MODALS ---

function ImageZoomModal({ src, onClose }: { src: string, onClose: () => void }) {
  const modalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => { if (modalRef.current && !modalRef.current.contains(e.target as Node)) onClose(); };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div className="image-fullscreen-modal visible" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(5px)' }} onClick={onClose}>
      <div ref={modalRef} style={{ position: 'relative', width: '100vw', height: '100vh', maxWidth: '1400px', maxHeight: '1000px', padding: '20px' }} onClick={(e) => e.stopPropagation()}>
        <Image src={src} alt="Fullscreen Product" fill style={{ objectFit: 'contain', padding: '40px' }} unoptimized priority />
        <button onClick={onClose} style={{ position: 'absolute', top: '25px', right: '25px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', fontSize: '24px', width: '45px', height: '45px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', transition: 'all 0.3s', zIndex: 10 }}><i className="fas fa-times"></i></button>
      </div>
    </div>
  );
}

function ReviewImageModal({ src, onClose }: { src: string, onClose: () => void }) {
  const modalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => { if (modalRef.current && !modalRef.current.contains(e.target as Node)) onClose(); };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(5px)' }} onClick={onClose}>
      <div ref={modalRef} style={{ position: 'relative', width: '100vw', height: '100vh', maxWidth: '1400px', maxHeight: '1000px', padding: '20px' }} onClick={(e) => e.stopPropagation()}>
        <Image src={src} alt="Review Image" fill style={{ objectFit: 'contain', padding: '40px' }} unoptimized priority />
        <button onClick={onClose} style={{ position: 'absolute', top: '25px', right: '25px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', fontSize: '24px', width: '45px', height: '45px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', transition: 'all 0.3s', zIndex: 10 }}><i className="fas fa-times"></i></button>
      </div>
    </div>
  );
}

function DownloadOptionsModal({ images, videoUrl, product, onClose }: { images: string[], videoUrl?: string, product: ProductWithDetails, onClose: () => void }) {
    const hasVideo = !!videoUrl && !videoUrl.includes('youtu'); 
    const[dlImages, setDlImages] = useState(true);
    const[dlVideo, setDlVideo] = useState(hasVideo);
    const[dlText, setDlText] = useState(true);
    const[status, setStatus] = useState('idle');
    const[progress, setProgress] = useState(0);
    const[progressText, setProgressText] = useState("");

    const fetchBlob = async (url: string) => {
        const cacheBuster = `?t=${new Date().getTime()}-${Math.floor(Math.random()*1000)}`;
        const res = await fetch(url + cacheBuster, { mode: 'cors', credentials: 'omit' });
        if (!res.ok) throw new Error("Network block");
        return res.blob();
    };

    const saveBlob = (blob: Blob, name: string) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => { window.URL.revokeObjectURL(url); document.body.removeChild(a); }, 100);
    };

    const handleCopyText = async () => {
      const text = `Product Title: ${product.title}\n\nProduct Description: ${product.description || 'N/A'}\n\nSKU: ${product.sku || 'N/A'}`;
      await navigator.clipboard.writeText(text);
    };

    const handleDownload = async () => {
        if (status !== 'idle') return;
        
        if (dlText) {
          await handleCopyText();
        }

        setStatus('downloading'); 
        setProgress(5); 
        
        const totalImages = dlImages ? images.length : 0;
        const totalVideo = dlVideo ? 1 : 0;
        const totalFiles = totalImages + totalVideo;
        let completed = 0;

        const updateProgress = () => { 
            completed++; 
            setProgress(Math.round((completed / totalFiles) * 100)); 
            setProgressText(`${completed}/${totalFiles}`); 
        };

        try {
            if (dlImages) { 
                for (let i = 0; i < images.length; i++) { 
                    try { 
                        const blob = await fetchBlob(images[i]); 
                        saveBlob(blob, `product_image_${i+1}.jpg`); 
                    } catch (e) { console.error(e); } 
                    updateProgress(); 
                    await new Promise(r => setTimeout(r, 200)); 
                } 
            }
            if (dlVideo && videoUrl) { 
                try { 
                    const blob = await fetchBlob(videoUrl); 
                    saveBlob(blob, "product_video.mp4"); 
                } catch (e) { console.error(e); } 
                updateProgress(); 
            }
            setStatus('success'); setTimeout(() => onClose(), 2000);
        } catch (error) { alert("Download failed."); setStatus('idle'); }
    };

    return (
        <>
        <div className="download-modal-overlay" onClick={onClose}></div>
        <div className="download-modal-sheet">
            <div className="dm-header">
                <h3 style={{margin:0, fontSize:'20px', fontWeight: '800', color: '#111'}}>Download Media</h3>
                <div onClick={onClose} style={{fontSize:'28px', cursor:'pointer', color: '#888', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>&times;</div>
            </div>
            <div style={{opacity: status === 'idle' ? 1 : 0.5, pointerEvents: status === 'idle' ? 'auto' : 'none'}}>
                <div className={`dm-option ${dlImages ? 'selected' : ''}`} onClick={() => setDlImages(!dlImages)}>
                  <div style={{display:'flex', alignItems:'center', gap:'15px'}}><i className="fas fa-images" style={{color:'#00b862', fontSize:'22px', width: '25px', textAlign: 'center'}}></i><span style={{fontWeight:'700', fontSize: '15px'}}>Images ({images.length})</span></div><div className="dm-check"></div>
                </div>
                {hasVideo && (<div className={`dm-option ${dlVideo ? 'selected' : ''}`} onClick={() => setDlVideo(!dlVideo)}><div style={{display:'flex', alignItems:'center', gap:'15px'}}><i className="fas fa-video" style={{color:'#00b862', fontSize:'22px', width: '25px', textAlign: 'center'}}></i><span style={{fontWeight:'700', fontSize: '15px'}}>Product Video</span></div><div className="dm-check"></div></div>)}
                <div className={`dm-option ${dlText ? 'selected' : ''}`} onClick={() => setDlText(!dlText)}>
                  <div style={{display:'flex', alignItems:'center', gap:'15px'}}><i className="fas fa-file-alt" style={{color:'#00b862', fontSize:'22px', width: '25px', textAlign: 'center'}}></i><span style={{fontWeight:'700', fontSize: '15px'}}>Product Details (Copy)</span></div><div className="dm-check"></div>
                </div>
            </div>
            <div style={{marginTop:'30px'}}>
              <button className={`dm-action-btn ${status === 'success' ? 'success' : ''}`} onClick={handleDownload} style={{'--progress': `${progress}%`} as React.CSSProperties}>
                {status === 'idle' && <><i className="fas fa-download"></i> Start Download</>}
                {status === 'downloading' && (<><i className="fas fa-spinner fa-spin"></i> Downloading {progressText}...</>)}
                {status === 'success' && (<><i className="fas fa-check-circle success-icon"></i> Saved to Device!</>)}
              </button>
            </div>
        </div>
        </>
    );
}