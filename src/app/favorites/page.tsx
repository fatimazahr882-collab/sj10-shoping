"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

// Force this page to be dynamic (No Caching)
export const dynamic = "force-dynamic";

// --- TYPES ---
type FavoriteItem = {
  id: string | number;
  title: string;
  price: number; 
  discounted_price?: number; 
  image_urls: any;
  slug: string;
  favorited_at: string;
};

export default function FavoritesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [removingId, setRemovingId] = useState<string | number | null>(null);

  // --- FETCH LOGIC ---
  useEffect(() => {
    const token = typeof window !== 'undefined' ? 
      (localStorage.getItem("authToken") || localStorage.getItem("user_token")) : null;

    if (authLoading) return;

    if (!token && !user) {
        // Only redirect if we are sure auth has finished loading
        setTimeout(() => router.push("/auth?view=login"), 1000);
        return;
    }

    if (token) {
        fetchFavorites(token);
    } else {
        setIsFetching(false);
    }
  }, [user, authLoading, router]);

  const fetchFavorites = async (token: string) => {
      try {
        // 🔥 FIXED: Correct Endpoint (/me) + No Cache
        const res = await fetch(`${process.env.NEXT_PUBLIC_PRODUCT_API_URL}/social/favorites/me`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
          next: { revalidate: 0 }
        });
        
        const rawData = await res.json();

        if (res.ok && Array.isArray(rawData)) {
            const processed = rawData.map((item: any) => {
                let imgs = item.image_urls;
                if (typeof imgs === 'string') {
                    try { imgs = JSON.parse(imgs); } catch(e) { imgs = ["/placeholder.jpg"]; }
                }
                if (!Array.isArray(imgs)) imgs = ["/placeholder.jpg"];
                return { ...item, image_urls: imgs };
            });
            setFavorites(processed);
        }
      } catch (error) {
        console.error("Fetch Error:", error);
      } finally {
        setIsFetching(false);
      }
  };

  const handleRemove = async (e: React.MouseEvent, productId: string | number) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    
    setRemovingId(productId);

    // Optimistic UI Update
    setTimeout(async () => {
        const prev = [...favorites];
        setFavorites(curr => curr.filter(i => i.id !== productId));
        setRemovingId(null);

        try {
            const token = localStorage.getItem("authToken") || localStorage.getItem("user_token");
            if(token) {
                await fetch(`${process.env.NEXT_PUBLIC_PRODUCT_API_URL}/social/favorite/${productId}`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
        } catch(e) {
            // Revert on error
            setFavorites(prev);
        }
    }, 400); 
  };

  // --- RENDER ---
  return (
    <div className="fav-page-wrapper">
      
      {/* --- CSS STYLING --- */}
      <style jsx global>{`
        .fav-page-wrapper {
            min-height: 100vh;
            background-color: #f8f9fa;
            padding: 20px 10px;
        }
        
        .fav-content-width {
            max-width: 1600px; 
            margin: 0 auto;
        }

        /* HEADER */
        .fav-header {
            background: white;
            padding: 20px 30px;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.03);
            margin-bottom: 25px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .fav-title {
            font-size: 24px;
            font-weight: 800;
            color: #1a1a1a;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        @keyframes heartbeat {
            0% { transform: scale(1); }
            15% { transform: scale(1.2); }
            30% { transform: scale(1); }
            45% { transform: scale(1.2); }
            60% { transform: scale(1); }
        }
        .header-heart {
            color: #ff0000;
            animation: heartbeat 1.5s infinite;
        }

        /* --- GRID SYSTEM --- */
        .fav-grid {
            display: grid;
            gap: 12px;
            grid-template-columns: repeat(2, 1fr);
        }
        @media (min-width: 768px) {
            .fav-grid { grid-template-columns: repeat(4, 1fr); }
        }
        @media (min-width: 1024px) {
            .fav-grid { grid-template-columns: repeat(6, 1fr); gap: 15px; }
        }

        /* PRODUCT CARD */
        .fav-card {
            background: white;
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid #eee;
            transition: all 0.3s ease;
            position: relative;
            display: block; 
            text-decoration: none;
        }
        .fav-card:hover {
            box-shadow: 0 8px 20px rgba(0,0,0,0.08);
            transform: translateY(-3px);
            border-color: #e0e0e0;
        }
        .fav-card.removing {
            transform: scale(0.5);
            opacity: 0;
            transition: all 0.4s ease;
        }

        /* IMAGE HOVER SWAPPER */
        .image-container {
            position: relative;
            width: 100%;
            aspect-ratio: 3/4; 
            background: #f9f9f9;
            overflow: hidden;
        }
        .img-main, .img-hover {
            object-fit: cover;
            transition: opacity 0.3s ease-in-out;
        }
        .img-hover {
            opacity: 0;
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
        }
        .fav-card:hover .img-main { opacity: 0; }
        .fav-card:hover .img-hover { opacity: 1; }

        /* HEART BUTTON (REMOVE) */
        .btn-heart-remove {
            position: absolute;
            top: 8px;
            right: 8px;
            width: 30px;
            height: 30px;
            background: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ff0000;
            cursor: pointer;
            z-index: 10;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            transition: all 0.2s;
            border: none;
        }
        .btn-heart-remove:hover {
            background: #ff0000;
            color: white;
            transform: scale(1.1);
        }

        /* CARD BODY */
        .card-body {
            padding: 10px;
        }
        .date-badge {
            font-size: 10px;
            color: #888;
            font-weight: 800; 
            text-transform: uppercase;
            margin-bottom: 4px;
            display: block;
        }
        .prod-title {
            font-size: 13px;
            font-weight: 700; 
            color: #222;
            line-height: 1.3;
            margin-bottom: 8px;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            height: 34px;
        }

        /* PRICE ROW */
        .price-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 5px;
        }
        .price-block {
            display: flex;
            flex-direction: column;
        }
        .price-main {
            font-size: 15px;
            font-weight: 900; 
            color: #000;
        }
        .price-cut {
            font-size: 11px;
            color: #999;
            text-decoration: line-through;
            font-weight: 500;
        }

        /* CART ICON */
        .cart-icon-btn {
            width: 32px;
            height: 32px;
            background: #f1f1f1;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #333;
            transition: all 0.2s;
        }
        .fav-card:hover .cart-icon-btn {
            background: #000;
            color: white;
        }

        /* EMPTY STATE */
        .empty-container {
            text-center: center;
            padding: 100px 20px;
            background: white;
            border-radius: 12px;
        }
        .btn-shop {
            background: #000;
            color: white;
            padding: 12px 30px;
            border-radius: 50px;
            text-decoration: none;
            font-weight: 700;
            display: inline-block;
            margin-top: 20px;
        }
        
        /* SHIMMER */
        .skeleton {
            background: #eee;
            height: 320px;
            border-radius: 8px;
            animation: pulse 1s infinite alternate;
        }
        @keyframes pulse { from { opacity: 0.6; } to { opacity: 1; } }
      `}</style>

      <div className="fav-content-width">
        
        {/* HEADER */}
        <div className="fav-header">
          <div className="fav-title">
            <i className="fas fa-heart header-heart"></i> 
            My Favorites
          </div>
          <div style={{fontWeight:'700', fontSize:'14px'}}>
            {favorites.length} Items
          </div>
        </div>

        {/* LOADING */}
        {isFetching && (
            <div className="fav-grid">
                {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => <div key={i} className="skeleton"></div>)}
            </div>
        )}

        {/* EMPTY */}
        {!isFetching && favorites.length === 0 && (
            <div className="empty-container">
                <i className="far fa-heart" style={{ fontSize: '50px', color: '#ccc', marginBottom: '15px' }}></i>
                <h2 style={{fontWeight:'800'}}>Your Wishlist is Empty</h2>
                <Link href="/" className="btn-shop">Start Shopping</Link>
            </div>
        )}

        {/* GRID */}
        <div className="fav-grid">
            {!isFetching && favorites.map((product) => {
                const imgFront = product.image_urls[0] || "/placeholder.jpg";
                const imgBack = product.image_urls[1] || imgFront;

                // --- PRICE LOGIC (FIXED) ---
                // We default to price if discounted_price is 0 or null
                const sellingPrice = product.discounted_price || product.price;
                const cutPrice = product.price;
                const hasCutPrice = cutPrice > sellingPrice;

                return (
                    <Link 
                        href={`/products/${product.slug}`} 
                        key={product.id} 
                        className={`fav-card ${removingId === product.id ? 'removing' : ''}`}
                    >
                        <div className="image-container">
                            <Image
                                src={imgFront}
                                alt={product.title}
                                fill
                                priority={false}
                                unoptimized={true}
                                className="img-main"
                                sizes="(max-width: 768px) 50vw, 16vw"
                            />
                            <Image
                                src={imgBack}
                                alt={product.title}
                                fill
                                unoptimized={true}
                                className="img-hover"
                            />

                            <button 
                                onClick={(e) => handleRemove(e, product.id)}
                                className="btn-heart-remove"
                                title="Remove from Favorites"
                            >
                                <i className="fas fa-heart"></i>
                            </button>
                        </div>

                        <div className="card-body">
                            <span className="date-badge">
                                {product.favorited_at ? new Date(product.favorited_at).toLocaleDateString() : 'RECENT'}
                            </span>

                            <h3 className="prod-title">{product.title}</h3>

                            <div className="price-row">
                                <div className="price-block">
                                    <span className="price-main">Rs. {sellingPrice.toLocaleString()}</span>
                                    {hasCutPrice && (
                                        <span className="price-cut">Rs. {cutPrice.toLocaleString()}</span>
                                    )}
                                </div>
                                <div className="cart-icon-btn">
                                    <i className="fas fa-shopping-bag"></i>
                                </div>
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
      </div>
    </div>
  );
}