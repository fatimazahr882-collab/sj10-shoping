// scripts/warm-sitemaps.js
const https = require('https');

// The URLs you want to "warm up" (build instantly)
const urlsToWarm = [
  'https://www.sj10.pk/sitemap.xml',
  'https://www.sj10.pk/sitemap-static.xml',
  'https://www.sj10.pk/product-sitemaps/0.xml', // Newest products
  'https://www.sj10.pk/product-sitemaps/1.xml'
];

console.log('🔥 Warming up sitemaps...');

urlsToWarm.forEach(url => {
  https.get(url, (res) => {
    console.log(`✅ Visited: ${url} - Status: ${res.statusCode}`);
  }).on('error', (e) => {
    console.error(`❌ Error: ${url}`, e);
  });
});