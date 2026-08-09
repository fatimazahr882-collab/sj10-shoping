"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ProductCard, { type Product } from './ProductCard';
import SjLoader from './SjLoader';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/components/AuthProvider';
import AuthModal from '@/components/AuthModal';

// --- Sub Components ---
import PdpTopHeader from './product-detail/PdpTopHeader';
import ProductGallery from './product-detail/ProductGallery';
import ProductInfo from './product-detail/ProductInfo';
import ProductActions from './product-detail/ProductActions';
import ProductDelivery from './product-detail/ProductDelivery';
import ProductAccordion from './product-detail/ProductAccordion';
import ProductSupplier from './product-detail/ProductSupplier';
import ProductReviews from './product-detail/ProductReviews';
import ProductSellerMore from './product-detail/ProductSellerMore';
import ProductRelatedVertical from './product-detail/ProductRelatedVertical';

export type Variant = { id: string | number; name?: string; price: string; discounted_price?: string; sku?: string; custom_color?: string; custom_size?: string; image_url?: string; [key: string]: any; stock?: number; };
type Supplier = { id: string; name: string; profile_pic?: string | null; followers_count?: number; average_rating?: number; total_products?: number; verified_status?: string; is_following?: boolean; };
type Review = { id: string; user_name: string; rating: number; comment: string; created_at: string; image_url?: string | null; image_urls?: string | null; user_avatar?: string | null; };

export type ProductWithDetails = Product & { 
    views?: number | string;
    status?: string;
    description: string; 
    video_url?: string; 
    variants: Variant[]; 
    supplier: Supplier | null; 
    supplier_id?: string | number; 
    category_id?: string | number;
    quantity: number | string; 
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
    discount?: any; 
    stats?: { views: number; favorites: number; }; 
    category_info?: any; 
    warranty?: string; 
    warranty_details?: any; 
    warranty_type?: any;    
};

type Props = { product: ProductWithDetails; relatedProducts: Product[]; sellerProducts: Product[]; };

const PLACEHOLDER_IMAGE = '/placeholder.jpg';
const getToken = () => { if (typeof window === 'undefined') return null; return localStorage.getItem('user_token') || localStorage.getItem('authToken'); };

export default function ProductDetailClient({ product, relatedProducts, sellerProducts }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const { addItemToCart } = useCart();
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', icon: '', color: '' });

  // DESKTOP FLOATING BAR VISIBILITY
  const [showDesktopFloatingBar, setShowDesktopFloatingBar] = useState(false);
  const [isBottomBarVisible, setIsBottomBarVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      
      if (currentY > 400) {
        setShowDesktopFloatingBar(true);
      } else {
        setShowDesktopFloatingBar(false);
      }

      if (currentY < 100) {
        setIsBottomBarVisible(true);
      } else if (currentY > lastScrollY.current + 12) {
        setIsBottomBarVisible(false);
      } else if (currentY < lastScrollY.current - 12) {
        setIsBottomBarVisible(true);
      }
      lastScrollY.current = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Data States
  const initialViews = Number((product as any).views || product.stats?.views || 0);
  const initialFavs = Number(product.stats?.favorites || (product as any).favorites || 0);

  const [isFavorite, setIsFavorite] = useState(product.is_favorite || false);
  const [favoriteCount, setFavoriteCount] = useState(initialFavs);
  const [viewCount, setViewCount] = useState(initialViews);

  // Variant & Quantity
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(product.variants?.[0] || null);
  const [quantity, setQuantity] = useState<number>(1);
  
  const rawStatus = product.status ? String(product.status).toLowerCase().trim() : 'in_stock';
  const mainQuantity = (product.quantity !== undefined && product.quantity !== null) ? Number(product.quantity) : 100;
  const variantStock = selectedVariant && selectedVariant.stock !== undefined && selectedVariant.stock !== null ? Number(selectedVariant.stock) : 0;

  const availableStock = variantStock > 0 ? variantStock : mainQuantity;
  const isOutOfStock = rawStatus === 'out_of_stock' || availableStock <= 0;
  
  const parsedAttributes = useMemo(() => { try { return typeof product.attributes === 'object' ? product.attributes : JSON.parse(product.attributes || "{}"); } catch (e) { return null; } },[product.attributes]);

  const showToast = (message: string, icon = 'fa-check-circle', color = '#00b862') => {
      setToast({ show: true, message, icon, color });
      setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  const images = useMemo(() => {
    try {
      let raw = product.image_urls;
      if (typeof raw === 'string') {
        const trimmed = raw.trim();
        if (trimmed.startsWith('[')) {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } else if (trimmed.length > 5) return [trimmed];
      } else if (Array.isArray(raw) && raw.length > 0) return raw;
      if (product.image_url) return [product.image_url];
      return [PLACEHOLDER_IMAGE];
    } catch (e) {
      return product.image_url ? [product.image_url] : [PLACEHOLDER_IMAGE];
    }
  }, [product.image_urls, product.image_url]);

  // 🟢 SMART VIDEO DETECTION: Video URL & MP4Links in images are PREPENDED to index 0!
  const mediaItems = useMemo(() => {
    const videoList: Array<{ type: 'video'; url: string }> = [];
    const imageList: Array<{ type: 'image'; url: string }> = [];

    // 1. Check product.video_url
    if (product.video_url && product.video_url.length > 5) {
      videoList.push({ type: 'video', url: product.video_url });
    }

    // 2. Check images array for .mp4 / .webm links
    images.forEach((url: string) => {
      if (url && (url.toLowerCase().includes('.mp4') || url.toLowerCase().includes('.webm') || url.toLowerCase().includes('video'))) {
        if (!videoList.some(v => v.url === url)) {
          videoList.push({ type: 'video', url });
        }
      } else if (url) {
        imageList.push({ type: 'image', url });
      }
    });

    // 🟢 VIDEO IS ALWAYS FIRST (INDEX 0)!
    return [...videoList, ...imageList];
  }, [images, product.video_url]);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    fetch(`${process.env.NEXT_PUBLIC_PRODUCT_API_URL}/social/favorite/status/${product.id}`, { headers: { 'Authorization': `Bearer ${token}` } })
    .then(res => res.json())
    .then(data => { if (data && typeof data.isFavorite === 'boolean') setIsFavorite(data.isFavorite); })
    .catch(e => console.error(e));
  },[product.id]);

  useEffect(() => {
    const init = async () => { 
      try { 
        await fetch(`${process.env.NEXT_PUBLIC_PRODUCT_API_URL}/products/${product.id}/view`, { method: 'POST' }); 
        const res = await fetch(`${process.env.NEXT_PUBLIC_PRODUCT_API_URL}/products/${product.id}/stats`);
        if (res.ok) { 
            const stats = await res.json(); 
            if (stats.views !== undefined && stats.views > 0) setViewCount(stats.views); 
            if (stats.favorites !== undefined && stats.favorites > 0) setFavoriteCount(stats.favorites); 
        }
      } catch (e) {} 
    };
    init();
  },[product.id]);

  const handleToggleFavorite = async () => {
      if (!user) { setIsAuthModalOpen(true); return; }
      const previousState = isFavorite; 
      setIsFavorite(!isFavorite);
      setFavoriteCount(prev => !previousState ? prev + 1 : prev - 1);
      if (!previousState) showToast("Added to Favorites", "fa-heart", "#e91e63");
      try {
          await fetch(`${process.env.NEXT_PUBLIC_PRODUCT_API_URL}/social/favorite/${product.id}`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` }});
      } catch (error) { 
          setIsFavorite(previousState); 
          setFavoriteCount(prev => !previousState ? prev - 1 : prev + 1);
          showToast("Could not save favorite", "fa-times-circle", "#e91e63"); 
      }
  };

  const handleShareButton = async () => {
      if (isSharing) return;
      setIsSharing(true);
      const price = parseFloat(String(selectedVariant?.discounted_price || product.discounted_price || product.price));
      const shareText = `*${product.title}*\n\nPrice: Rs. ${price}\nOrder Here: ${window.location.href}`;
      try { await navigator.clipboard.writeText(shareText); } catch(e){}
      const nav = navigator as any;
      if (nav.share) { try { await nav.share({ title: product.title, text: shareText, url: window.location.href }); } catch (e) {} }
      showToast("Link Copied!", "fa-copy", "#2196f3"); setIsSharing(false);
  };

  const handleAddToCart = async () => {
    if (!user) { setIsAuthModalOpen(true); return; }
    try {
      await addItemToCart(product.id.toString(), quantity, {
        options: { color: selectedVariant?.custom_color || selectedVariant?.color, size: selectedVariant?.custom_size || selectedVariant?.size },
        profit: 0
      });
      showToast("Added to Bag!", "fa-shopping-bag");
    } catch (e) {
      showToast("Failed to add to bag", "fa-exclamation-circle", "#ef4444");
    }
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    if (!user) { setIsAuthModalOpen(true); return; }
    if (product.variants?.length && !selectedVariant) return showToast("Please select a variant option", "fa-exclamation-circle", "#ff9800"); 
    
    const params = new URLSearchParams();
    params.set('productId', String(product.id));
    params.set('quantity', String(quantity));
    if (selectedVariant) params.set('variantId', String(selectedVariant.id));
    
    router.push(`/place-order?${params.toString()}`);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentPrice = parseFloat(String(selectedVariant?.discounted_price || product.discounted_price || product.price));

  return (
    <>
      <style jsx global>{`
        .pdp-font { font-family: 'Inter', sans-serif; background: #f8fafc; min-height: 100vh;}
        
        #product-detail-page {
            margin-top: 0 !important;
            padding-top: 0 !important;
            background: #f8fafc;
            position: relative;
        }

        @media (max-width: 768px) {
            body { padding-top: 65px !important; }
        }
        @media (min-width: 769px) {
            body { padding-top: 110px !important; }
        }

        /* 🟢 DESKTOP LAYOUT (BALANCED HEIGHTS) */
        @media (min-width: 769px) {
            .pdp-desktop-layout { 
                display: flex; 
                align-items: flex-start; 
                gap: 35px; 
                padding: 30px; 
                max-width: 1400px; 
                margin: 20px auto; 
                background: #ffffff; 
                border-radius: 20px; 
                border: 1px solid #e2e8f0; 
                box-shadow: 0 4px 20px rgba(0,0,0,0.02);
                box-sizing: border-box;
            }
            .pdp-left-column { flex: 0 0 44%; position: sticky; top: 140px; }
            .pdp-right-column { flex: 1; min-width: 0; }
            .pdp-bottom-bar { display: none !important; }
            .seo-google-section { display: block; animation: fadeInUp 0.5s ease-out; }
            
            .pdp-order-gallery { order: 1; }
            .pdp-order-info { order: 2; }
            .pdp-order-accordion { order: 3; }
            .pdp-order-delivery { order: 4; }
            .pdp-order-reviews { order: 5; }
            .pdp-order-supplier { order: 6; }
        }

        /* 🟢 MOBILE FLEX ORDER LOCK */
        @media (max-width: 768px) {
            .pdp-desktop-layout { 
                display: flex !important; 
                flex-direction: column !important; 
                padding: 10px 12px 160px 12px !important; 
                gap: 16px !important; 
                margin-top: 0 !important; 
                background: transparent !important;
                border: none !important;
                box-shadow: none !important;
            }

            .pdp-left-column, .pdp-right-column { 
                display: contents !important;
            }

            .pdp-order-gallery { order: 1 !important; }
            .pdp-order-info { order: 2 !important; }
            .pdp-order-accordion { order: 3 !important; }
            .pdp-order-delivery { order: 4 !important; }
            .pdp-order-reviews { order: 5 !important; }
            .pdp-order-supplier { order: 6 !important; }

            .pdp-desktop-actions { display: none !important; }
            .seo-google-section { display: none !important; }

            .pdp-bottom-bar { 
                display: flex; position: fixed; bottom: 65px; left: 0; right: 0; 
                background: #ffffff; padding: 10px 15px; box-shadow: 0 -4px 15px rgba(0,0,0,0.08); 
                z-index: 998; border-top: 1px solid #eaeaea; 
                transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .pdp-bottom-bar.hide-bar { transform: translateY(180%); }
            .product-info-wrapper { padding-top: 0 !important; margin-top: 0 !important; }
        }

        /* DESKTOP FLOATING BOTTOM BAR */
        .desktop-floating-bar {
            position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%) translateY(150%);
            width: 90%; max-width: 1100px; background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(15px); border-radius: 100px; padding: 10px 20px;
            display: flex; align-items: center; justify-content: space-between;
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15); border: 1px solid rgba(255, 255, 255, 0.8);
            z-index: 9999; transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .desktop-floating-bar.show { transform: translateX(-50%) translateY(0); }
        @media (max-width: 768px) { .desktop-floating-bar { display: none !important; } }

        .floating-product-summary { display: flex; align-items: center; gap: 15px; overflow: hidden; }
        .floating-img-box { position: relative; width: 44px; height: 44px; border-radius: 10px; overflow: hidden; border: 1px solid #e2e8f0; flex-shrink: 0; background: #fff; }
        .floating-prod-title { font-size: 14px; font-weight: 800; color: #0f172a; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 350px; }
        .floating-prod-price { font-size: 15px; font-weight: 900; color: #00b862; }

        .floating-actions-right { display: flex; align-items: center; gap: 12px; }
        .floating-btn { padding: 10px 22px; border-radius: 50px; font-size: 13px; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s ease; }
        .f-bag-btn { background: #ffffff; border: 1px solid #0f172a; color: #0f172a; }
        .f-bag-btn:hover { background: #0f172a; color: white; }
        .f-buy-btn { background: linear-gradient(135deg, #00b862 0%, #009952 100%); border: none; color: white; box-shadow: 0 4px 12px rgba(0, 184, 98, 0.3); }
        .f-buy-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0, 184, 98, 0.4); }
        .f-scroll-top-btn { width: 40px; height: 40px; border-radius: 50%; background: #0f172a; color: white; border: none; display: flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer; transition: all 0.2s; }
        .f-scroll-top-btn:hover { background: #f85606; transform: translateY(-2px); }

        .seo-google-section { margin-top: 30px; padding: 25px; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.02); }
        .seo-h2 { font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 12px; }
        .seo-text { font-size: 14px; color: #475569; line-height: 1.8; }
      `}</style>

      <div id="product-detail-page" className="pdp-font">
        
        {/* TOP HEADER */}
        <PdpTopHeader 
            product={product} 
            isFavorite={isFavorite} 
            handleToggleFavorite={handleToggleFavorite} 
            handleShareButton={handleShareButton} 
        />
        
        <div id="product-detail-content">
          <div className="pdp-desktop-layout">
            
            {/* 🟢 LEFT COLUMN (DESKTOP): GALLERY + DELIVERY CARD + SUPPLIER CARD */}
            <div className="pdp-left-column">
              <div className="pdp-order-gallery">
                <ProductGallery 
                  product={product} 
                  images={images} 
                  mediaItems={mediaItems} 
                  isFavorite={isFavorite} 
                  handleToggleFavorite={handleToggleFavorite}
                  showToast={showToast} 
                />
              </div>

              {/* Delivery Card on Desktop Left */}
              <div className="pdp-order-delivery">
                <ProductDelivery warranty={product.warranty_details || product.warranty || product.warranty_type} showToast={showToast} />
              </div>

              {/* Supplier Card on Desktop Left */}
              <div className="pdp-order-supplier">
                <ProductSupplier product={product} showToast={showToast} getToken={getToken} getLoginRedirectUrl={() => `/auth?view=login&redirect=${encodeURIComponent(window.location.href)}`} />
              </div>
            </div>

            {/* 🟢 RIGHT COLUMN (DESKTOP): INFO + ACCORDION + REVIEWS */}
            <div className="pdp-right-column">
                <div className="pdp-order-info">
                  <ProductInfo 
                      product={product} 
                      selectedVariant={selectedVariant} 
                      setSelectedVariant={setSelectedVariant} 
                      quantity={quantity}
                      setQuantity={setQuantity}
                      ratingData={{ avg_rating: product.avg_rating, review_count: product.total_reviews_count }} 
                      viewCount={viewCount}         
                      favoriteCount={favoriteCount} 
                      isFavorite={isFavorite}       
                      handleToggleFavorite={handleToggleFavorite}
                      onAddToCart={handleAddToCart}
                      onBuyNow={handleBuyNow}
                  />
                </div>
                
                {/* Description Accordion on Desktop Right */}
                <div className="pdp-order-accordion">
                  <ProductAccordion product={product} parsedAttributes={parsedAttributes} showToast={showToast} />
                </div>

                {/* Customer Reviews on Desktop Right */}
                <div className="pdp-order-reviews">
                  <ProductReviews reviews={product.reviews || []} reviewCount={product.total_reviews_count} />
                </div>
            </div>
          </div>

          <section className="seo-google-section">
            <h2 className="seo-h2">Buy {product.title} Online at Best Wholesale Price in Pakistan - SJ10.pk</h2>
            <p className="seo-text">
                Looking for <strong>{product.title}</strong> in Pakistan? SJ10 Shopping offers authentic products at direct wholesale rates with fast Cash on Delivery (COD) to Karachi, Lahore, Islamabad, Rawalpindi, Peshawar, Quetta, and across Pakistan. Enjoy 100% secure payment, 7-day hassle-free return policy, and instant customer support. Order now and get it delivered directly to your doorstep with zero investment reselling options.
            </p>
          </section>

          {sellerProducts && sellerProducts.length > 0 && (
            <ProductSellerMore sellerProducts={sellerProducts.slice(0, 7)} />
          )}

          {relatedProducts && relatedProducts.length > 0 && (
            <ProductRelatedVertical 
                categoryId={product.category_info?.id || product.category_id} 
                currentProductId={product.id} 
                initialProducts={relatedProducts} 
            />
          )}

        </div>
        
        {/* MOBILE BOTTOM BAR */}
        <div className={`pdp-bottom-bar ${!isBottomBarVisible ? 'hide-bar' : ''}`}>
          <ProductActions isSharing={isSharing} isOutOfStock={isOutOfStock} handleShareButton={handleShareButton} handleBuyNow={handleBuyNow} />
        </div>

        {/* DESKTOP FLOATING BOTTOM BAR */}
        <div className={`desktop-floating-bar ${showDesktopFloatingBar ? 'show' : ''}`}>
          <div className="floating-product-summary">
            <div className="floating-img-box">
              <Image src={images[0] || PLACEHOLDER_IMAGE} alt="Thumbnail" fill style={{ objectFit: 'cover' }} unoptimized />
            </div>
            <div>
              <div className="floating-prod-title">{product.title}</div>
              <div className="floating-prod-price">PKR {currentPrice.toLocaleString()}</div>
            </div>
          </div>

          <div className="floating-actions-right">
            <button className="floating-btn f-bag-btn" onClick={handleAddToCart}>
              <i className="fas fa-shopping-bag"></i> Add to bag
            </button>
            <button className="floating-btn f-buy-btn" onClick={handleBuyNow} disabled={isOutOfStock}>
              <i className="fas fa-bolt"></i> Buy now
            </button>
            <button className="f-scroll-top-btn" onClick={scrollToTop} title="Scroll to Top">
              <i className="fas fa-arrow-up"></i>
            </button>
          </div>
        </div>

      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* TOAST */}
      <div className={`fav-toast-container ${toast.show ? 'show' : ''}`} style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%) scale(0.8)', background: 'rgba(0, 0, 0, 0.9)', color: 'white', padding: '24px 35px', borderRadius: '16px', zIndex: 100000, opacity: toast.show ? 1 : 0, pointerEvents: 'none', transition: 'all 0.3s', textAlign: 'center', backdropFilter: 'blur(8px)' }}>
        <i className={`fas ${toast.icon}`} style={{ fontSize: '45px', color: toast.color, margin: '0 auto 12px', display: 'block' }}></i>
        <span style={{ fontSize: '16px', fontWeight: '700' }}>{toast.message}</span>
      </div>
    </>
  );
}