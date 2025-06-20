import { db } from './db';
import { properties } from '../shared/schema';

export async function generateSitemap(): Promise<string> {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://www.spurgeonproperty.co.za' 
    : 'http://localhost:5000';

  // Static pages
  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/properties', priority: '0.9', changefreq: 'daily' },
    { url: '/rentals', priority: '0.8', changefreq: 'daily' },
    { url: '/sell-property', priority: '0.7', changefreq: 'weekly' },
    { url: '/about', priority: '0.6', changefreq: 'monthly' }
  ];

  // Get all published properties
  const allProperties = await db.select({
    id: properties.id,
    updatedAt: properties.updatedAt
  }).from(properties);

  const propertyPages = allProperties.map(property => ({
    url: `/properties/${property.id}`,
    priority: '0.8',
    changefreq: 'weekly',
    lastmod: property.updatedAt?.toISOString() || new Date().toISOString()
  }));

  const allPages = [...staticPages, ...propertyPages];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    ${page.lastmod ? `<lastmod>${page.lastmod}</lastmod>` : ''}
  </url>`).join('\n')}
</urlset>`;

  return sitemap;
}