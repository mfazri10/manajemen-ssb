'use client';

import React, { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import { Eye, X } from 'lucide-react';

const MY_ONBOARDING_PROGRESS = gql`
  query MyOnboardingProgress {
    myOnboardingProgress {
      step
      completed
    }
  }
`;

interface DemoBannerProps {
  onDismiss?: () => void;
}

export default function DemoBanner({ onDismiss }: DemoBannerProps) {
  const { data, loading, error } = useQuery(MY_ONBOARDING_PROGRESS);
  const [dismissed, setDismissed] = useState(false);

  if (loading || error || dismissed || !data?.myOnboardingProgress) return null;

  const progressSteps = data.myOnboardingProgress;
  const completedSteps = progressSteps.filter((s: any) => s.completed).length;

  // Jika onboarding sudah selesai, sembunyikan banner mode demo
  if (completedSteps === progressSteps.length) return null;

  return (
    <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between shadow-md relative z-50">
      <div className="flex items-center gap-2 mx-auto">
        <Eye className="w-4 h-4 animate-pulse shrink-0" />
        <span>
          <strong>MODE DEMO AKTIF:</strong> Tampilan ini berisi data simulasi agar Anda bisa langsung mencoba fitur aplikasi. Data demo akan hilang otomatis saat Anda mulai menginput data nyata.
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer shrink-0 absolute right-3"
        aria-label="Tutup"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
