// src/lib/contentful/client.js

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const ENVIRONMENT = process.env.CONTENTFUL_ENVIRONMENT || 'master';

if (!SPACE_ID) {
  throw new Error('Missing CONTENTFUL_SPACE_ID');
}

const ENDPOINT = `https://graphql.contentful.com/content/v1/spaces/${SPACE_ID}/environments/${ENVIRONMENT}`;

function getToken(preview) {
  const token = preview
    ? process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN
    : process.env.CONTENTFUL_ACCESS_TOKEN;

  if (!token) {
    throw new Error(
      preview
        ? 'Missing CONTENTFUL_PREVIEW_ACCESS_TOKEN'
        : 'Missing CONTENTFUL_ACCESS_TOKEN'
    );
  }

  return token;
}

export async function contentfulGraphQL({
  query,
  variables = {},
  preview = false,
  revalidate = 60, // seconds; set to 0 or "no-store" behavior below
  operationName, // optional, for error messages
} = {}) {
  if (!query) throw new Error('contentfulGraphQL: missing query');

  const token = getToken(preview);

  const fetchOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables, operationName }),
  };

  // Next.js fetch caching controls:
  // - revalidate: number => ISR-style caching
  // - revalidate: 0 => treat as no-store
  if (typeof revalidate === 'number') {
    if (revalidate <= 0) fetchOptions.cache = 'no-store';
    else fetchOptions.next = { revalidate };
  } else {
    fetchOptions.next = { revalidate: 60 };
  }

  const res = await fetch(ENDPOINT, fetchOptions);

  let json;
  try {
    json = await res.json();
  } catch (e) {
    throw new Error(
      `Contentful response was not valid JSON (${res.status} ${res.statusText})`
    );
  }

  if (!res.ok) {
    throw new Error(
      `Contentful request failed (${res.status} ${
        res.statusText
      }): ${JSON.stringify(json)}`
    );
  }

  if (json.errors?.length) {
    const op = operationName ? ` (${operationName})` : '';
    throw new Error(
      `Contentful GraphQL errors${op}: ${JSON.stringify(json.errors)}`
    );
  }

  return json.data;
}
