"use client";
import React, { useState } from 'react';

export default function ProductAccordion({ product, parsedAttributes, showToast }: any) {
  const [activeAccordion, setActiveAccordion] = useState<string | null>('details');
  const [isDescriptionCopied, setIsDescriptionCopied] = useState(false);

  const handleAccordionClick = (itemName: string) => setActiveAccordion(prev => (prev === itemName ? null : itemName));
  
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

  return (
    <ul className="pdp-info-list">
        <li className={`info-item ${activeAccordion === 'details' ? 'active' : ''}`}>
            <div className="info-item-header" onClick={() => handleAccordionClick('details')}>
                <i className="icon fas fa-file-alt"></i><span className="text">Product Details & Overview</span>
                <i className="chevron fas fa-chevron-down" style={{marginLeft: 'auto'}}></i>
            </div>
            <div className="info-item-content">
                {parsedAttributes && Object.keys(parsedAttributes).length > 0 && (
                    <div className="attributes-section">
                        <h5 style={{margin: '0 0 12px', fontSize: '15px', fontWeight: '800'}}>Specifications:</h5>
                        {Object.entries(parsedAttributes).map(([key, value]) => (
                            <div key={key} style={{display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px', borderBottom: '1px dashed #ddd', paddingBottom: '4px'}}>
                                <span style={{fontWeight: '700', color: '#444', textTransform: 'capitalize'}}>{key.replace(/_/g, ' ')}:</span>
                                <span style={{color: '#222'}}>{String(value)}</span>
                            </div>
                        ))}
                    </div>
                )}
                
                {/* 🟢 BEAUTIFUL FORMATTED DESCRIPTION WITH ENTERS & LINE BREAKS */}
                <div className="desc-text-formatted">
                    {product.description || "No description available."}
                </div>

                <button className={`copy-desc-btn ${isDescriptionCopied ? 'copied' : ''}`} onClick={handleCopyDescription}>
                    {isDescriptionCopied ? <i className="fas fa-check"></i> : <i className="far fa-copy"></i>}
                    {isDescriptionCopied ? "Description Copied!" : "Copy Description"}
                </button>
            </div>
        </li>

        <style jsx>{`
            .pdp-info-list { list-style: none; padding: 0; margin: 20px 0; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.02); }
            .info-item-header { display: flex; align-items: center; padding: 18px 20px; background: #fafafa; cursor: pointer; font-weight: 700; font-size: 15px; color: #0f172a; }
            .info-item-header .icon { margin-right: 12px; color: #00b862; font-size: 18px; }
            .info-item-content { max-height: 0; overflow: hidden; transition: max-height 0.3s ease, padding 0.3s ease; background: #fff; font-size: 14px; line-height: 1.6; color: #475569; }
            .info-item.active .info-item-content { max-height: 3000px; padding: 22px; border-top: 1px solid #f1f5f9; }
            
            .desc-text-formatted {
                white-space: pre-line; /* 🟢 BEAUTIFUL ENTERS & PARAGRAPHS */
                line-height: 1.8;
                color: #334155;
                font-size: 14px;
                word-break: break-word;
            }

            .copy-desc-btn { margin-top: 20px; padding: 10px 18px; background: #f0fdf4; color: #00b862; border: 1px solid #bbf7d0; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s; }
            .copy-desc-btn:hover { background: #00b862; color: white; }
            .attributes-section { margin-bottom: 20px; padding: 15px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; }
        `}</style>
    </ul>
  );
}