"use client";
import React from 'react';

type Props = {
  isSharing: boolean;
  isOutOfStock: boolean;
  handleShareButton: () => void;
  handleBuyNow: () => void;
};

export default function ProductActions({ isSharing, isOutOfStock, handleShareButton, handleBuyNow }: Props) {
  return (
    <div className="pdp-action-buttons">
      <button className="share-now-btn" onClick={handleShareButton}>
        {isSharing ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-share-alt"></i> Share</>}
      </button>
      <button className={`buy-now-btn ${isOutOfStock ? 'out-of-stock' : ''}`} onClick={handleBuyNow} disabled={isOutOfStock}>
        {isOutOfStock ? <><i className="fas fa-ban"></i> Out of Stock</> : <><i className="fas fa-shopping-bag"></i> Buy Now</>}
      </button>
    </div>
  );
}