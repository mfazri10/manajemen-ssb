import type { Metadata } from 'next';
import RegisterForm from '@/features/authentication/components/RegisterForm';

export const metadata: Metadata = {
  title: 'Daftar Akun - SaaS Sport Management',
  description: 'Daftar akun admin baru untuk aplikasi manajemen sekolah sepak bola (SSB).',
};

export default function RegisterPage() {
  return <RegisterForm />;
}
