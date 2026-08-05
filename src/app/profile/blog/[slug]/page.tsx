import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { blogData } from '@/lib/blogData';

type Props = {
  params: Promise<{ slug: string }>;
};

// 🟢 Next.js ko saare valid URLs pehle se bata rahe hain
export async function generateStaticParams() {
  return blogData.map((blog) => ({
    slug: blog.slug,
  }));
}

// 🟢 DYNAMIC SEO METADATA
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const blog = blogData.find((b) => b.slug.toLowerCase() === slug?.toLowerCase());

  if (!blog) {
    return { title: 'Blog Not Found | SJ10' };
  }

  return {
    title: `${blog.title} | SJ10`,
    description: blog.shortDesc,
    openGraph: {
      title: blog.title,
      description: blog.shortDesc,
      images: [{ url: blog.image }],
    },
  };
}

// 🟢 MAIN DYNAMIC PAGE RENDERER
export default async function DynamicBlogPage({ params }: Props) {
  const { slug } = await params;
  
  // Safe matching (ignore uppercase/lowercase differences)
  const blog = blogData.find((b) => b.slug.toLowerCase() === slug?.toLowerCase());

  if (!blog) {
    notFound();
  }

  return (
    <div className="dynamic-blog-wrapper">
      {/* Top Navigation */}
      <div className="blog-nav-bar">
        <Link href="/profile/blog" className="back-link">
          <i className="fas fa-arrow-left"></i> Back to Blogs
        </Link>
        <span className="blog-date-badge">{blog.date}</span>
      </div>

      {/* Hero Header */}
      <div className="blog-hero-section">
        <h1 className="hero-title">{blog.title}</h1>
        <p className="hero-subtitle">{blog.shortDesc}</p>
      </div>

      {/* Main Content Body */}
      <article className="blog-main-card">
        {blog.image && (
          <div className="blog-cover-wrapper">
            <Image
              src={blog.image}
              alt={blog.title}
              fill
              style={{ objectFit: 'cover' }}
              unoptimized
            />
          </div>
        )}

        {/* Rendered HTML Content */}
        <div
          className="blog-rendered-content"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        {/* Call to Action Box */}
        <div className="blog-cta-box">
          <h3>Aaj Hi Shuru Karein!</h3>
          <p>SJ10 ke sath apna zero-investment business shuru karein aur mahana munafa kamayein.</p>
          <Link href="/auth?view=signup" className="cta-btn">
            Create Free Account
          </Link>
        </div>
      </article>

      <style dangerouslySetInnerHTML={{ __html: `
        .dynamic-blog-wrapper { background: #f8fafc; min-height: 100vh; padding-bottom: 80px; font-family: 'Poppins', sans-serif; }
        .blog-nav-bar { padding: 15px 20px; background: rgba(255,255,255,0.9); backdrop-filter: blur(10px); display: flex; justify-content: space-between; align-items: center; position: sticky; top: 70px; z-index: 50; border-bottom: 1px solid #eaeaea; }
        .back-link { color: #1f2937; text-decoration: none; font-weight: 600; display: flex; align-items: center; gap: 8px; }
        .blog-date-badge { background: #fff7ed; color: #ea580c; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; }
        .blog-hero-section { background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); padding: 60px 20px 80px; text-align: center; color: white; }
        .hero-title { font-size: 32px; font-weight: 800; margin-bottom: 12px; line-height: 1.3; }
        .hero-subtitle { font-size: 16px; color: #cbd5e1; max-width: 700px; margin: 0 auto; }
        .blog-main-card { max-width: 850px; margin: -40px auto 0; background: white; padding: 40px; border-radius: 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.06); position: relative; z-index: 10; color: #374151; }
        @media(max-width: 768px) { .blog-main-card { padding: 20px; margin-top: -20px; } .hero-title { font-size: 24px; } }
        .blog-cover-wrapper { position: relative; width: 100%; height: 350px; border-radius: 16px; overflow: hidden; margin-bottom: 30px; }
        .blog-rendered-content { font-size: 16px; line-height: 1.8; color: #334155; }
        .blog-rendered-content h2 { font-size: 22px; font-weight: 800; color: #0f172a; margin: 30px 0 15px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; }
        .blog-rendered-content p { margin-bottom: 16px; }
        .blog-rendered-content ul, .blog-rendered-content ol { margin-bottom: 20px; padding-left: 25px; }
        .blog-rendered-content li { margin-bottom: 8px; }
        .blog-cta-box { text-align: center; margin-top: 50px; padding: 30px; background: #fff7ed; border-radius: 20px; border: 2px dashed #fdba74; }
        .blog-cta-box h3 { color: #ea580c; font-weight: 800; margin-bottom: 10px; }
        .cta-btn { display: inline-block; background: #ea580c; color: white; padding: 12px 30px; border-radius: 50px; font-weight: 700; text-decoration: none; margin-top: 15px; }
      ` }} />
    </div>
  );
}