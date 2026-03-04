"use client";

import React, { useEffect, useState } from 'react';
import '../styles/PolicyPages.css';

const PrivacyPolicy = () => {
    const [activeSection, setActiveSection] = useState('collection');

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
        { id: 'collection', title: '1. Information Collection' },
        { id: 'usage', title: '2. How We Use Data' },
        { id: 'financial', title: '3. Financial Security' },
        { id: 'sharing', title: '4. Third-Party Sharing' },
        { id: 'cookies', title: '5. Cookies & Tracking' },
    ];

    return (
        <div className="policy-container">
            <title>Privacy Policy | SJ10 - Your Data is Safe</title>
            
            <div className="policy-hero fade-in-down">
                <h1 className="policy-title">Privacy Policy</h1>
                <p className="policy-subtitle">Your trust is everything to us. Learn how SJ10 protects and manages your personal data.</p>
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
                    <section id="collection" className="policy-section">
                        <h2 className="section-title"><span className="section-icon">📂</span> 1. Information Collection</h2>
                        <p>When you use SJ10 (website or app), we collect information necessary to provide our services. This includes:</p>
                        <ul>
                            <li><strong>Personal Details:</strong> Name, Phone Number (for OTP verification), and Delivery Address.</li>
                            <li><strong>Account Data:</strong> Email address and encrypted passwords.</li>
                            <li><strong>Reseller Data:</strong> If you are a reseller, we store your brand name and customer details solely for shipping purposes.</li>
                        </ul>
                    </section>

                    <section id="usage" className="policy-section">
                        <h2 className="section-title"><span className="section-icon">⚙️</span> 2. How We Use Data</h2>
                        <p>Your data is used strictly for:</p>
                        <ul>
                            <li>Processing orders and ensuring delivery within the 3-7 day timeline.</li>
                            <li>Calculating your profits and managing your digital wallet.</li>
                            <li>Communicating updates regarding order status (Processing, Shipped, Delivered).</li>
                            <li>Fraud detection and preventing fake orders.</li>
                        </ul>
                    </section>

                    <section id="financial" className="policy-section">
                        <h2 className="section-title"><span className="section-icon">🔒</span> 3. Financial Security</h2>
                        <p>SJ10 takes financial security seriously. When you add your <strong>JazzCash, EasyPaisa, or Bank Account</strong> details for profit withdrawal:</p>
                        <ul>
                            <li>Your details are encrypted and stored securely.</li>
                            <li>We never share your banking details with suppliers or customers.</li>
                            <li>Withdrawal requests are processed through secure banking channels.</li>
                        </ul>
                    </section>

                    <section id="sharing" className="policy-section">
                        <h2 className="section-title"><span className="section-icon">🤝</span> 4. Third-Party Sharing</h2>
                        <p>We do not sell your data. However, we share limited information with trusted partners to fulfill services:</p>
                        <p><strong>Logistics Partners:</strong> We share your Name, Address, and Phone Number with courier services (Leopards, Trax, etc.) to deliver your parcel.</p>
                    </section>

                    <section id="cookies" className="policy-section">
                        <h2 className="section-title"><span className="section-icon">🍪</span> 5. Cookies & Tracking</h2>
                        <p>We use cookies to improve your experience, remember your login session, and keep your shopping cart active. You can choose to disable cookies in your browser, but some features of the site may not function correctly.</p>
                    </section>

                    <div className="last-updated">
                        <p>Last Updated: February 2026 | Approved by Aoun Abbas</p>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default PrivacyPolicy;