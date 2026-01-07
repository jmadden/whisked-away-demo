import { contentfulGraphQL } from './client';
import { MARKETING_PAGE_BY_SLUG } from './queries';

export async function getMarketingPageBySlug(slug, { preview = false } = {}) {
  const data = await contentfulGraphQL({
    query: MARKETING_PAGE_BY_SLUG,
    variables: { slug: 'home' },
    operationName: 'MarketingPageBySlug',
    revalidate: 60,
  });
  return data?.marketingPageCollection?.items?.[0] ?? null;
}
