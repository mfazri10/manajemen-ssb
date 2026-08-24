'use client';

import { usePathname } from 'next/navigation';
import { useQuery, gql } from '@apollo/client';
import { ShieldAlert, Zap } from 'lucide-react';
import Link from 'next/link';

const MY_SUBSCRIPTION = gql`
  query MySubscription {
    mySubscription {
      id
      plan
      status
      daysRemaining
      isTrial
    }
  }
`;

export default function TrialBanner() {
  const pathname = usePathname();
  const { data, loading, error } = useQuery(MY_SUBSCRIPTION);

  // Jangan tampilkan banner masa trial di area administrator
  if (pathname?.startsWith('/admin')) return null;

  if (loading || error || !data?.mySubscription) return null;

  const sub = data.mySubscription;

  // Tampilkan banner hanya jika paket adalah 'trial'
  if (sub.plan !== 'trial') return null;

  const days = sub.daysRemaining;

  if (days <= 0 || sub.status === 'expired') {
    return (
      <div className="bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-bold px-4 py-3 flex items-center justify-between shadow-lg relative z-40">
        <div className="flex items-center gap-2 mx-auto">
          <ShieldAlert className="w-4 h-4 shrink-0 animate-bounce" />
          <span>
            Masa free trial Anda telah habis! Hubungi admin atau lakukan pembayaran untuk mengaktifkan kembali seluruh fitur.
          </span>
        </div>
        <Link
          href="/admin/langganan"
          className="ml-4 shrink-0 px-3 py-1 bg-white text-red-600 font-extrabold rounded-lg hover:bg-slate-100 transition-colors text-[10px] uppercase tracking-wider"
        >
          Upgrade Sekarang
        </Link>
      </div>
    );
  }

  // Tampilkan warning jika masa trial akan segera habis
  return (
    <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-xs font-semibold px-4 py-2.5 flex items-center justify-between shadow-md relative z-40">
      <div className="flex items-center gap-2 mx-auto">
        <Zap className="w-4 h-4 text-yellow-300 animate-pulse shrink-0" />
        <span>
          Masa Free Trial Aktif: <strong>{days} hari tersisa</strong>. Anda dapat mencoba seluruh fitur tanpa batasan apa pun.
        </span>
      </div>
      <Link
        href="/admin/langganan"
        className="ml-4 shrink-0 px-3 py-1 bg-yellow-400 text-slate-900 font-black rounded-lg hover:bg-yellow-300 transition-colors text-[10px] uppercase tracking-wider shadow-md"
      >
        Upgrade
      </Link>
    </div>
  );
}
