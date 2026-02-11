// src/app/shipping-policy/page.tsx
import Link from 'next/link';

export default function ShippingPolicyPage() {
    return (
        <div>
            <header className="page-header">
                <Link href="/profile" className="back-button"><i className="fas fa-arrow-left"></i></Link>
                <h3 className="header-title">Shipping Policy</h3>
            </header>
            <div className="page-content-prose">
                <h3>Our Shipping Policy</h3>
                <p>Welcome to SJ10! We are committed to delivering your products reliably and efficiently.</p>
                
                <h4>Delivery Time</h4>
                <p>Standard delivery for all orders is within <strong>5 to 7 business days</strong>. Please note that delivery times may vary based on your location and public holidays.</p>

                <h4>Payment Method</h4>
                <p>We offer Cash on Delivery (COD) all over Pakistan. You can pay for your order in cash at your doorstep when the parcel is delivered.</p>

                <h4>Delivery Process</h4>
                <p>Once your order is confirmed, it is dispatched from our warehouse. You will be contacted by the courier service before delivery. Please ensure you are available to receive your parcel and make the payment.</p>
            </div>
        </div>
    );
}