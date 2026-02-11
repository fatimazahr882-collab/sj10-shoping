"use client";

import Image from 'next/image';
import Link from 'next/link';

export default function OrderConfirmationPage() {
    return (
        <div id="thank-you-page" className="page active">
            <div className="thank-you-container">
                <div className="checkmark-circle">
                    <div className="background"></div>
                    <div className="checkmark">
                        <i className="fas fa-check"></i>
                    </div>
                </div>
                <h2>Thank You For Your Order!</h2>
                <div className="logo-container">
                    <Image src="/logo.gif" alt="SJ10 Logo" width={100} height={100} unoptimized />
                </div>
                <p>Your order has been placed successfully.</p>
                <Link href="/" className="continue-shopping-btn">
                    Continue Shopping
                </Link>
            </div>
        </div>
    );
}