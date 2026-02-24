"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import Image from 'next/image';
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
 supplier_id?: string | number; // <--- ✅ ADD THIS LINE HERE
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
};

type Props = {
  product: ProductWithDetails;
  relatedProducts: Product[];
  sellerProducts: Product[];
};

const PLACEHOLDER_IMAGE = '/placeholder.jpg';
const OFFICIAL_SUPPLIER_ID = '854ee7de-425b-4057-a8f7-eb310491c6b0';

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
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '10px 0' }}>
      <div className="star-rating" style={{ color: '#ffc107', fontSize: '14px' }}>
        {[...Array(fullStars)].map((_, i) => <i key={`full-${i}`} className="fas fa-star"></i>)}
        {halfStar && <i className="fas fa-star-half-alt"></i>}
        {[...Array(emptyStars)].map((_, i) => <i key={`empty-${i}`} className="far fa-star"></i>)}
      </div>
      {reviewCount != null && reviewCount > 0 && <span className="review-count" style={{ fontSize: '12px', color: '#888' }}>({reviewCount})</span>}
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

// 🔥 ENHANCED OFFICIAL BADGE
const OfficialAccountBadge = () => {
    return (
        <div className="official-badge-container animated-shine">
            <i className="fas fa-crown" style={{ fontSize: '11px', marginBottom:'1px' }}></i>
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
  const [activeAccordion, setActiveAccordion] = useState<string | null>('details');
  const [isMediaLoading, setIsMediaLoading] = useState(false); 
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [zoomImageSrc, setZoomImageSrc] = useState<string>('');
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isDescriptionCopied, setIsDescriptionCopied] = useState(false);
  const [selectedReviewImage, setSelectedReviewImage] = useState<string | null>(null);
  
  // Data/Action States
  // Initialize with server data, but verify client-side immediately
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
      let parsedImages: string[] = [];
      if (typeof product.image_urls === 'string' && product.image_urls.startsWith('[')) {
        parsedImages = JSON.parse(product.image_urls);
      } else if (Array.isArray(product.image_urls)) {
        parsedImages = product.image_urls;
      }
      return parsedImages.length > 0 ? parsedImages : [PLACEHOLDER_IMAGE];
    } catch (e) { return [PLACEHOLDER_IMAGE]; }
  }, [product.image_urls]);

  const mediaItems = useMemo(() => {
    const items = images.map(url => ({ type: 'image' as const, url }));
    if (product.video_url) {
        return [{ type: 'video' as const, url: product.video_url }, ...items];
    }
    return items;
  }, [images, product.video_url]);

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

  // --- 🔥 FIXED: Client Side Sync (Follow & Fav Status) ---
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

  useEffect(() => {
    const token = getToken();
    if (!token) return; // If no token, we rely on server prop (which defaults to false)
    
    // 1. Check Follow Status
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

    // 2. Check Favorite Status
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

  }, [product.supplier?.id, product.id]);

  // View Counter & Initial Stats
  useEffect(() => {
    const init = async () => { 
      try { 
        // Increment View
        await fetch(`${process.env.NEXT_PUBLIC_PRODUCT_API_URL}/products/${product.id}/view`, { method: 'POST' }); 
        // Update Stats
        await fetchUpdatedStats();
      } catch (e) {} 
    };
    init();
  }, [product.id]);

  // --- Calculation ---
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(product.variants?.[0] || null);
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
  }, [product.attributes]);

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

  // 🔥 UPDATED FOLLOW HANDLER
  const handleFollow = async () => {
    if (!getToken()) { router.push(getLoginRedirectUrl()); return; }
    if (!product.supplier?.id || isFollowLoading) return;
    
    setIsFollowLoading(true);
    // Optimistic UI update
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
        // Revert on failure
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
      
      // Attempt native share with files if possible
      const files: File[] = [];
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
      {/* 🔥 STYLES MOVED TO TOP FOR FAST LOADING */}
      <style jsx global>{`
        .pdp-font { font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
        .main-image-container { position: relative; width: 100%; height: 400px; background-color: #fff; border-radius: 12px; overflow: hidden; display: flex; align-items: center; justify-content: center; margin-bottom: 15px; border: 1px solid #eee; }
        .pdp-main-image { width: 100%; height: 100%; object-fit: contain; display: block; }
        @media (max-width: 768px) { .main-image-container { height: 350px; } }
        
        .verified-badge-container { display: inline-flex; align-items: center; gap: 6px; background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); color: #fff; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; box-shadow: 0 2px 5px rgba(255, 165, 0, 0.3); margin-top: 5px; position: relative; overflow: hidden; }
        
        /* 🔥 ENHANCED OFFICIAL BADGE CSS */
        .official-badge-container { 
            display: inline-flex; align-items: center; gap: 6px; 
            background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); 
            color: #fff; padding: 5px 12px; border-radius: 20px; 
            font-size: 11px; font-weight: 700; text-transform: uppercase; 
            box-shadow: 0 3px 6px rgba(30, 58, 138, 0.25); margin-top: 5px; 
            position: relative; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);
        }
        
        .discount-badge-card { position: absolute; top: 10px; left: 10px; background: linear-gradient(135deg, #ff416c, #ff4b2b); color: white; padding: 5px 12px; border-radius: 20px; font-size: 13px; font-weight: 700; z-index: 10; box-shadow: 0 4px 10px rgba(255, 75, 43, 0.3); animation: pulse 2s infinite; display: flex; align-items: center; gap: 5px; }
        .promoted-label { display: inline-flex; align-items: center; gap: 4px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 3px 10px; border-radius: 15px; font-size: 11px; font-weight: 600; box-shadow: 0 2px 5px rgba(102, 126, 234, 0.3); marginLeft: 8px; }

        .animated-shine::after { content: ""; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent); animation: shine 2.2s infinite; }
        @keyframes shine { 0% { left: -100%; } 100% { left: 100%; } }
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
        
        .unverified-badge-container { display: inline-flex; align-items: center; gap: 6px; background: #f1f1f1; color: #777; border: 1px solid #ddd; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: uppercase; margin-top: 5px; }
        
        .supplier-name-row { display: flex; align-items: center; justify-content: center; gap: 5px; }
        .tick-icon { color: #00b862; font-size: 14px; }
        
        .img-nav-btn { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.3); color: white; border: none; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 20; transition: background 0.2s; }
        .img-nav-btn:hover { background: rgba(0,0,0,0.6); }
        .img-nav-left { left: 10px; }
        .img-nav-right { right: 10px; }
        
        .pdp-related-section { margin-top: 40px; margin-bottom: 40px; padding: 0 15px; overflow: visible; }
        .section-title { font-size: 18px; font-weight: 800; color: #1e293b; margin-bottom: 15px; border-left: 4px solid #ff7f00; padding-left: 10px; }
        .product-slider-container { display: flex; gap: 15px; overflow-x: auto; padding-bottom: 20px; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
        .product-slider-container::-webkit-scrollbar { display: none; }
        .slider-card { flex: 0 0 160px; scroll-snap-align: start; }
        @media (min-width: 768px) { .slider-card { flex: 0 0 220px; } }

        .header-title { font-size: 16px; font-weight: 600; }
        .title { font-size: 24px; font-weight: 700; line-height: 1.3; }
        .price { font-size: 28px; font-weight: 800; }
        .original-price { font-size: 18px; }

        .stats-row { display: flex; gap: 15px; margin: 10px 0; padding: 10px 0; border-top: 1px solid #eee; border-bottom: 1px solid #eee; }
        .stat-item { display: flex; align-items: center; gap: 5px; font-size: 13px; color: #666; }
        .stat-item i { font-size: 14px; }
        .stat-count { font-weight: 700; color: #333; margin-left: 3px; }

        .sku-display { background: #f5f5f5; padding: 8px 12px; border-radius: 8px; font-size: 13px; margin: 10px 0; display: inline-block; border: 1px solid #e0e0e0; }
        .sku-display strong { color: #333; margin-right: 8px; }
        .sku-display span { font-family: 'Courier New', monospace; font-weight: 600; color: #00b862; }

        .download-btn { width: 48px; height: 45px; border-radius: 12px; border: 1px solid #e5e7eb; background-color: #fff; color: #666; display: flex; align-items: center; justify-content: center; font-size: 20px; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); margin-left: 8px; }
        .download-btn:hover { background-color: #f0f0f0; color: #00b862; }

        .download-modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 10001; animation: fadeIn 0.3s; }
        .download-modal-sheet { position: fixed; bottom: 0; left: 0; right: 0; background: white; border-radius: 20px 20px 0 0; padding: 20px; z-index: 10002; transform: translateY(0); animation: slideUp 0.3s; max-height: 80vh; overflow-y: auto; }
        .dm-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #eee; }
        .dm-option { display: flex; justify-content: space-between; align-items: center; padding: 15px; border: 1px solid #e5e7eb; border-radius: 12px; margin-bottom: 10px; cursor: pointer; transition: all 0.2s; }
        .dm-option.selected { border-color: #00b862; background: #f0fdf4; }
        .dm-check { width: 22px; height: 22px; border-radius: 50%; border: 2px solid #ddd; position: relative; }
        .dm-option.selected .dm-check { border-color: #00b862; background: #00b862; }
        .dm-option.selected .dm-check::after { content: '✓'; position: absolute; color: white; font-size: 14px; top: 50%; left: 50%; transform: translate(-50%, -50%); }
        .dm-action-btn { width: 100%; padding: 16px; border: none; border-radius: 12px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.3s; position: relative; overflow: hidden; }
        .dm-action-btn:not(.success) { background: #00b862; color: white; }
        .dm-action-btn.success { background: #4CAF50; color: white; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }

        .review-images-grid { display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; }
        .review-image-thumb { position: relative; width: 60px; height: 60px; border-radius: 8px; overflow: hidden; cursor: pointer; border: 2px solid transparent; transition: all 0.2s; }
        .review-image-thumb:hover { transform: scale(1.05); border-color: #00b862; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
        .review-image-thumb .overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s; }
        .review-image-thumb:hover .overlay { opacity: 1; }
        .review-image-thumb .overlay i { color: white; font-size: 20px; }
        
        .copy-desc-btn { margin-top: 10px; padding: 8px 16px; background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s; }
        .copy-desc-btn:hover { background: #dcfce7; }
        .copy-desc-btn.copied { background: #166534; color: white; border-color: #166534; }
      `}</style>

      <div id="product-detail-page" className="pdp-font">
        <header className="page-header">
            <button className="back-button" onClick={() => router.back()}><i className="fas fa-arrow-left"></i></button>
            <h3 className="header-title">{truncateTitle(product.title, 40)}</h3>
        </header>
        
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
                  ) : ( <Image src={activeMedia.url} alt={product.title} className="pdp-main-image" fill style={{ objectFit: 'contain', opacity: isMediaLoading ? 0 : 1 }} priority={true} quality={70} unoptimized onLoad={() => setIsMediaLoading(false)} /> )}
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
                            <i className="fas fa-eye"></i>
                            <span className="stat-count">{viewCount}</span>
                            <span>Views</span>
                        </div>
                    </div>

                    <StarRatingHTML rating={ratingData.avg_rating} reviewCount={ratingData.review_count} />
                    
                    <div className="price-container" style={{display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap'}}>
                        <span className="price">Rs. {price.toLocaleString()}</span>
                        {hasDiscount && <span className="original-price">Rs. {originalPrice.toLocaleString()}</span>}
                        {regionFlag && (<span style={{ display:'inline-flex', alignItems:'center', gap:'6px', fontSize:'12px', fontWeight:'600', color:'#555', background:'#fff', padding:'4px 8px', borderRadius:'12px', border:'1px solid #e5e7eb', boxShadow:'0 1px 2px rgba(0,0,0,0.05)' }}><Image src={regionFlag.icon} alt={regionFlag.label} width={20} height={20} style={{objectFit:'contain'}} unoptimized /><span>{regionFlag.label}</span></span>)}
                        {product.is_promoted && <PromotedLabel />}
                    </div>

                    {product.sku && (
                        <div className="sku-display">
                            <strong>SKU:</strong>
                            <span>{product.sku}</span>
                        </div>
                    )}
                </div>
                
                <div style={{display:'flex', gap:'15px', margin:'10px 0', fontSize:'12px', color:'#555'}}>
                    <span style={{display:'flex', alignItems:'center', gap:'5px'}}><i className="fas fa-shield-alt" style={{color:'#00b862'}}></i> 100% Secure</span>
                    <span style={{display:'flex', alignItems:'center', gap:'5px'}}><i className="fas fa-undo" style={{color:'#00b862'}}></i> 7 Days Return</span>
                </div>
                <div className={`pdp-stock-status ${!isOutOfStock ? 'in-stock' : 'low-stock'}`}><i className={`fas ${!isOutOfStock ? 'fa-check-circle' : 'fa-times-circle'}`}></i> {!isOutOfStock ? `In Stock (${product.quantity})` : 'Out of Stock'}</div>

                {product.variants?.length > 0 && (
                    <div className="pdp-options-selector">
                        <div className="options-label">Select Variant:</div>
                        <div className="variants-scroll-container">
                            {product.variants.map(v => {
                                const label = `${v.custom_color || ''} ${v.custom_size || ''}`.trim() || v.sku || `Variant #${v.id}`;
                                return (
                                    <button key={v.id} className={`option-btn ${selectedVariant?.id === v.id ? 'active' : ''}`} onClick={() => setSelectedVariant(v)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', whiteSpace: 'nowrap' }}>
                                        {v.image_url && (<div style={{ width: '24px', height: '24px', borderRadius: '4px', overflow: 'hidden', border: '1px solid #ddd', flexShrink: 0 }} onClick={(e) => { e.stopPropagation(); handleZoomImage(v.image_url!); }}><Image src={v.image_url} alt={label} width={24} height={24} style={{ objectFit: 'cover', width: '100%', height: '100%' }} unoptimized /></div>)}
                                        <span>{label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
                
                <ul className="pdp-info-list">
                    <li className={`info-item ${activeAccordion === 'details' ? 'active' : ''}`}>
                        <div className="info-item-header" onClick={() => handleAccordionClick('details')}><i className="icon fas fa-info-circle"></i><span className="text">Product Details</span><i className="chevron fas fa-chevron-down"></i></div>
                        <div className="info-item-content">
                            {parsedAttributes && (<div className="attributes-section" style={{marginBottom: '15px', padding: '10px', background: '#f9f9f9', borderRadius: '8px'}}><h5 style={{margin: '0 0 10px', fontSize: '14px'}}>Specifications:</h5>{Object.entries(parsedAttributes).map(([key, value]) => (<div key={key} style={{display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px'}}><span style={{fontWeight: '600', color: '#555', textTransform: 'capitalize'}}>{key.replace(/_/g, ' ')}:</span><span>{String(value)}</span></div>))}</div>)}
                            <div style={{ whiteSpace: 'pre-wrap' }}>{product.description || "No details available."}</div>
                            <button className={`copy-desc-btn ${isDescriptionCopied ? 'copied' : ''}`} onClick={handleCopyDescription}>{isDescriptionCopied ? <i className="fas fa-check"></i> : <i className="far fa-copy"></i>}{isDescriptionCopied ? "Copied!" : "Copy Description"}</button>
                        </div>
                    </li>
                    <li className={`info-item ${activeAccordion === 'delivery' ? 'active' : ''}`}>
                        <div className="info-item-header" onClick={() => handleAccordionClick('delivery')}><i className="icon fas fa-truck"></i><span className="text">Delivery Info</span><i className="chevron fas fa-chevron-down"></i></div>
                        <div className="info-item-content">Standard delivery within 3-5 business days across Pakistan.<br/><br/><strong style={{color:'#00b862'}}>7 Days Return Policy:</strong> If you are not satisfied with your product, you can return it within 7 days.<br/><br/>Global shipping and returns available within 7 days all over Pakistan.</div>
                    </li>
                </ul>

                {/* Reviews with Smart Images */}
                {product.reviews && product.reviews.length > 0 && (
                    <div className="reviews-section" style={{ margin: '20px 0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                          <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>Product Reviews</h3>
                          {ratingData.review_count && ratingData.review_count > 5 && (
                            <span onClick={() => router.push(`/products/${product.id}/reviews`)} style={{ color: '#00b862', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>See All ({ratingData.review_count})</span>
                          )}
                        </div>
                        <div className="review-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                          {product.reviews.slice(0, 3).map((review) => {
                            let reviewImgs: string[] = [];
                            try {
                                if (review.image_urls) reviewImgs = JSON.parse(review.image_urls);
                                else if (review.image_url) {
                                    reviewImgs = review.image_url.startsWith('[') ? JSON.parse(review.image_url) : [review.image_url];
                                }
                            } catch(e){}

                            return (
                                <div key={review.id} className="review-card" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '600', fontSize: '12px' }}>
                                        {review.user_avatar ? <Image src={review.user_avatar} alt={review.user_name} width={32} height={32} style={{ borderRadius: '50%', objectFit: 'cover' }} /> : getInitials(review.user_name)}
                                      </div>
                                      <div>
                                        <span style={{ fontWeight: '700', fontSize: '14px', display: 'block' }}>{review.user_name}</span>
                                        <span style={{ fontSize: '11px', color: '#999' }}>{formatDate(review.created_at)}</span>
                                      </div>
                                    </div>
                                    <div style={{ color: '#ffc107', fontSize: '12px' }}>
                                      {[...Array(5)].map((_, i) => <i key={i} className={i < review.rating ? "fas fa-star" : "far fa-star"}></i>)}
                                    </div>
                                  </div>
                                  <p style={{ margin: '0 0 15px 0', fontSize: '13px', color: '#444', lineHeight: '1.5' }}>{review.comment}</p>
                                  {reviewImgs.length > 0 && (
                                    <div className="review-images-grid">
                                      {reviewImgs.map((img, idx) => (
                                          <div key={idx} className="review-image-thumb" onClick={() => setSelectedReviewImage(img)}>
                                            <Image src={img} alt="Review" fill unoptimized />
                                            <div className="overlay"><i className="fas fa-search-plus"></i></div>
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
                            <div className="supplier-avatar-large">{product.supplier.profile_pic ? (<Image src={product.supplier.profile_pic} alt="Seller" fill unoptimized />) : (<span className="supplier-initials">{getInitials(product.supplier.name)}</span>)}</div>
                            <div className="supplier-info-block">
                              <div className="supplier-name-row">
                                <h4>{product.supplier.name}</h4>
                                {product.supplier.verified_status === 'verified' ? (<i className="fas fa-check-circle tick-icon" title="Verified Supplier"></i>) : (<i className="fas fa-times-circle cross-icon" title="Unverified"></i>)}
                              </div>
                              <VerificationBadge status={product.supplier.verified_status} />
                              {isOfficialSupplier && <OfficialAccountBadge />}
                            </div>
                        </div>
                        <div className="supplier-stats-row">
                          <div className="stat-box"><span className="stat-value">{product.supplier.average_rating ? Number(product.supplier.average_rating).toFixed(1) : 'N/A'}</span><span className="stat-label"><i className="fas fa-star" style={{color: '#ffc107'}}></i> Rating</span></div>
                          <div className="stat-box"><span className="stat-value">{followerCount}</span><span className="stat-label"><i className="fas fa-user-friends"></i> Followers</span></div>
                          <div className="stat-box"><span className="stat-value">{product.supplier.total_products || '10+'}</span><span className="stat-label"><i className="fas fa-box-open"></i> Products</span></div>
                        </div>
                        <div className="supplier-actions-row">
                          <button className={`btn-supplier-action btn-follow ${isFollowing ? 'following' : ''}`} onClick={handleFollow} disabled={isFollowLoading}>
                            {isFollowing ? <><i className="fas fa-check"></i> Following</> : <><i className="fas fa-plus"></i> Follow</>}
                          </button>
                          <button className="btn-supplier-action btn-visit" onClick={handleVisitStore}>Visit Store</button>
                        </div>
                    </div>
                )}
                
                <div className="pdp-desktop-actions">
                  <div className="pdp-action-buttons">
                    <button className="share-now-btn" style={{backgroundColor: '#e0f2f1', color: '#00796b', border: 'none'}} onClick={handleShareButton}>
                      {isSharing ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-share-alt"></i> Share</>}
                    </button>
                    <button className={`buy-now-btn ${isOutOfStock ? 'out-of-stock' : ''}`} onClick={handleBuyNow} disabled={isOutOfStock}>
                      {isOutOfStock ? <><i className="fas fa-ban"></i> Out of Stock</> : <><i className="fas fa-shopping-bag"></i> Buy Now</>}
                    </button>
                  </div>
                </div>
            </div>
          </div>

          {/* RELATED & MORE FROM SELLER */}
          {sellerProducts && sellerProducts.length > 0 && (
            <div className="pdp-related-section">
                <h2 className="section-title">More from this seller</h2>
                <div className="product-slider-container">
                    {sellerProducts.map((p) => (<div key={p.id} className="slider-card"><ProductCard product={p} /></div>))}
                </div>
            </div>
          )}
          {relatedProducts && relatedProducts.length > 0 && (
            <div className="pdp-related-section">
                <h2 className="section-title">Related Products</h2>
                <div className="product-slider-container">
                    {relatedProducts.map((p) => (<div key={p.id} className="slider-card"><ProductCard product={p} /></div>))}
                </div>
            </div>
          )}

        </div>
        
        <div className="pdp-bottom-bar">
          <div className="pdp-action-buttons">
            <button className="share-now-btn" style={{backgroundColor: '#e0f2f1', color: '#00796b', border: 'none'}} onClick={handleShareButton}>
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
        background: 'rgba(0, 0, 0, 0.85)', color: 'white', padding: '20px 30px', borderRadius: '12px', 
        zIndex: 10000, opacity: 0, pointerEvents: 'none', transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', 
        textAlign: 'center', backdropFilter: 'blur(5px)' 
      }}>
        <i className={`fas ${toast.icon}`} style={{ fontSize: '40px', color: toast.color, marginBottom: '10px', display: 'block' }}></i>
        <span style={{ fontSize: '16px', fontWeight: '600' }}>{toast.message}</span>
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
    <div className="image-fullscreen-modal visible" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={onClose}>
      <div ref={modalRef} style={{ position: 'relative', width: '90vw', height: '90vh', maxWidth: '1200px', maxHeight: '800px' }} onClick={(e) => e.stopPropagation()}>
        <Image src={src} alt="Fullscreen Product" fill style={{ objectFit: 'contain' }} unoptimized priority />
        <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', fontSize: '30px', width: '50px', height: '50px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)', transition: 'all 0.3s' }}><i className="fas fa-times"></i></button>
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
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={onClose}>
      <div ref={modalRef} style={{ position: 'relative', width: '90vw', height: '90vh', maxWidth: '1200px', maxHeight: '800px' }} onClick={(e) => e.stopPropagation()}>
        <Image src={src} alt="Review Image" fill style={{ objectFit: 'contain' }} unoptimized priority />
        <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', fontSize: '30px', width: '50px', height: '50px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}><i className="fas fa-times"></i></button>
      </div>
    </div>
  );
}

function DownloadOptionsModal({ images, videoUrl, product, onClose }: { images: string[], videoUrl?: string, product: ProductWithDetails, onClose: () => void }) {
    const hasVideo = !!videoUrl && !videoUrl.includes('youtu'); 
    const [dlImages, setDlImages] = useState(true);
    const [dlVideo, setDlVideo] = useState(hasVideo);
    const [dlText, setDlText] = useState(true);
    const [status, setStatus] = useState('idle');
    const [progress, setProgress] = useState(0);
    const [progressText, setProgressText] = useState("");

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
            <div className="dm-header"><h3 style={{margin:0, fontSize:'18px'}}>Download Media</h3><span onClick={onClose} style={{fontSize:'24px', cursor:'pointer'}}>&times;</span></div>
            <div style={{opacity: status === 'idle' ? 1 : 0.5, pointerEvents: status === 'idle' ? 'auto' : 'none'}}>
                <div className={`dm-option ${dlImages ? 'selected' : ''}`} onClick={() => setDlImages(!dlImages)}>
                  <div style={{display:'flex', alignItems:'center', gap:'12px'}}><i className="fas fa-images" style={{color:'#00b862', fontSize:'20px'}}></i><span style={{fontWeight:'600'}}>Images ({images.length})</span></div><div className="dm-check"></div>
                </div>
                {hasVideo && (<div className={`dm-option ${dlVideo ? 'selected' : ''}`} onClick={() => setDlVideo(!dlVideo)}><div style={{display:'flex', alignItems:'center', gap:'12px'}}><i className="fas fa-video" style={{color:'#00b862', fontSize:'20px'}}></i><span style={{fontWeight:'600'}}>Product Video</span></div><div className="dm-check"></div></div>)}
                <div className={`dm-option ${dlText ? 'selected' : ''}`} onClick={() => setDlText(!dlText)}>
                  <div style={{display:'flex', alignItems:'center', gap:'12px'}}><i className="fas fa-file-alt" style={{color:'#00b862', fontSize:'20px'}}></i><span style={{fontWeight:'600'}}>Product Details (Copy)</span></div><div className="dm-check"></div>
                </div>
            </div>
            <div style={{marginTop:'25px'}}>
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