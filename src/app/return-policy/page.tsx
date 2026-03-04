"use client";

import React, { useEffect, useState } from 'react';
import '../../styles/PolicyPages.css';

const ReturnPolicy = () => {
    const [activeSection, setActiveSection] = useState('overview');

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setActiveSection(id);
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            const sections = document.querySelectorAll('.policy-section');
            let current = '';
            sections.forEach((section) => {
                const sectionTop = (section as HTMLElement).offsetTop;
                if (window.scrollY >= sectionTop - 150) current = section.getAttribute('id') || '';
            });
            if (current) setActiveSection(current);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const sections = [
        { id: 'overview', title: '1. 7-Day Return Guarantee' },
        { id: 'eligibility', title: '2. Return Eligibility' },
        { id: 'proof', title: '3. Video Proof Requirement' },
        { id: 'process', title: '4. Return Process' },
        { id: 'refunds', title: '5. Refund Timeline' },
    ];

    return (
        <div className="policy-container">
            <title>Return Policy | SJ10 Shopping</title>
            
            <div className="policy-hero fade-in-down">
                <h1 className="policy-title">Return & Refund Policy</h1>
                <p className="policy-subtitle">We want you to shop with confidence. Read about our 7-day hassle-free return policy below.</p>
            </div>

            <div className="policy-content-wrapper">
                <aside className="toc-sidebar slide-in-up">
                    <div className="toc-card">
                        <div className="toc-title">Table of Contents</div>
                        <ul className="toc-list">
                            {sections.map(section => (
                                <li key={section.id} 
                                    className={`toc-item ${activeSection === section.id ? 'active' : ''}`}
                                    onClick={() => scrollToSection(section.id)}>
                                    {section.title}
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>

                <main className="policy-text-area">
                    <section id="overview" className="policy-section">
                        <h2 className="section-title"><span className="section-icon">🛡️</span> 1. 7-Day Return Guarantee</h2>
                        <p>At SJ10, we prioritize customer satisfaction. We offer a <strong>7-Day Return Policy</strong> on most products starting from the date of delivery. This allows you to inspect the product and ensure it meets your expectations.</p>
                        <p>If you find any issue with the product, you must report it to us within 7 days. Claims made after this period will not be entertained.</p>
                    </section>

                    <section id="eligibility" className="policy-section">
                        <h2 className="section-title"><span className="section-icon">✅</span> 2. Return Eligibility</h2>
                        <p>Returns are accepted under the following conditions:</p>
                        <ul>
                            <li><strong>Damaged Product:</strong> The item arrived broken or damaged.</li>
                            <li><strong>Wrong Item:</strong> You received a different size, color, or model than what you ordered.</li>
                            <li><strong>Defective:</strong> The product is not functioning (e.g., electronic faults).</li>
                            <li><strong>Missing Parts:</strong> The package was incomplete.</li>
                        </ul>
                        <p><em>Note: Change of mind returns are generally not accepted unless specified on the product page.</em></p>
                    </section>

                    <section id="proof" className="policy-section">
                        <h2 className="section-title"><span className="section-icon">📹</span> 3. Video Proof Requirement</h2>
                        <p>To ensure transparency and prevent fraud, SJ10 strictly requires <strong>Video Proof</strong> for all returns.</p>
                        <p><strong>What is an Unboxing Video?</strong><br/> Before opening your parcel, start recording a video. Record the label, the sealed flyer, and the process of opening the package. If the item is damaged or missing, this video acts as undeniable proof.</p>
                        <p style={{color: '#dc2626'}}><strong>Important:</strong> Without a proper unboxing video, your return claim may be rejected.</p>
                    </section>

                    <section id="process" className="policy-section">
                        <h2 className="section-title"><span className="section-icon">🔄</span> 4. Return Process</h2>
                        <ol>
                            <li>Log in to your SJ10 account.</li>
                            <li>Go to <strong>My Orders</strong> and select the order you want to return.</li>
                            <li>Click "Request Return" and upload the required images/video.</li>
                            <li>Our team will review the request within 24 hours.</li>
                            <li>Once approved, you will be guided on how to ship the item back to us (or we will arrange a pickup).</li>
                        </ol>
                    </section>

                    <section id="refunds" className="policy-section">
                        <h2 className="section-title"><span className="section-icon">💸</span> 5. Refund Timeline</h2>
                        <p>Once we receive the returned item at our warehouse, a quality check is performed (usually takes 1-2 days).</p>
                        <p>After approval, your refund will be processed immediately. The amount will be transferred to your provided <strong>Bank Account, JazzCash, or EasyPaisa</strong> wallet within 2 to 5 business days.</p>
                    </section>

                    <div className="last-updated">
                        <p>Customer Trust is Our Priority - SJ10 Management</p>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ReturnPolicy;