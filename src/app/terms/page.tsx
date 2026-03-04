"use client";

import React, { useEffect, useState } from 'react';
import '../../styles/PolicyPages.css';

const TermsConditions = () => {
    const [activeSection, setActiveSection] = useState('intro');

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
        { id: 'intro', title: '1. Introduction' },
        { id: 'user', title: '2. User Accounts' },
        { id: 'reselling', title: '3. Reselling & Profits' },
        { id: 'shipping', title: '4. Shipping & Delivery' },
        { id: 'returns', title: '5. Returns & Refunds' },
        { id: 'conduct', title: '6. Prohibited Conduct' },
        { id: 'law', title: '7. Governing Law' },
    ];

    return (
        <div className="policy-container">
            <title>Terms & Conditions | SJ10 Agreement</title>

            <div className="policy-hero fade-in-down">
                <h1 className="policy-title">Terms & Conditions</h1>
                <p className="policy-subtitle">Please read these terms carefully before using SJ10 as a customer or reseller.</p>
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
                    <section id="intro" className="policy-section">
                        <h2 className="section-title"><span className="section-icon">📜</span> 1. Introduction</h2>
                        <p>Welcome to <strong>SJ10 (Saman Junction)</strong>. These Terms constitute a binding agreement between you and SJ10, founded by Mr. Aoun Abbas. By accessing our platform, you agree to these terms.</p>
                        <p>SJ10 operates as a marketplace facilitating buying and reselling of goods within Pakistan.</p>
                    </section>

                    <section id="user" className="policy-section">
                        <h2 className="section-title"><span className="section-icon">👤</span> 2. User Accounts</h2>
                        <p>To access features like ordering or reselling, you must create an account. You agree to provide accurate information (Name, Phone, Address).</p>
                        <p>You are responsible for maintaining the confidentiality of your account credentials. Any activity under your account is your responsibility.</p>
                    </section>

                    <section id="reselling" className="policy-section">
                        <h2 className="section-title"><span className="section-icon">📈</span> 3. Reselling & Profits</h2>
                        <p><strong>Profit Margin:</strong> Resellers can set their own profit margin on products. The profit is the difference between the SJ10 wholesale price and the price you quote to your customer.</p>
                        <p><strong>Payment of Profit:</strong> Profits are credited to your SJ10 wallet once the order status is marked as "Delivered". You can withdraw this amount to your JazzCash, EasyPaisa, or Bank Account.</p>
                        <p><strong>Returns on Resold Items:</strong> If a customer returns a product, the profit earned on that specific order will be deducted from your wallet.</p>
                    </section>

                    <section id="shipping" className="policy-section">
                        <h2 className="section-title"><span className="section-icon">🚚</span> 4. Shipping & Delivery</h2>
                        <p>We provide nationwide shipping across Pakistan.</p>
                        <ul>
                            <li><strong>Timeline:</strong> Standard delivery time is 3 to 7 business days.</li>
                            <li><strong>Charges:</strong> Shipping charges are calculated at checkout based on weight and destination.</li>
                            <li><strong>Couriers:</strong> We use third-party services (Trax, Leopards, Call Courier). SJ10 is not liable for delays caused by the courier company (e.g., strikes, weather).</li>
                        </ul>
                    </section>

                    <section id="returns" className="policy-section">
                        <h2 className="section-title"><span className="section-icon">↩️</span> 5. Returns & Refunds</h2>
                        <p>We offer a 7-day return policy for defective or incorrect items. Please refer to our detailed <strong>Return Policy</strong> page for the complete process.</p>
                    </section>

                    <section id="conduct" className="policy-section">
                        <h2 className="section-title"><span className="section-icon">🚫</span> 6. Prohibited Conduct</h2>
                        <p>Users must not:</p>
                        <ul>
                            <li>Place fake orders to earn profit or harm the platform.</li>
                            <li>Use abusive language with support staff or couriers.</li>
                            <li>Upload fake reviews or misleading information.</li>
                        </ul>
                        <p>Violation of these terms may result in permanent account suspension.</p>
                    </section>

                    <section id="law" className="policy-section">
                        <h2 className="section-title"><span className="section-icon">⚖️</span> 7. Governing Law</h2>
                        <p>These terms are governed by the laws of the Islamic Republic of Pakistan. Any disputes are subject to the jurisdiction of courts in Pakistan.</p>
                    </section>

                    <div className="last-updated">
                        <p>Last Updated: February 2026 | SJ10 Management</p>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default TermsConditions;