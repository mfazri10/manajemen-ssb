import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_API_URL 
    ? `${process.env.NEXT_PUBLIC_API_URL}/graphql`
    : 'http://localhost:3000/graphql',
  // Menjaga agar session Better Auth (cookies) terkirim saat fetching GraphQL
  credentials: 'include',
  headers: {
    get 'x-tenant-slug'() {
      if (typeof window !== 'undefined') {
        return localStorage.getItem('activeAkademiSlug') || '';
      }
      return '';
    }
  }
});

export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});
