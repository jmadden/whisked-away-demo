export const MARKETING_PAGE_BY_SLUG = /* GraphQL */ `
  query MarketingPageBySlug($slug: String!) {
    marketingPageCollection(where: { slug: $slug }, limit: 1) {
      items {
        title
        slug
        heroHeadline
        heroSubhead
        body
        featuredQuery
      }
    }
  }
`;
