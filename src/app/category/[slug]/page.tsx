import { Metadata } from "next";
import CategorySlugClient from "@/components/CategorySlugClient";

// ⚡ ISR: Cache this page for 1 hour to ensure fast loading + fresh SEO
export const revalidate = 3600;

// API Helper to fetch category details on the server
async function getCategory(slug: string) {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_PRODUCT_API_URL || 'https://sj10-cart.vercel.app/api';
        const res = await fetch(`${baseUrl}/products/category/${slug}?limit=1`);
        
        if (!res.ok) return null;
        
        const data = await res.json();
        return data.category; 
    } catch (e) {
        console.error("Category SEO Fetch Error:", e);
        return null;
    }
}

// 1. DYNAMIC METADATA GENERATION
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const category = await getCategory(slug);

    if (!category) {
        return {
            title: "Category Not Found | SJ10 Shopping",
            robots: { index: false } 
        };
    }

    const title = `${category.name} Price in Pakistan | Buy Online at SJ10`;
    const description = `Shop the latest collection of ${category.name} at SJ10 Pakistan. Discover best prices, fast delivery to Lahore, Karachi, Islamabad, and Cash on Delivery available.`;
    const url = `https://www.sj10.pk/category/${slug}`;

    return {
        title: title,
        description: description,
        alternates: { canonical: url },
        openGraph: {
            title: title,
            description: description,
            url: url,
            type: "website",
            siteName: "SJ10 Shopping",
            locale: "en_PK",
        },
        twitter: {
            card: "summary_large_image",
            title: title,
            description: description,
        }
    };
}

// 2. MAIN SERVER PAGE
export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const category = await getCategory(slug);

    // 3. BREADCRUMB SCHEMA 
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [{
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://www.sj10.pk"
        }, {
            "@type": "ListItem",
            "position": 2,
            "name": category ? category.name : "Category",
            "item": `https://www.sj10.pk/category/${slug}`
        }]
    };

    return (
        <div style={{ backgroundColor: '#f8fafc' }}>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            
            {/* Render the Interactive Client Component */}
            <CategorySlugClient slug={slug} />

            {/* 4. THE SEO TEXT BLOCK (Crucial for ranking) */}
            {category && (
                <section className="category-seo-content">
                    <div className="seo-container">
                        <h1 className="seo-h1">Buy {category.name} Online at the Best Price in Pakistan</h1>
                        <p className="seo-p">
                            Are you looking for top-quality <strong>{category.name}</strong>? At SJ10 Shopping, we bring you the latest and most trendy {category.name.toLowerCase()} at unbeatable wholesale and retail prices in Pakistan. Whether you are shopping from Karachi, Lahore, Islamabad, or any other city, we guarantee fast, reliable delivery right to your doorstep with our trusted Cash on Delivery (COD) services.
                        </p>
                        <p className="seo-p">
                            Explore our massive multi-vendor selection to find exactly what you need. From affordable daily essentials to premium branded items, our <strong>{category.name}</strong> collection is updated daily by top-rated suppliers across the country. Shop securely today and enjoy our hassle-free 7-day return policy!
                        </p>
                    </div>

                    <style data-jsx>{`
                        .category-seo-content {
                            background-color: #ffffff;
                            border-top: 1px solid #e2e8f0;
                            padding: 40px 20px;
                            margin-top: -80px; /* Pulls it up seamlessly under the products */
                            position: relative;
                            z-index: 10;
                        }
                        .seo-container {
                            max-width: 1200px;
                            margin: 0 auto;
                        }
                        .seo-h1 {
                            font-family: 'Poppins', sans-serif;
                            font-size: 20px;
                            font-weight: 700;
                            color: #1e293b;
                            margin-bottom: 15px;
                            letter-spacing: -0.5px;
                        }
                        .seo-p {
                            font-size: 13px;
                            color: #64748b;
                            line-height: 1.7;
                            margin-bottom: 12px;
                            text-align: justify;
                        }
                        .seo-p strong {
                            color: #334155;
                            font-weight: 600;
                        }
                    `}</style>
                </section>
            )}
        </div>
    );
}