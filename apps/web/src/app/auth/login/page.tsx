import type { Metadata } from 'next';
import LoginForm from '@/features/authentication/components/LoginForm';

export const metadata: Metadata = {
  title: 'Login - SaaS Sport Management',
  description: 'Masuk ke portal administrasi manajemen sekolah sepak bola (SSB).',
};

export default function LoginPage() {
  return <LoginForm />;
}
