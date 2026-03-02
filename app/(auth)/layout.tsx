import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - Rental Management',
  description: 'Sign in to access the rental management dashboard',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
