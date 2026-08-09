"use client";

import React, { useState } from 'react';
import Image from 'next/image';

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const getInitials = (name: string) => {
  if (!name) return "U";
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

export default function ProductReviews({ reviews, reviewCount }: { reviews: any[], reviewCount?: number }) {
  // 🟢 5-REVIEWS PER PAGE PAGINATION STATE
  const [visibleCount, setVisibleCount] = useState(5);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const reviewsList = Array.isArray(reviews) ? reviews : [];
  const totalCount = reviewCount || reviewsList.length || 0;

  const visibleReviews = reviewsList.slice(0, visibleCount);
  const remainingCount = reviewsList.length - visibleCount;
  const hasMore = visibleCount < reviewsList.length;

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 5);
  };

  return (
    <div className="pdp-reviews-wrapper">
      <div className="reviews-header">
        <div className="reviews-title-wrap">
          <i className="fas fa-comments reviews-icon"></i>
          <h3 className="reviews-heading">Customer Reviews</h3>
          <span className="reviews-count-badge">{totalCount}</span>
        </div>
      </div>

      {/* REVIEWS LIST */}
      {reviewsList.length > 0 ? (
        <div className="review-list-grid">
          {visibleReviews.map((review: any, idx: number) => {
            let reviewImgs: string[] = [];
            try {
              if (review.image_urls) {
                reviewImgs = typeof review.image_urls === 'string' ? JSON.parse(review.image_urls) : review.image_urls;
              } else if (review.image_url) {
                reviewImgs = typeof review.image_url === 'string' && review.image_url.startsWith('[') 
                  ? JSON.parse(review.image_url) 
                  : [review.image_url];
              }
            } catch (e) {
              if (review.image_url) reviewImgs = [review.image_url];
            }

            const avatarUrl = review.user_avatar || review.user_dp || review.profile_pic || null;

            return (
              <div key={review.id || idx} className="review-card-item animate-card-entry">
                <div className="review-card-top">
                  
                  {/* USER DP & METADATA */}
                  <div className="user-profile-meta">
                    <div className="avatar-wrapper">
                      {avatarUrl ? (
                        <Image 
                          src={avatarUrl} 
                          alt={review.user_name || 'User'} 
                          width={42} 
                          height={42} 
                          className="user-dp-img" 
                          unoptimized 
                        />
                      ) : (
                        <div className="initials-avatar">
                          {getInitials(review.user_name)}
                        </div>
                      )}
                    </div>

                    <div className="user-details">
                      <span className="user-name-text">{review.user_name || 'Verified Buyer'}</span>
                      <div className="buyer-sub-meta">
                        <span className="verified-buyer-badge">
                          <i className="fas fa-circle-check"></i> Verified Purchase
                        </span>
                        <span className="dot-sep">•</span>
                        <span className="review-date-text">{formatDate(review.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* 🟢 ANIMATED GOLDEN EDGE STARS */}
                  <div className="star-rating-row">
                    {[...Array(5)].map((_, i) => (
                      <i 
                        key={i} 
                        className={i < (review.rating || 5) ? "fas fa-star star-filled star-anim" : "far fa-star star-empty"}
                        style={{ animationDelay: `${i * 0.1}s` }}
                      ></i>
                    ))}
                  </div>
                </div>

                {/* REVIEW COMMENT */}
                <p className="review-comment-text">{review.comment || 'Great product!'}</p>

                {/* ATTACHED PHOTOS */}
                {reviewImgs.length > 0 && (
                  <div className="review-photos-grid">
                    {reviewImgs.map((imgUrl: string, i: number) => (
                      <div 
                        key={i} 
                        className="review-photo-thumb"
                        onClick={() => setSelectedImage(imgUrl)}
                      >
                        <Image src={imgUrl} alt="Customer Photo" fill style={{ objectFit: 'cover' }} unoptimized />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* 🟢 LOAD MORE REVIEWS BUTTON (5 AT A TIME) */}
          {hasMore && (
            <div className="load-more-reviews-wrap">
              <button className="load-more-reviews-btn" onClick={handleLoadMore}>
                <span>Load More Reviews ({remainingCount} remaining)</span>
                <i className="fas fa-chevron-down"></i>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* NO REVIEWS EMPTY STATE */
        <div className="no-reviews-box">
          <div className="no-reviews-icon">
            <i className="far fa-comment-dots"></i>
          </div>
          <h4 className="no-reviews-title">No Reviews Yet</h4>
          <p className="no-reviews-desc">Be the first customer to review this product after your purchase!</p>
        </div>
      )}

      {/* FULLSCREEN PHOTO LIGHTBOX MODAL */}
      {selectedImage && (
        <div className="review-modal-overlay" onClick={() => setSelectedImage(null)}>
          <div className="review-modal-content" onClick={e => e.stopPropagation()}>
            <button className="review-modal-close" onClick={() => setSelectedImage(null)}>
              <i className="fas fa-times"></i>
            </button>
            <div className="review-modal-img-wrap">
              <Image src={selectedImage} alt="Review zoom" fill style={{ objectFit: 'contain' }} unoptimized priority />
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .pdp-reviews-wrapper {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 22px;
          margin: 20px 0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
        }

        .reviews-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 1px solid #f1f5f9;
        }

        .reviews-title-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .reviews-icon {
          color: #f85606;
          font-size: 18px;
        }

        .reviews-heading {
          font-size: 17px;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
        }

        .reviews-count-badge {
          background: #fff7ed;
          color: #f85606;
          border: 1px solid #ffedd5;
          font-size: 12px;
          font-weight: 800;
          padding: 2px 10px;
          border-radius: 20px;
        }

        .review-list-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .review-card-item {
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          border-radius: 14px;
          padding: 16px;
          transition: all 0.2s ease;
        }
        .review-card-item.animate-card-entry {
          animation: cardFadeIn 0.4s ease-out forwards;
        }
        @keyframes cardFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .review-card-item:hover {
          border-color: #cbd5e1;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }

        /* 🟢 UN-SQUEEZED MOBILE RESPONSIVE FLEX */
        .review-card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }

        .user-profile-meta {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .avatar-wrapper {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
          border: 1.5px solid #e2e8f0;
          position: relative;
        }

        .user-dp-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
        }

        .initials-avatar {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #00b862 0%, #009952 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 15px;
          letter-spacing: 0.5px;
        }

        .user-details {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .user-name-text {
          font-size: 14px;
          font-weight: 800;
          color: #0f172a;
          line-height: 1.2;
        }

        .buyer-sub-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: #64748b;
          flex-wrap: wrap;
        }

        .verified-buyer-badge {
          color: #00b862;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .dot-sep { color: #cbd5e1; }

        /* 🟢 GOLDEN EDGE ANIMATED STARS */
        .star-rating-row {
          display: flex;
          gap: 3px;
          font-size: 14px;
        }

        .star-filled {
          color: #fbbf24;
          filter: drop-shadow(0 1px 2px rgba(245, 158, 11, 0.4));
        }

        .star-anim {
          animation: starBounce 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        @keyframes starBounce {
          0% { transform: scale(0.6); opacity: 0; }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); opacity: 1; }
        }

        .star-empty { color: #cbd5e1; }

        .review-comment-text {
          margin: 0;
          font-size: 14px;
          color: #334155;
          line-height: 1.6;
          white-space: pre-line;
          word-break: break-word;
        }

        .review-photos-grid {
          display: flex;
          gap: 10px;
          margin-top: 12px;
          overflow-x: auto;
        }

        .review-photo-thumb {
          position: relative;
          width: 65px;
          height: 65px;
          border-radius: 10px;
          overflow: hidden;
          border: 1.5px solid #e2e8f0;
          cursor: pointer;
          transition: transform 0.2s;
          flex-shrink: 0;
        }
        .review-photo-thumb:hover {
          transform: scale(1.05);
          border-color: #00b862;
        }

        /* LOAD MORE BUTTON */
        .load-more-reviews-wrap {
          display: flex;
          justify-content: center;
          margin-top: 10px;
        }

        .load-more-reviews-btn {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          color: #0f172a;
          padding: 10px 22px;
          border-radius: 50px;
          font-size: 12.5px;
          font-weight: 800;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.03);
          transition: all 0.25s ease;
        }

        .load-more-reviews-btn:hover {
          background: #f85606;
          color: #ffffff;
          border-color: #f85606;
          transform: translateY(-2px);
          box-shadow: 0 4px 14px rgba(248, 86, 6, 0.25);
        }

        /* EMPTY STATE */
        .no-reviews-box {
          text-align: center;
          padding: 30px 15px;
          background: #f8fafc;
          border-radius: 12px;
          border: 1px dashed #cbd5e1;
        }

        .no-reviews-icon {
          font-size: 32px;
          color: #94a3b8;
          margin-bottom: 8px;
        }

        .no-reviews-title {
          font-size: 15px;
          font-weight: 800;
          color: #1e293b;
          margin: 0 0 4px 0;
        }

        .no-reviews-desc {
          font-size: 13px;
          color: #64748b;
          margin: 0;
        }

        /* MODAL LIGHTBOX */
        .review-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(8px);
          z-index: 2147483647;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .review-modal-content {
          position: relative;
          width: 100%;
          max-width: 600px;
          height: 80vh;
          max-height: 550px;
          background: white;
          border-radius: 20px;
          overflow: hidden;
          padding: 15px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
        }

        .review-modal-close {
          position: absolute;
          top: 15px;
          right: 15px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(15, 23, 42, 0.8);
          color: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          cursor: pointer;
          z-index: 10;
        }

        .review-modal-img-wrap {
          position: relative;
          width: 100%;
          height: 100%;
        }
      `}</style>
    </div>
  );
}