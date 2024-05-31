import RSS from 'rss';

export default async function generateRssFeed() {
 const site_url = process.env.NEXT_PUBLIC_SITE_URL || 'localhost:3000';

 const feedOptions = {
  title: 'Blog posts | RSS Feed',
  description: 'Welcome to this blog posts!',
  site_url: site_url,
  feed_url: `${site_url}/rss.xml`,
  image_url: `${site_url}/logo.png`,
  pubDate: new Date(),
  copyright: `All rights reserved ${new Date().getFullYear()}, Ibas`,
 };

 const feed = new RSS(feedOptions);
}