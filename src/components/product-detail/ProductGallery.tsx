// src/components/product-detail/ProductGallery.tsx
"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';

const R2_DOMAIN = "https://media.sj10.pk";

// 🟢 BULLETPROOF URL FORMATTER
const formatMediaUrl = (path: string | null | undefined) => {
  if (!path || path === 'null' || path === 'undefined') return '/placeholder.jpg';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('/')) return path;
  return `${R2_DOMAIN}/${path.replace(/^\/+/, '')}`;
};

const getYouTubeId = (url: string) => { 
  if (!url) return null;
  const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/); 
  return (match && match[2].length === 11) ? match[2] : null; 
};

export default function ProductGallery({ 
    product, 
    images = [], 
    mediaItems = [], 
    isFavorite, 
    handleToggleFavorite,
    showToast 
}: any) {
  const [mounted, setMounted] = useState(false);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50, show: false });
  
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); 
  const [isMuted, setIsMuted] = useState<boolean>(false); 
  const videoRef = useRef<HTMLVideoElement>(null);

  // Safe Media Items list
  const safeMediaList = useMemo(() => {
    if (mediaItems && mediaItems.length > 0) return mediaItems;
    if (images && images.length > 0) return images.map((img: string) => ({ type: 'image', url: img }));
    return [{ type: 'image', url: '/placeholder.jpg' }];
  }, [mediaItems, images]);

  const activeMedia = safeMediaList[activeMediaIndex] || safeMediaList[0];
  const activeMediaUrl = formatMediaUrl(activeMedia?.url);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 🟢 AUTOMATIC UNMUTED VIDEO PLAYBACK HANDLER
  useEffect(() => {
    if (activeMedia?.type === 'video' && videoRef.current) {
      const vid = videoRef.current;
      vid.playbackRate = playbackSpeed;
      vid.muted = isMuted;

      const playPromise = vid.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          if (vid) {
            vid.muted = true;
            setIsMuted(true);
            vid.play().catch(() => {});
          }
        });
      }
    }
  }, [activeMediaIndex, activeMedia, isMuted, playbackSpeed]);

  // FREEZE BACKGROUND SCROLL WHEN MODAL IS OPEN
  useEffect(() => {
    if (isImageModalOpen || isDownloadModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isImageModalOpen, isDownloadModalOpen]);

  const togglePlaybackSpeed = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextSpeed = playbackSpeed === 1 ? 2 : 1;
    if (videoRef.current) {
      videoRef.current.playbackRate = nextSpeed;
    }
    setPlaybackSpeed(nextSpeed);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextMuteState = !isMuted;
    if (videoRef.current) {
      videoRef.current.muted = nextMuteState;
    }
    setIsMuted(nextMuteState);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (typeof window !== 'undefined' && window.innerWidth <= 768) return; 
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y, show: true });
  };

  const handleMouseLeave = () => {
    setZoomPos(prev => ({ ...prev, show: false }));
  };

  const ytId = useMemo(() => {
    return activeMedia?.type === 'video' ? getYouTubeId(activeMedia.url) : null;
  }, [activeMedia]);

  return (
    <div className="pdp-image-gallery">
      {/* Main Image Container */}
      <div 
        className="main-image-container" 
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={() => activeMedia?.type === 'image' && setIsImageModalOpen(true)}
      >
        <div className="image-counter-badge">
          {activeMediaIndex + 1} / {safeMediaList.length}
        </div>

        {/* Previous / Next Navigation Arrows */}
        {safeMediaList.length > 1 && (
          <button 
            className="img-nav-btn img-nav-left" 
            aria-label="Previous product image"
            onClick={(e) => { e.stopPropagation(); setActiveMediaIndex((prev) => (prev - 1 + safeMediaList.length) % safeMediaList.length); }}
          >
            <i className="fas fa-chevron-left" aria-hidden="true"></i>
          </button>
        )}
        
        {safeMediaList.length > 1 && (
          <button 
            className="img-nav-btn img-nav-right" 
            aria-label="Next product image"
            onClick={(e) => { e.stopPropagation(); setActiveMediaIndex((prev) => (prev + 1) % safeMediaList.length); }}
          >
            <i className="fas fa-chevron-right" aria-hidden="true"></i>
          </button>
        )}

        {/* Video vs Image */}
        {activeMedia?.type === 'video' ? (
           ytId ? (
              <iframe 
                src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=0&controls=1&loop=1&playlist=${ytId}&modestbranding=1&rel=0`} 
                className="pdp-main-video loaded" 
                allow="autoplay; encrypted-media" 
                title="Product Video" 
                style={{ width: '100%', height: '100%', border: 'none', opacity: 1 }} 
              />
           ) : ( 
              <div className="video-player-wrap" onClick={(e) => e.stopPropagation()}>
                <video 
                  ref={videoRef}
                  key={activeMediaUrl} 
                  src={activeMediaUrl} 
                  className="pdp-main-video loaded" 
                  controls 
                  autoPlay 
                  loop 
                  muted={isMuted}
                  playsInline 
                  style={{ width: '100%', height: '100%', objectFit: 'contain', opacity: 1 }} 
                />

                <div className="video-overlay-controls">
                  <button className="video-ctrl-badge" onClick={togglePlaybackSpeed} aria-label="Toggle playback speed">
                    <i className="fas fa-bolt" aria-hidden="true"></i> {playbackSpeed}x Speed
                  </button>
                  <button className={`video-ctrl-badge ${!isMuted ? 'sound-on-active' : ''}`} onClick={toggleMute} aria-label="Toggle audio">
                    <i className={isMuted ? "fas fa-volume-xmark" : "fas fa-volume-high text-emerald-400"} aria-hidden="true"></i> 
                    <span>{isMuted ? 'Muted' : 'Sound ON'}</span>
                  </button>
                </div>
              </div>
           )
        ) : ( 
          /* 🟢 VISIBILITY FIXED: Added "loaded" class & inline opacity: 1 */
          <Image 
            key={activeMediaUrl}
            src={activeMediaUrl} 
            alt={product?.title || "Product Image"} 
            className="pdp-main-image loaded" 
            fill 
            sizes="(max-width: 768px) 100vw, 550px"
            priority={true} 
            loading="eager"
            fetchPriority="high"
            unoptimized={true}
            style={{ 
              objectFit: 'contain', 
              opacity: 1, /* 🟢 FORCES 100% VISIBILITY */
              transform: zoomPos.show ? 'scale(2.2)' : 'scale(1)',
              transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`
            }} 
          /> 
        )}

        {/* Floating Heart Button */}
        <button 
          className={`image-heart-btn ${isFavorite ? 'heart-active' : ''}`} 
          onClick={(e) => { e.stopPropagation(); handleToggleFavorite(); }}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <i className={isFavorite ? "fas fa-heart text-red" : "far fa-heart"} aria-hidden="true"></i>
        </button>
      </div>

      {/* Thumbnails Row */}
      <div className="thumbnail-container">
        {safeMediaList.map((media: any, index: number) => {
          const rawThumbUrl = media.type === 'video' ? (images[0] || '/placeholder.jpg') : media.url;
          const thumbUrl = formatMediaUrl(rawThumbUrl);

          return (
            <button 
              key={index} 
              className={`thumbnail ${activeMediaIndex === index ? 'active' : ''}`} 
              onClick={() => setActiveMediaIndex(index)}
              aria-label={`View product image ${index + 1}`}
            >
              <Image 
                src={thumbUrl} 
                alt=""
                aria-hidden="true"
                fill 
                sizes="65px"
                loading="lazy"
                style={{ objectFit: 'cover' }} 
                unoptimized={true}
              />
              {media.type === 'video' && (
                <div className="video-thumbnail-overlay">
                  <i className="fas fa-play" aria-hidden="true"></i>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Download Media Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
        <button className="download-media-trigger-btn" onClick={() => setIsDownloadModalOpen(true)} aria-label="Download product images and description">
          <i className="fas fa-download" aria-hidden="true"></i> Download Media
        </button>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {mounted && isImageModalOpen && createPortal(
        <div className="fs-lightbox-overlay" onClick={() => setIsImageModalOpen(false)}>
          <button className="fs-lightbox-close" onClick={(e) => { e.stopPropagation(); setIsImageModalOpen(false); }} aria-label="Close fullscreen view">
            <i className="fas fa-times" aria-hidden="true"></i>
          </button>

          <div className="fs-lightbox-counter">
            {activeMediaIndex + 1} / {safeMediaList.length}
          </div>

          <div className="fs-lightbox-center" onClick={(e) => e.stopPropagation()}>
            {safeMediaList.length > 1 && (
              <button className="fs-nav-btn left" onClick={(e) => { e.stopPropagation(); setActiveMediaIndex((prev) => (prev - 1 + safeMediaList.length) % safeMediaList.length); }} aria-label="Previous image">
                <i className="fas fa-chevron-left" aria-hidden="true"></i>
              </button>
            )}

            <div className="fs-main-img-wrap">
               <img src={activeMediaUrl} alt={product?.title || "Fullscreen View"} className="fs-main-img" />
            </div>

            {safeMediaList.length > 1 && (
              <button className="fs-nav-btn right" onClick={(e) => { e.stopPropagation(); setActiveMediaIndex((prev) => (prev + 1) % safeMediaList.length); }} aria-label="Next image">
                <i className="fas fa-chevron-right" aria-hidden="true"></i>
              </button>
            )}
          </div>

          <div className="fs-lightbox-thumbs" onClick={(e) => e.stopPropagation()}>
            {safeMediaList.map((media: any, index: number) => {
              const thumbUrl = formatMediaUrl(media.type === 'video' ? images[0] : media.url);
              return (
                <button 
                  key={index} 
                  className={`fs-thumb-item ${activeMediaIndex === index ? 'active' : ''}`}
                  onClick={() => setActiveMediaIndex(index)}
                  aria-label={`Select image ${index + 1}`}
                >
                  <img src={thumbUrl} alt="" aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </div>,
        document.body
      )}

      {/* Download Modal */}
      {mounted && isDownloadModalOpen && createPortal(
        <DownloadOptionsModal 
          images={images.map(formatMediaUrl)} 
          videoUrl={product?.video_url ? formatMediaUrl(product.video_url) : null} 
          product={product} 
          showToast={showToast}
          onClose={() => setIsDownloadModalOpen(false)} 
        />,
        document.body
      )}

      <style jsx>{`
        .pdp-image-gallery { width: 100%; position: relative; }
        .main-image-container { position: relative; width: 100%; height: 420px; background-color: #ffffff; border-radius: 16px; overflow: hidden; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; border: 1px solid #f1f5f9; cursor: zoom-in; }
        
        /* 🟢 FORCED OPACITY 1 OVERRIDE */
        .pdp-main-image { 
          width: 100%; 
          height: 100%; 
          object-fit: contain; 
          display: block; 
          opacity: 1 !important; 
          transition: transform 0.2s ease-out; 
        }
        
        @media (max-width: 768px) { .main-image-container { height: 320px; cursor: default; } }
        
        .video-player-wrap { position: relative; width: 100%; height: 100%; background: #000000; }
        .pdp-main-video { width: 100%; height: 100%; object-fit: contain; opacity: 1 !important; }
        
        .video-overlay-controls { position: absolute; top: 12px; left: 12px; display: flex; gap: 8px; z-index: 15; }
        .video-ctrl-badge { background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(8px); color: white; border: 1px solid rgba(255, 255, 255, 0.25); padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.2s; box-shadow: 0 4px 10px rgba(0,0,0,0.2); }
        .video-ctrl-badge:hover { background: #00b862; border-color: #00b862; transform: scale(1.05); }
        .video-ctrl-badge.sound-on-active { background: #00b862; border-color: #00b862; }

        .image-counter-badge {
          position: absolute; top: 12px; left: 12px;
          background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(6px);
          color: white; font-size: 11px; font-weight: 800; padding: 4px 10px;
          border-radius: 20px; z-index: 15;
        }

        .download-media-trigger-btn {
          background: #f0fdf4; color: #00b862; border: 1px solid #bbf7d0;
          padding: 8px 16px; border-radius: 10px; font-size: 13px; font-weight: 700;
          cursor: pointer; display: inline-flex; align-items: center; gap: 8px;
          transition: all 0.2s;
        }
        .download-media-trigger-btn:hover { background: #00b862; color: white; }

        .thumbnail-container { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; scrollbar-width: none; }
        .thumbnail-container::-webkit-scrollbar { display: none; }
        .thumbnail { width: 65px; height: 65px; border-radius: 10px; border: 2px solid transparent; overflow: hidden; position: relative; cursor: pointer; transition: all 0.2s; flex-shrink: 0; background: #ffffff; padding: 0; }
        .thumbnail.active { border-color: #00b862; box-shadow: 0 2px 8px rgba(0,184,98,0.2); }

        .video-thumbnail-overlay {
          position: absolute; inset: 0; background: rgba(0, 0, 0, 0.4);
          display: flex; align-items: center; justify-content: center;
          color: white; font-size: 16px;
        }

        .img-nav-btn { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.9); color: #333; border: none; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 20; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .img-nav-left { left: 10px; } .img-nav-right { right: 10px; }

        .image-heart-btn {
            position: absolute; bottom: 12px; right: 12px; width: 40px; height: 40px; border-radius: 50%;
            background: #ffffff; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: center;
            font-size: 18px; cursor: pointer; z-index: 25; box-shadow: 0 4px 10px rgba(0,0,0,0.12); transition: transform 0.2s;
        }
        .image-heart-btn:active { transform: scale(0.85); }
        .image-heart-btn i.text-red { color: #e91e63 !important; }
      `}</style>

      {/* Global Lightbox Styles */}
      <style jsx global>{`
        .fs-lightbox-overlay {
          position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important;
          background: rgba(0,0,0,0.95) !important;
          z-index: 2147483647 !important;
          display: flex; flex-direction: column; justify-content: center; align-items: center;
          animation: fadeIn 0.2s ease-out;
        }
        
        .fs-lightbox-close {
          position: absolute; top: 20px; right: 20px;
          background: rgba(255,255,255,0.2); color: white; border: none;
          width: 44px; height: 44px; border-radius: 50%; font-size: 20px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; z-index: 10; transition: 0.2s;
        }
        .fs-lightbox-close:hover { background: #ef4444; transform: scale(1.1); }
        
        .fs-lightbox-counter {
          position: absolute; top: 25px; left: 20px;
          background: rgba(255,255,255,0.2); color: white; padding: 6px 14px;
          border-radius: 20px; font-weight: 700; font-size: 14px; letter-spacing: 1px;
        }

        .fs-lightbox-center {
          position: relative; display: flex; align-items: center; justify-content: center;
          width: 100%; max-width: 900px; height: 75vh; padding: 0 20px; box-sizing: border-box;
        }

        .fs-main-img-wrap {
          position: relative; width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
        }

        .fs-main-img {
          max-width: 100%; max-height: 100%; object-fit: contain;
          border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.5);
        }

        .fs-nav-btn {
          position: absolute; top: 50%; transform: translateY(-50%);
          background: rgba(255,255,255,0.2); color: white; border: none;
          width: 50px; height: 50px; border-radius: 50%; font-size: 20px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: 0.2s; z-index: 10;
        }
        .fs-nav-btn:hover { background: white; color: black; }
        .fs-nav-btn.left { left: -20px; }
        .fs-nav-btn.right { right: -20px; }
        @media (max-width: 768px) {
          .fs-nav-btn.left { left: 5px; }
          .fs-nav-btn.right { right: 5px; }
        }

        .fs-lightbox-thumbs {
          position: absolute; bottom: 20px; left: 0; right: 0;
          display: flex; gap: 10px; justify-content: center; overflow-x: auto; padding: 10px;
        }
        .fs-thumb-item {
          width: 55px; height: 55px; border-radius: 10px; overflow: hidden;
          border: 2px solid transparent; cursor: pointer; opacity: 0.6; transition: 0.2s; background: white; padding: 0;
        }
        .fs-thumb-item.active { border-color: #00b862; opacity: 1; transform: scale(1.1); }
        .fs-thumb-item img { width: 100%; height: 100%; object-fit: cover; }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .download-modal-sheet {
            position: fixed !important; bottom: 0 !important; left: 0 !important; right: 0 !important;
            background: white !important; border-radius: 24px 24px 0 0 !important; padding: 25px !important;
            z-index: 2147483647 !important; max-width: 500px !important; margin: 0 auto !important;
            animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .dm-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid #f1f5f9; }
        .dm-option { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 10px; cursor: pointer; transition: all 0.2s; background: #fafafa; }
        .dm-option.selected { border-color: #00b862; background: #f0fdf4; }
        .dm-check { width: 22px; height: 22px; border-radius: 50%; border: 2px solid #cbd5e1; position: relative; transition: all 0.2s; }
        .dm-option.selected .dm-check { border-color: #00b862; background: #00b862; }
        .dm-option.selected .dm-check::after { content: '✓'; position: absolute; color: white; font-size: 13px; top: 50%; left: 50%; transform: translate(-50%, -50%); }
        .dm-action-btn { width: 100%; padding: 16px; border: none; border-radius: 12px; font-size: 15px; font-weight: 800; cursor: pointer; transition: all 0.3s; position: relative; overflow: hidden; background: #0f172a; color: white; }
        .dm-action-btn.success { background: #00b862; }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>
    </div>
  );
}

function DownloadOptionsModal({ images, videoUrl, product, showToast, onClose }: any) {
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
      const text = `Product Title: ${product?.title}\n\nProduct Description: ${product?.description || 'N/A'}\n\nSKU: ${product?.sku || 'N/A'}`;
      await navigator.clipboard.writeText(text);
    };

    const handleDownload = async () => {
        if (status !== 'idle') return;
        if (dlText) await handleCopyText();

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
            setStatus('success'); 
            showToast?.("Media Saved & Details Copied!", "fa-check-circle");
            setTimeout(() => onClose(), 1500);
        } catch (error) { 
            showToast?.("Download failed", "fa-times-circle", "#ef4444"); 
            setStatus('idle'); 
        }
    };

    return (
        <div className="download-modal-sheet">
            <div className="dm-header">
                <h3 style={{margin:0, fontSize:'18px', fontWeight: '800', color: '#111'}}>Download Options</h3>
                <button 
                  onClick={onClose} 
                  aria-label="Close download modal"
                  style={{fontSize:'24px', cursor:'pointer', color: '#888', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none'}}
                >
                  &times;
                </button>
            </div>
            <div style={{opacity: status === 'idle' ? 1 : 0.5, pointerEvents: status === 'idle' ? 'auto' : 'none'}}>
                <div className={`dm-option ${dlImages ? 'selected' : ''}`} onClick={() => setDlImages(!dlImages)}>
                  <div style={{display:'flex', alignItems:'center', gap:'15px'}}><i className="fas fa-images" style={{color:'#00b862', fontSize:'20px'}}></i><span style={{fontWeight:'700', fontSize: '14px'}}>Images ({images.length})</span></div><div className="dm-check"></div>
                </div>
                {hasVideo && (<div className={`dm-option ${dlVideo ? 'selected' : ''}`} onClick={() => setDlVideo(!dlVideo)}><div style={{display:'flex', alignItems:'center', gap:'15px'}}><i className="fas fa-video" style={{color:'#00b862', fontSize:'20px'}}></i><span style={{fontWeight:'700', fontSize: '14px'}}>Product Video</span></div><div className="dm-check"></div></div>)}
                <div className={`dm-option ${dlText ? 'selected' : ''}`} onClick={() => setDlText(!dlText)}>
                  <div style={{display:'flex', alignItems:'center', gap:'15px'}}><i className="fas fa-file-alt" style={{color:'#00b862', fontSize:'20px'}}></i><span style={{fontWeight:'700', fontSize: '14px'}}>Copy Description</span></div><div className="dm-check"></div>
                </div>
            </div>
            <div style={{marginTop:'25px'}}>
              <button className={`dm-action-btn ${status === 'success' ? 'success' : ''}`} onClick={handleDownload} style={{'--progress': `${progress}%`} as React.CSSProperties} aria-label="Start download">
                {status === 'idle' && <><i className="fas fa-download"></i> Download & Copy Details</>}
                {status === 'downloading' && (<><i className="fas fa-spinner fa-spin"></i> Downloading {progressText}...</>)}
                {status === 'success' && (<><i className="fas fa-check-circle success-icon"></i> Download Complete!</>)}
              </button>
            </div>
        </div>
    );
}