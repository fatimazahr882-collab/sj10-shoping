// src/app/suppliers/[supplierId]/page.tsx
import { Metadata } from "next";
import SupplierClientPage from "@/components/SupplierClientPage";

export const revalidate = 3600;

async function getSupplierData(supplierId: string) {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_PRODUCT_API_URL || 'https://products.sj10.pk/api';
        const res = await fetch(`${baseUrl}/suppliers/${supplierId}`);
        if (!res.ok) return null;
        return await res.json();
    } catch (e) {
        return null;
    }
}

export async function generateMetadata({ params }: { params: Promise<{ supplierId: string }> }): Promise<Metadata> {
    const { supplierId } = await params;
    const supplier = await getSupplierData(supplierId);

    if (!supplier) return { title: "Store Not Found | SJ10" };

    const storeName = supplier.brand_name || supplier.name || "Supplier Store";
    const title = `${storeName} - Official Store on SJ10 Pakistan`;
    const description = `Shop authentic products from ${storeName} on SJ10. Read reviews, check ratings, and buy online with Cash on Delivery in Pakistan.`;

    return {
        title,
        description,
        alternates: { canonical: `https://www.sj10.pk/suppliers/${supplierId}` }
    };
}

export default async function SupplierPage({ params }: { params: Promise<{ supplierId: string }> }) {
    const { supplierId } = await params;
    const supplier = await getSupplierData(supplierId);

    const storeName = supplier?.brand_name || supplier?.name || "Verified Supplier";
    
    // ADVANCED SCHEMA
    const jsonLd = supplier ? {
        "@context": "https://schema.org",
        "@type": "Store",
        "name": storeName,
        "image": supplier.profile_pic || "https://www.sj10.pk/logo.gif",
        "url": `https://www.sj10.pk/suppliers/${supplierId}`,
        "telephone": "N/A",
        "address": { "@type": "PostalAddress", "addressCountry": "PK" },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": supplier.average_rating || "5.0",
            "reviewCount": supplier.followers_count || 1
        }
    } : null;

    return (
        <>
            {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
            
            {/* Render the Client Page */}
            <SupplierClientPage supplierId={supplierId} />
        </>
    );
}