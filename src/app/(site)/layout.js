import { Navbar } from '@/components/layout/Navbar';

export default function SharedLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
