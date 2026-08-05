// src/lib/blog.ts

export interface BlogPost {
  slug: string;
  title: string;
  shortDesc: string;
  image: string;
  date: string;
  content: string; // Full HTML article content
}

export const blogList: BlogPost[] = [
  {
    slug: "top-10-fashion-trends",
    title: "Top 10 Fashion Trends in Pakistan (2026)",
    shortDesc: "Discover the latest eastern and western fusion fashion trends.",
    image: "https://res.cloudinary.com/dc05lyten/image/upload/v1778088829/sj10_avatars/ij3ctpdfajprevbyvawq.webp",
    date: "15 April 2026",
    content: `
      <div class="space-y-4">
        <p>Pakistan mein 2026 ka fashion season aik naya inqilab lekar aaya hai. Is saal eastern traditional wear aur modern western cuts ka fusion sab se zyada pasand kiya ja raha hai.</p>
        
        <h2 class="text-xl font-bold mt-6 text-gray-900">1. Pastels aur Soft Shades</h2>
        <p>Garmion ke liye lilac, mint green, aur soft peach rangon ka shumar top trends mein ho raha hai. Yeh rang aankhon ko thandak bakhshate hain.</p>
        
        <h2 class="text-xl font-bold mt-6 text-gray-900">2. Luxury Organza Dupattas</h2>
        <p>Simple unstitched suits ke sath heavy embroidered ya digital print organza dupattay matches ka naya trend ban chuke hain.</p>
        
        <h2 class="text-xl font-bold mt-6 text-gray-900">3. Short Kurtis with Tulip Pants</h2>
        <p>University aur office jane wali khawateen ke liye short kurtis aur tulip pants ka combination comfortable aur stylish hai.</p>
        
        <p class="mt-4">Agar aap bhi in trends ke mutabiq wholesale rates par kapray kharidna chahte hain, toh SJ10 ka dynamic catalog explore karein aur wholesale prices par shopping karein!</p>
      </div>
    `
  },
  {
    slug: "zero-investment-reselling",
    title: "Start Reselling with Zero Investment",
    shortDesc: "Learn how to use SJ10 to start your business today.",
    image: "https://res.cloudinary.com/dc05lyten/image/upload/v1778088940/sj10_avatars/dtwqllwu5kjyn6apticj.webp",
    date: "10 April 2026",
    content: `
      <div class="space-y-4">
        <p>Kya aap bina kisi investment ke apna online karobar shuru karna chahte hain? SJ10 (Saman Junction) aapko de raha hai Pakistan ka sab se behtar reselling platform.</p>
        
        <h2 class="text-xl font-bold mt-6 text-gray-900">Reselling Kaise Kaam Karti Hai?</h2>
        <ol class="list-decimal pl-6 space-y-2">
          <li><strong>Product Select Karein:</strong> SJ10 portal par hazaron wholesale products mein se koi bhi product select karein.</li>
          <li><strong>Share Karein:</strong> Product ki images aur description ko apne WhatsApp status, Facebook groups, aur Instagram par share karein.</li>
          <li><strong>Apna Profit Add Karein:</strong> Jab customer rate pooche, toh wholesale price mein apna profit margin (e.g., Rs. 500) add kar ke batayein.</li>
          <li><strong>SJ10 Order Deliver Karega:</strong> Customer ka order details SJ10 par submit karein. Hum customer tak parcel deliver karenge aur aapka profit aapke wallet mein transfer kar denge!</li>
        </ol>
        
        <p class="mt-4">Ghar bethe izzat ke sath kamai shuru karne ke liye aaj hi SJ10 Seller portal par register hon aur apne khwab sach karein!</p>
      </div>
    `
  },
  {
    slug: "mahana-50000-kaise-kamayein",
    title: "Ghar Bethe Mahana 50,000 Kaise Kamayein? (Ultimate Guide)",
    shortDesc: "Bina kisi investment ke SJ10 se apna online business shuru karein aur mahana 50,000 tak kamayein.",
    image: "https://media.sj10.pk/banners/180001.webp", // Fallback if local doesn't load
    date: "20 April 2026",
    content: `
      <div class="space-y-4">
        <p>Online earning ke boht se tareeqay hain, lekin un mein se aksar mein investment chahiye hoti hai. SJ10 ke sath aap bina kisi sarmaya kari ke mahana 50,000 tak kama sakte hain.</p>
        
        <h2 class="text-xl font-bold mt-6 text-gray-900">Kaamyabi Ke 3 Sunehre Usool</h2>
        <ul class="list-disc pl-6 space-y-2">
          <li><strong>Consistent Posting:</strong> Rozana subah aur shaam ke waqt apne WhatsApp aur Facebook par naye products ke status lagayein.</li>
          <li><strong>Customer Trust:</strong> Hamesha sahi wholesale rate aur quality ki information customer ko bhejien.</li>
          <li><strong>Order Follow-up:</strong> Customer ka order book karwane ke baad delivery track karte rahein aur customer ko behtareen service dein.</li>
        </ul>
        
        <p class="mt-4">Hazaron students aur housewives is system ke zariye har mahine 50,000 se zyada ka profit direct apne Easypaisa/JazzCash mein le rahe hain. Aaj hi shuru karein!</p>
      </div>
    `
  },
  {
    slug: "whatsapp-status-earning-guide",
    title: "WhatsApp Status Se Mahana 30,000 Kaise Kamayein? (Full Guide)",
    shortDesc: "Ab sirf status lagana kafi nahi, usey kamai ka zariya banayein. SJ10 ke sath ghar bethe profit kamaein.",
    image: "https://res.cloudinary.com/dc05lyten/image/upload/v1778061533/sj10_avatars/pxa7fmhaxo9vkrc7kdca.webp",
    date: "24 April 2026",
    content: `
      <div class="space-y-4">
        <p>Hum sab rozana ghanton WhatsApp status dekhte hain aur lagate hain. Lekin kya aap jante hain ke is status ka use kar ke aap mahana 30,000 tak ki income generate kar sakte hain?</p>
        
        <h2 class="text-xl font-bold mt-6 text-gray-900">WhatsApp Selling Ka Tarika</h2>
        <p>SJ10 portal par jayen, trending items (jaise suits, watches, kitchen items) ko select karein aur unki images download kar ke status par lagayein.</p>
        
        <h2 class="text-xl font-bold mt-6 text-gray-900">Kuch Zaroori Tips</h2>
        <ul class="list-disc pl-6 space-y-2">
          <li>Aik waqt mein boht zyada status na lagayein (Max 5-8 status kafi hain).</li>
          <li>Pehle status par product ki clear photo ho, aur agle status par uska detail rate ho.</li>
          <li>Status par mention karein: "Cash on Delivery Available in Pakistan!" Is se customer ka trust barhta hai.</li>
        </ul>
        
        <p class="mt-4">Simple, fast aur reliable business jo aap apne mobile phone se kisi bhi waqt handle kar sakte hain!</p>
      </div>
    `
  },
  {
    slug: "housewife-business-ideas",
    title: "Housewives Ke Liye Top 5 Online Business Ideas (Bina Investment)",
    shortDesc: "Ghar ki malka banien aur kamai ki raani bhi! Janiye kaise housewives SJ10 ke sath apna business shuru kar sakti hain.",
    image: "https://res.cloudinary.com/dc05lyten/image/upload/v1778089004/sj10_avatars/ek6atzfluqlbrdcegjky.webp",
    date: "26 April 2026",
    content: `
      <div class="space-y-4">
        <p>Ghar ki zimmedarian sambhalne ke sath sath apne liye paise kamana har housewife ka khwab hota hai. Hum lekar aaye hain 5 aese ideas jo bina kisi sarmaya kari ke ghar bethe shuru kiye ja sakte hain.</p>
        
        <h2 class="text-xl font-bold mt-6 text-gray-900">1. Unstitched Fabric Reselling</h2>
        <p>Khawateen ko kapray kharidne ka boht shauq hota hai. Aap ladies suits ke wholesale rates lekar unhein apne mohalle aur rishtedaron mein sell kar sakti hain.</p>
        
        <h2 class="text-xl font-bold mt-6 text-gray-900">2. Kitchen Tools & Gadgets</h2>
        <p>Smart kitchen tools aaj kal har ghar ki zaroorat hain. Inki reselling boht aasan hai kyunke inki videos dekh kar log foran kharidte hain.</p>
        
        <h2 class="text-xl font-bold mt-6 text-gray-900">3. Artificial Jewelry</h2>
        <p>Shadi aur events ke liye artificial jewelry sets boht demand mein rehte hain. Inki sharing se accha profit milta hai.</p>
        
        <p class="mt-4">SJ10 ke zero investment program ke sath aap in tamam categories ko aik hi platform se bina kisi kharche ke sell kar sakti hain.</p>
      </div>
    `
  },
  {
    slug: "complete-guide-to-sj10-saman-junction",
    title: "SJ10 (Saman Junction) Kya Hai? Har Feature Aur Page Ki Mukammal Guide",
    shortDesc: "Aoun Abbas ki janib se SJ10 ka introduction. Janiye reselling, zero investment business aur har page ki detail.",
    image: "https://media.sj10.pk/banners/180001.webp",
    date: "9 May 2026",
    content: `
      <div class="space-y-4">
        <p>SJ10 (Saman Junction) Pakistan ka naya aur tezi se barhta hua wholesale reselling network hai. Hamara maqsad Pakistan ke har shehar aur dehat mein berozgari ka khatma karna hai.</p>
        
        <h2 class="text-xl font-bold mt-6 text-gray-900">Hamare Portal Ke Mukhya Features</h2>
        <ul class="list-disc pl-6 space-y-2">
          <li><strong>Direct Factory Rates:</strong> Hum products direct manufacturers se lete hain, isliye hamare rates sab se kam hote hain.</li>
          <li><strong>Live Search Suggestions:</strong> Hamara search bar dynamically products aur sitemaps dhoond kar lata hai.</li>
          <li><strong>Automated Wallet:</strong> Aapka profit order deliver hote hi automatic Easypaisa ya bank account mein bhej diya jata hai.</li>
        </ul>
        
        <p class="mt-4">Is portal ka har page, reseller tools, aur support system aapke business ko grow karne ke liye hi banaya gaya hai.</p>
      </div>
    `
  },
  {
    slug: "ultimate-guide-to-sj10-saman-junction",
    title: "Saman Junction (SJ10) Kya Hai? Har Page aur Feature Ki Professional Guide",
    shortDesc: "Aoun Abbas ki janib se SJ10 ka mukammal taruf. Janiye kaise aap har function ko use kar ke apna business barha sakte hain.",
    image: "https://media.sj10.pk/banners/210002.webp",
    date: "10 May 2026",
    content: `
      <div class="space-y-4">
        <p>Agar aap SJ10 par professional tareeqe se kaam kar ke apna bada brand banana chahte hain, toh yeh guide aapke liye likhi gayi hai.</p>
        
        <h2 class="text-xl font-bold mt-6 text-gray-900">Professional Seller Tools</h2>
        <p>Hamare advanced search, real-time update feed, and catalog indexing tools ke sath aap apna reselling karobar next level par le ja sakte hain.</p>
        
        <h2 class="text-xl font-bold mt-6 text-gray-900">Sitemaps aur Organic Indexing</h2>
        <p>Hum ne search sitemaps ke zariye Google Search par dynamic products ko index kiya hai taake aapke customers direct Google se search kar ke aapke store tak pohnch sakein.</p>
        
        <p class="mt-4">Is professional system ka fayedah uthayein aur aaj hi se zero-investment reselling shuru karein!</p>
      </div>
    `
  }
];

// Helper Functions
export function getAllBlogs(): BlogPost[] {
  return blogList;
}

export function getBlogBySlug(slug: string): BlogPost | null {
  const blog = blogList.find(b => b.slug === slug);
  return blog || null;
}