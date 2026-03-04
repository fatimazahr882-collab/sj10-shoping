"use client";

import React, { useEffect, useState } from 'react';
import '../styles/PolicyPages.css';

const AboutUs = () => {
    const [activeSection, setActiveSection] = useState('story');

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setActiveSection(id);
        }
    };

    // Scroll Spy
    useEffect(() => {
        const handleScroll = () => {
            const sections = document.querySelectorAll('.policy-section');
            let current = '';
            sections.forEach((section) => {
                const sectionTop = (section as HTMLElement).offsetTop;
                if (window.scrollY >= sectionTop - 150) {
                    current = section.getAttribute('id') || '';
                }
            });
            if (current) setActiveSection(current);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const sections = [
        { id: 'story', title: '1. Our Story & Vision' },
        { id: 'founder', title: '2. Meet the Founder' },
        { id: 'model', title: '3. Reselling Model' },
        { id: 'logistics', title: '4. Fast Logistics' },
        { id: 'payments', title: '5. Profits & Payments' },
    ];

    return (
        <div className="policy-container">
            <title>About Us | SJ10 - Pakistan's Premier Shopping & Reselling Hub</title>
            
            <div className="policy-hero fade-in-down">
                <h1 className="policy-title">About SJ10</h1>
                <p className="policy-subtitle">Empowering Pakistan through E-commerce. Shop premium products or start your own business with Zero Investment today.</p>
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
                    <section id="story" className="policy-section">
                        <h2 className="section-title"><span className="section-icon">🚀</span> 1. Our Story & Vision</h2>
                        <p>Welcome to <strong>SJ10 (Saman Junction)</strong>, Pakistan's most innovative multi-vendor marketplace. Founded with a single mission: to revolutionize how Pakistan shops and earns online. We are not just a shopping website; we are an ecosystem designed to empower every Pakistani household.</p>
                        <p>At SJ10, we bridge the gap between premium wholesalers and the end consumer. Whether you are looking for high-quality fashion, gadgets, or home accessories, or you are an aspiring entrepreneur looking to start a business, SJ10 is your platform.</p>
                    </section>

                    <section id="founder" className="policy-section">
                        <h2 className="section-title"><span className="section-icon">👤</span> 2. Meet the Founder</h2>
                        <p>SJ10 was conceptualized and founded by <strong>Mr. Aoun Abbas</strong>, a visionary entrepreneur dedicated to digital literacy and economic growth in Pakistan.</p>
                        <p>Seeing the struggles of young Pakistanis in finding legitimate earning opportunities, Mr. Abbas built SJ10 to allow anyone—students, housewives, and job seekers—to become resellers without spending a single rupee. His leadership ensures transparency, quality assurance, and a customer-first approach.</p>
                    </section>

                    <section id="model" className="policy-section">
                        <h2 className="section-title"><span className="section-icon">💼</span> 3. The Reselling Model</h2>
                        <p>Uniquely in Pakistan, SJ10 allows you to be more than just a customer. You can be a partner.</p>
                        <ul>
                            <li><strong>Zero Investment:</strong> You don't need to buy stock. We hold the inventory.</li>
                            <li><strong>Share & Earn:</strong> Simply share product images from our app/website to WhatsApp, Facebook, or Instagram.</li>
                            <li><strong>Set Your Profit:</strong> You decide the final price. If a bag costs Rs. 1000, sell it for Rs. 1500. The Rs. 500 profit is yours.</li>
                            <li><strong>White Label Shipping:</strong> We deliver to your customer. They never know it came from SJ10; they think it came from you.</li>
                        </ul>
                    </section>

                    <section id="logistics" className="policy-section">
                        <h2 className="section-title"><span className="section-icon">🚚</span> 4. Fast Logistics</h2>
                        <p>We understand that in e-commerce, speed is trust. SJ10 has partnered with Pakistan's top courier services (Leopards, Trax, MnP) to ensure rapid delivery.</p>
                        <p>We guarantee delivery all over Pakistan within <strong>3 to 7 business days</strong>. Whether your customer is in Karachi, Lahore, or a remote village in Gilgit, we reach them.</p>
                    </section>

                    <section id="payments" className="policy-section">
                        <h2 className="section-title"><span className="section-icon">💰</span> 5. Profits & Banking</h2>
                        <p>Trust is built on timely payments. For our resellers and suppliers, we offer a seamless Profit Account system.</p>
                        <p>Your earnings are visible in your dashboard immediately after order delivery. You can withdraw your profit anytime directly to:</p>
                        <ul>
                            <li><strong>EasyPaisa</strong></li>
                            <li><strong>JazzCash</strong></li>
                            <li><strong>Any Bank Account (HBL, UBL, Meezan, etc.)</strong></li>
                            <li><strong>SadaPay / NayaPay</strong></li>
                        </ul>
                    </section>

                    <div className="last-updated">
                        <p>SJ10 - Empowering Pakistan | Founded by Aoun Abbas</p>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AboutUs;