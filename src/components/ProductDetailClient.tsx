"use client";

import { useState, useMemo, useEffect, type ReactNode } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import ProductCard, { type Product } from './ProductCard'; // Ensure path is correct
import SjLoader from './SjLoader'; // Ensure path is correct

// --- TypeScript Fix for Navigator Share ---
interface NavigatorWithShare {
  canShare?: (data?: ShareData) => boolean;
  share?: (data: ShareData) => Promise<void>;
}

// --- Types ---
// Re-exporting these if needed by other components, though mostly internal now
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
};

// Merged definition for the full prop object
type ProductWithDetails = Product & {
  description: string;
  video_url?: string;
  variants: Variant[];
  supplier: Supplier | null;
  quantity: number;
  attributes?: string | Record<string, any>;
  is_favorite?: boolean;
  reviews?: Review[];
  total_reviews_count?: number;
  avg_rating?: number;
  imported_region?: string | null;
};

type Props = {
  product: ProductWithDetails;
  children: ReactNode;
};

// --- Constants ---
const PLACEHOLDER_IMAGE = '/placeholder.jpg';

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
    return localStorage.getItem('user_token') || 
           localStorage.getItem('token') || 
           localStorage.getItem('authToken') ||
           sessionStorage.getItem('user_token');
};

const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-GB', options);
};

// --- Helper Components ---
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
    const isVerified = status === 'verified';
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

export default function ProductDetailClient({ product, children }: Props) {
  const router = useRouter();
  const { user } = useAuth(); // Assuming AuthProvider is set up correctly in layout
  
  const [activeAccordion, setActiveAccordion] = useState<string | null>('details');
  const [isMediaLoading, setIsMediaLoading] = useState(false); 
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [zoomImageSrc, setZoomImageSrc] = useState<string>('');
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [sellerProducts, setSellerProducts] = useState<Product[]>([]);
  const [isSharing, setIsSharing] = useState(false);
  const [isDescriptionCopied, setIsDescriptionCopied] = useState(false);
  const [isFollowing, setIsFollowing] = useState(product.supplier?.is_following || false);
  const [followerCount, setFollowerCount] = useState(product.supplier?.followers_count || 0);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(product.is_favorite || false);
  const [toast, setToast] = useState<{ show: boolean, message: string, icon: string, color: string }>({ 
      show: false, message: '', icon: '', color: '' 
  });

  const showToast = (message: string, icon: string = 'fa-check-circle', color: string = '#00b862') => {
      setToast({ show: true, message, icon, color });
      setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

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

  // Sync client-side specific status (favorites/follows) that relies on local token
  useEffect(() => {
    if (product.supplier) setFollowerCount(product.supplier.followers_count || 0);
    const syncStatus = async () => {
        const token = getToken();
        if (!token) return;
        if (product.supplier?.id) {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_PRODUCT_API_URL}/social/status/${product.supplier.id}`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (res.ok) setIsFollowing((await res.json()).isFollowing); 
            } catch (e) {}
        }
        try {
             const res = await fetch(`${process.env.NEXT_PUBLIC_PRODUCT_API_URL}/social/favorite/status/${product.id}`, { headers: { 'Authorization': `Bearer ${token}` } });
             if (res.ok) setIsFavorite((await res.json()).isFavorite);
        } catch (e) {}
    };
    syncStatus();
  }, [product.supplier?.id, product.id]);

  useEffect(() => {
    const incrementView = async () => { try { await fetch(`${process.env.NEXT_PUBLIC_PRODUCT_API_URL}/products/${product.id}/view`, { method: 'POST' }); } catch (e) {} };
    incrementView();
  }, [product.id]);

  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(product.variants?.[0] || null);
  const ratingData = { avg_rating: product.avg_rating || null, review_count: product.total_reviews_count || null };
  const price = parseFloat(String(selectedVariant?.discounted_price || product.discounted_price || product.price));
  const originalPrice = parseFloat(String(selectedVariant?.price || product.price));
  const hasDiscount = price < originalPrice;
  const isOutOfStock = product.quantity <= 0;
  const discountPercentage = hasDiscount ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

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

  // Fetch more products from same seller (client side lazy load is fine for this)
  useEffect(() => {
    const fetchSellerProducts = async () => {
      if (!product.supplier?.id) return;
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_PRODUCT_API_URL}/products?supplierId=${product.supplier.id}&limit=15`);
        if (res.ok) { 
            const data = await res.json(); 
            if (data.products) setSellerProducts(data.products.filter((p: Product) => p.id !== product.id)); 
        }
      } catch (error) {}
    };
    fetchSellerProducts();
  }, [product.id, product.supplier?.id]);

  const handleVisitStore = () => product.supplier?.id && router.push(`/suppliers/${product.supplier.id}`);
  const handleAccordionClick = (itemName: string) => setActiveAccordion(prev => (prev === itemName ? null : itemName));
  const handleZoomImage = (src: string) => { setZoomImageSrc(src); setIsImageModalOpen(true); };
  
  const handleCopyDescription = async () => {
    try {
        const descText = product.description || "";
        const attrText = parsedAttributes ? Object.entries(parsedAttributes).map(([k, v]) => `${k}: ${v}`).join('\n') : "";
        await navigator.clipboard.writeText(`${product.title}\n\n${descText}\n\n${attrText}`);
        setIsDescriptionCopied(true); setTimeout(() => setIsDescriptionCopied(false), 2000); showToast("Description copied!", "fa-copy");
    } catch (e) { showToast("Failed to copy", "fa-exclamation-circle", "red"); }
  };

  const getLoginRedirectUrl = () => `/auth?view=login&redirect=${encodeURIComponent(window.location.href)}`;

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    if (!getToken()) { router.push(getLoginRedirectUrl()); return; }
    if (product.variants?.length && !selectedVariant) { showToast("Please select a variant option", "fa-exclamation-circle", "#ff9800"); return; }
    const params = new URLSearchParams(); 
    params.set('productId', String(product.id));
    if (selectedVariant) params.set('variantId', String(selectedVariant.id));
    router.push(`/place-order?${params.toString()}`);
  };

  const handleFollow = async () => {
    if (!getToken()) { router.push(getLoginRedirectUrl()); return; }
    if (!product.supplier?.id || isFollowLoading) return;
    setIsFollowLoading(true);
    const previousState = isFollowing; setIsFollowing(!isFollowing); setFollowerCount(prev => !previousState ? prev + 1 : prev - 1);
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_PRODUCT_API_URL}/social/follow/${product.supplier.id}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` }
        });
        if (!res.ok) throw new Error("Action failed");
        showToast(!previousState ? "Following Supplier" : "Unfollowed Supplier", "fa-user-check");
    } catch (error) { setIsFollowing(previousState); setFollowerCount(product.supplier?.followers_count || 0); showToast("Unable to follow.", "fa-times-circle", "#e91e63"); } 
    finally { setIsFollowLoading(false); }
  };

  const handleToggleFavorite = async () => {
      if (!getToken()) { router.push(getLoginRedirectUrl()); return; }
      const previousState = isFavorite; setIsFavorite(!isFavorite);
      if (!previousState) showToast("Added to Favorites", "fa-heart", "#e91e63");
      try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_PRODUCT_API_URL}/social/favorite/${product.id}`, {
              method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` }
          });
          if (!res.ok) throw new Error("Request failed");
      } catch (error) { setIsFavorite(previousState); showToast("Could not save favorite", "fa-times-circle", "#e91e63"); }
  };

  const handleShareButton = async () => {
      if (isSharing) return;
      setIsSharing(true);
      const shareText = `*${product.title}*\n\nPrice: Rs. ${price}\nOrder Here: ${window.location.href}`;
      try { await navigator.clipboard.writeText(shareText); } catch(e){}
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
      <style jsx global>{`
        /* Keeping all original styles exactly as they were */
        .main-image-container { position: relative; width: 100%; height: 400px; background-color: #fff; border-radius: 12px; overflow: hidden; display: flex; align-items: center; justify-content: center; margin-bottom: 15px; border: 1px solid #eee; }
        .pdp-main-image { width: 100%; height: 100%; object-fit: contain; display: block; }
        @media (max-width: 768px) { .main-image-container { height: 350px; } }
        .verified-badge-container { display: inline-flex; align-items: center; gap: 6px; background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); color: #fff; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; box-shadow: 0 2px 5px rgba(255, 165, 0, 0.3); margin-top: 5px; position: relative; overflow: hidden; }
        .verified-badge-container i { font-size: 12px; }
        .animated-shine::after { content: ""; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent); animation: shine 2s infinite; }
        @keyframes shine { 0% { left: -100%; } 100% { left: 100%; } }
        .unverified-badge-container { display: inline-flex; align-items: center; gap: 6px; background: #f1f1f1; color: #777; border: 1px solid #ddd; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: uppercase; margin-top: 5px; }
        .fav-toast-container.show { opacity: 1 !important; transform: translate(-50%, -50%) scale(1) !important; }
        .supplier-name-row { display: flex; align-items: center; justify-content: center; gap: 5px; }
        .tick-icon { color: #00b862; font-size: 14px; }
        .cross-icon { color: #999; font-size: 14px; }
        .img-nav-btn { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.3); color: white; border: none; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 20; transition: background 0.2s; }
        .img-nav-btn:hover { background: rgba(0,0,0,0.6); }
        .img-nav-left { left: 10px; }
        .img-nav-right { right: 10px; }
        .pdp-right-column { flex: 1; min-width: 0; }
        .variants-scroll-container { display: flex; flex-direction: row; flex-wrap: nowrap; overflow-x: auto; gap: 10px; padding-bottom: 5px; scrollbar-width: thin; width: 100%; max-width: 100%; -webkit-overflow-scrolling: touch; }
        .variants-scroll-container::-webkit-scrollbar { height: 4px; }
        .variants-scroll-container::-webkit-scrollbar-thumb { background: #ccc; border-radius: 4px; }
        .copy-desc-btn { margin-top: 10px; padding: 8px 16px; background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s; }
        .copy-desc-btn:hover { background: #dcfce7; }
        .copy-desc-btn.copied { background: #166534; color: white; border-color: #166534; }
      `}</style>

      <div id="product-detail-page">
        <header className="page-header">
            <button className="back-button" onClick={() => router.back()}><i className="fas fa-arrow-left"></i></button>
            <h3 className="header-title">{product.title}</h3>
        </header>
        
        <div id="product-detail-content">
          <div className="pdp-desktop-layout">
            <div className="pdp-left-column">
              <div className="pdp-image-gallery">
                <div className="main-image-container" onClick={() => activeMedia.type === 'image' && handleZoomImage(activeMedia.url)}>
                  {isMediaLoading && <SjLoader />}
                  {hasDiscount && <div className="discount-badge" style={{position:'absolute', top:10, left:10, zIndex:10}}>-{discountPercentage}%</div>}
                  {mediaItems.length > 1 && <button className="img-nav-btn img-nav-left" onClick={handlePrevMedia}><i className="fas fa-chevron-left"></i></button>}
                  {mediaItems.length > 1 && <button className="img-nav-btn img-nav-right" onClick={handleNextMedia}><i className="fas fa-chevron-right"></i></button>}
                  {activeMedia.type === 'video' ? (
                     getYouTubeId(activeMedia.url) ? (
                        <iframe src={`https://www.youtube.com/embed/${getYouTubeId(activeMedia.url)}?autoplay=1&mute=1&controls=0&loop=1&playlist=${getYouTubeId(activeMedia.url)}&modestbranding=1&rel=0&showinfo=0`} className="pdp-main-video" allow="autoplay; encrypted-media" title="Product Video" onLoad={() => setIsMediaLoading(false)} style={{ opacity: isMediaLoading ? 0 : 1, pointerEvents: 'none' }} />
                     ) : ( <video key={activeMedia.url} src={activeMedia.url} className="pdp-main-video" onCanPlay={() => setIsMediaLoading(false)} controls autoPlay muted loop playsInline style={{ opacity: isMediaLoading ? 0 : 1 }} /> )
                  ) : ( <Image src={activeMedia.url} alt={product.title} className="pdp-main-image" fill style={{ objectFit: 'contain', opacity: isMediaLoading ? 0 : 1 }} priority={true} quality={70} unoptimized onLoad={() => setIsMediaLoading(false)} /> )}
                </div>
                <div className="thumbnail-container">
                  {mediaItems.map((media, index) => (
                    <div key={index} className={`thumbnail ${activeMediaIndex === index ? 'active' : ''}`} onClick={() => setActiveMediaIndex(index)}>
                      <Image src={media.type === 'video' ? (images[0] ?? PLACEHOLDER_IMAGE) : media.url} alt={`Thumbnail ${index + 1}`} fill style={{ objectFit: 'cover' }} unoptimized/>
                      {media.type === 'video' && <div className="video-thumbnail-overlay"><i className="fas fa-play"></i></div>}
                    </div>
                  ))}
                </div>
                <div className="media-actions-bar" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '15px', padding: '0 5px' }}>
                    <button className="favorite-btn" onClick={handleToggleFavorite} style={{ width: '48px', height: '45px', borderRadius: '12px', border: '1px solid #e5e7eb', backgroundColor: '#fff', color: isFavorite ? '#e91e63' : '#666', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}><i className={isFavorite ? "fas fa-heart" : "far fa-heart"}></i></button>
                </div>
              </div>
            </div>

            <div className="pdp-right-column">
                <div className="pdp-main-info">
                    <h2 className="title">{product.title}</h2>
                    <StarRatingHTML rating={ratingData.avg_rating} reviewCount={ratingData.review_count} />
                    <div className="price-container" style={{display:'flex', alignItems:'center', gap:'10px'}}>
                        <span className="price">Rs. {price.toLocaleString()}</span>
                        {hasDiscount && <span className="original-price">Rs. {originalPrice.toLocaleString()}</span>}
                        {regionFlag && (<span style={{ display:'inline-flex', alignItems:'center', gap:'6px', fontSize:'12px', fontWeight:'600', color:'#555', background:'#fff', padding:'4px 8px', borderRadius:'12px', border:'1px solid #e5e7eb', boxShadow:'0 1px 2px rgba(0,0,0,0.05)' }}><Image src={regionFlag.icon} alt={regionFlag.label} width={20} height={20} style={{objectFit:'contain'}} unoptimized /><span>{regionFlag.label}</span></span>)}
                    </div>
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

                {product.reviews && product.reviews.length > 0 && (
                    <div className="reviews-section" style={{ margin: '20px 0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}><h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>Product Reviews</h3>{ratingData.review_count && ratingData.review_count > 8 && (<span onClick={() => router.push(`/products/${product.id}/reviews`)} style={{ color: '#00b862', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>See All</span>)}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '15px', color: '#666', fontSize: '13px' }}><i className="fas fa-star" style={{ color: '#ffc107' }}></i><span style={{ fontWeight: '700', color: '#333' }}>{Number(ratingData.avg_rating || 0).toFixed(1)}</span><span>({ratingData.review_count || 0} Ratings)</span></div>
                        <div className="review-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>{product.reviews.map((review) => (<div key={review.id} className="review-card" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '15px' }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span style={{ fontWeight: '700', fontSize: '13px', textTransform: 'uppercase' }}>{review.user_name}</span><span style={{ fontSize: '11px', color: '#999' }}>{formatDate(review.created_at)}</span></div><div style={{ color: '#ffc107', fontSize: '12px', marginBottom: '8px' }}>{[...Array(5)].map((_, i) => (<i key={i} className={i < review.rating ? "fas fa-star" : "far fa-star"}></i>))}</div><p style={{ margin: 0, fontSize: '13px', color: '#444', lineHeight: '1.4' }}>{review.comment}</p>{review.image_url && (<div style={{ marginTop: '10px', width: '60px', height: '60px', position: 'relative', borderRadius: '8px', overflow: 'hidden', cursor: 'zoom-in', border: '1px solid #eee' }} onClick={() => handleZoomImage(review.image_url!)}><Image src={review.image_url} alt="Review Image" fill style={{ objectFit: 'cover' }} unoptimized /></div>)}</div>))}</div>
                    </div>
                )}

                {product.supplier && (
                    <div className="supplier-card-container">
                        <div className="supplier-profile-header">
                            <div className="supplier-avatar-large">{product.supplier.profile_pic ? (<Image src={product.supplier.profile_pic} alt="Seller" fill unoptimized />) : (<span className="supplier-initials">{getInitials(product.supplier.name)}</span>)}</div>
                            <div className="supplier-info-block"><div className="supplier-name-row"><h4>{product.supplier.name}</h4>{product.supplier.verified_status === 'verified' ? (<i className="fas fa-check-circle tick-icon" title="Verified Supplier"></i>) : (<i className="fas fa-times-circle cross-icon" title="Unverified"></i>)}</div><VerificationBadge status={product.supplier.verified_status} /></div>
                        </div>
                        <div className="supplier-stats-row"><div className="stat-box"><span className="stat-value">{product.supplier.average_rating ? Number(product.supplier.average_rating).toFixed(1) : 'N/A'}</span><span className="stat-label"><i className="fas fa-star" style={{color: '#ffc107'}}></i> Rating</span></div><div className="stat-box"><span className="stat-value">{followerCount}</span><span className="stat-label"><i className="fas fa-user-friends"></i> Followers</span></div><div className="stat-box"><span className="stat-value">{product.supplier.total_products || '10+'}</span><span className="stat-label"><i className="fas fa-box-open"></i> Products</span></div></div>
                        <div className="supplier-actions-row"><button className={`btn-supplier-action btn-follow ${isFollowing ? 'following' : ''}`} onClick={handleFollow} disabled={isFollowLoading}>{isFollowing ? <><i className="fas fa-check"></i> Following</> : <><i className="fas fa-plus"></i> Follow</>}</button><button className="btn-supplier-action btn-visit" onClick={handleVisitStore}>Visit Store</button></div>
                    </div>
                )}
                <div className="pdp-desktop-actions"><div className="pdp-action-buttons"><button className="share-now-btn" style={{backgroundColor: '#e0f2f1', color: '#00796b', border: 'none'}} onClick={handleShareButton}>{isSharing ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-share-alt"></i> Share</>}</button><button className={`buy-now-btn ${isOutOfStock ? 'out-of-stock' : ''}`} onClick={handleBuyNow} disabled={isOutOfStock}>{isOutOfStock ? <><i className="fas fa-ban"></i> Out of Stock</> : <><i className="fas fa-shopping-bag"></i> Buy Now</>}</button></div></div>
            </div>
          </div>
          {sellerProducts.length > 0 && (<div className="pdp-related-section"><h2 className="section-title">More from {product.supplier?.name}</h2><div className="product-grid">{sellerProducts.map((p) => (<ProductCard key={p.id} product={p} />))}</div></div>)}
          <div className="pdp-related-section"><h2 className="section-title">You May Also Like</h2><div className="product-grid">{children}</div></div>
        </div>
        <div className="pdp-bottom-bar"><div className="pdp-action-buttons"><button className="share-now-btn" style={{backgroundColor: '#e0f2f1', color: '#00796b', border: 'none'}} onClick={handleShareButton}>{isSharing ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-share-alt"></i> Share</>}</button><button className={`buy-now-btn ${isOutOfStock ? 'out-of-stock' : ''}`} onClick={handleBuyNow} disabled={isOutOfStock}>{isOutOfStock ? <><i className="fas fa-ban"></i> Out of Stock</> : <><i className="fas fa-shopping-bag"></i> Buy Now</>}</button></div></div>
      </div>
      {isImageModalOpen && <ImageZoomModal src={zoomImageSrc || activeMedia.url} onClose={() => setIsImageModalOpen(false)} />}
      {isDownloadModalOpen && <DownloadOptionsModal images={images} videoUrl={product.video_url} onClose={() => setIsDownloadModalOpen(false)} />}
      <div className={`fav-toast-container ${toast.show ? 'show' : ''}`} style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%) scale(0.8)', background: 'rgba(0, 0, 0, 0.85)', color: 'white', padding: '20px 30px', borderRadius: '12px', zIndex: 10000, opacity: 0, pointerEvents: 'none', transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', textAlign: 'center', backdropFilter: 'blur(5px)' }}><i className={`fas ${toast.icon}`} style={{ fontSize: '40px', color: toast.color, marginBottom: '10px', display: 'block' }}></i><span style={{ fontSize: '16px', fontWeight: '600' }}>{toast.message}</span></div>
    </>
  );
}

function ImageZoomModal({ src, onClose }: { src: string, onClose: () => void }) {
  return (
    <div className="image-fullscreen-modal visible" onClick={onClose}>
        <span className="close-btn" onClick={onClose}>&times;</span>
        <div className="fullscreen-image-wrapper" onClick={(e) => e.stopPropagation()}><Image src={src} alt="Fullscreen Product" fill style={{ objectFit: 'contain' }} unoptimized /></div>
    </div>
  );
}

function DownloadOptionsModal({ images, videoUrl, onClose }: { images: string[], videoUrl?: string, onClose: () => void }) {
    const hasVideo = !!videoUrl && !videoUrl.includes('youtu'); 
    const [dlImages, setDlImages] = useState(true);
    const [dlVideo, setDlVideo] = useState(hasVideo);
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
    const handleDownload = async () => {
        if (status !== 'idle') return;
        setStatus('downloading'); setProgress(5); 
        const totalImages = dlImages ? images.length : 0;
        const totalVideo = dlVideo ? 1 : 0;
        const totalFiles = totalImages + totalVideo;
        let completed = 0;
        const updateProgress = () => { completed++; setProgress(Math.round((completed / totalFiles) * 100)); setProgressText(`${completed}/${totalFiles}`); };
        try {
            if (dlImages) { for (let i = 0; i < images.length; i++) { try { const blob = await fetchBlob(images[i]); saveBlob(blob, `image_${i+1}.jpg`); } catch (e) { console.error(e); } updateProgress(); await new Promise(r => setTimeout(r, 200)); } }
            if (dlVideo && videoUrl) { try { const blob = await fetchBlob(videoUrl); saveBlob(blob, "product_video.mp4"); } catch (e) { console.error(e); } updateProgress(); }
            setStatus('success'); setTimeout(() => onClose(), 2000);
        } catch (error) { alert("Download failed. Please check connection."); setStatus('idle'); }
    };
    return (
        <>
        <div className="download-modal-overlay" onClick={onClose}></div>
        <div className="download-modal-sheet">
            <div className="dm-header"><h3 style={{margin:0, fontSize:'18px'}}>Download Media</h3><span onClick={onClose} style={{fontSize:'24px', cursor:'pointer'}}>&times;</span></div>
            <div style={{opacity: status === 'idle' ? 1 : 0.5, pointerEvents: status === 'idle' ? 'auto' : 'none'}}>
                <div className={`dm-option ${dlImages ? 'selected' : ''}`} onClick={() => setDlImages(!dlImages)}><div style={{display:'flex', alignItems:'center', gap:'12px'}}><i className="fas fa-images" style={{color:'#00b862', fontSize:'20px'}}></i><span style={{fontWeight:'600'}}>Images ({images.length})</span></div><div className="dm-check"></div></div>
                {hasVideo && (<div className={`dm-option ${dlVideo ? 'selected' : ''}`} onClick={() => setDlVideo(!dlVideo)}><div style={{display:'flex', alignItems:'center', gap:'12px'}}><i className="fas fa-video" style={{color:'#00b862', fontSize:'20px'}}></i><span style={{fontWeight:'600'}}>Product Video</span></div><div className="dm-check"></div></div>)}
            </div>
            <div style={{marginTop:'25px'}}><button className={`dm-action-btn ${status === 'success' ? 'success' : ''}`} onClick={handleDownload} style={{'--progress': `${progress}%`} as React.CSSProperties}>{status === 'idle' && <><i className="fas fa-download"></i> Start Download</>}{status === 'downloading' && (<><i className="fas fa-spinner fa-spin"></i> Downloading {progressText}...</>)}{status === 'success' && (<><i className="fas fa-check-circle success-icon"></i> Saved to Device!</>)}</button></div>
        </div>
        </>
    );
};