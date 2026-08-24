'use client';

import { useQuery, gql } from '@apollo/client';
import { usePathname } from 'next/navigation';

const MY_ONBOARDING_PROGRESS = gql`
  query MyOnboardingProgress {
    myOnboardingProgress {
      step
      completed
    }
  }
`;

export function useMenuAccess() {
  const pathname = usePathname();
  const { data, loading } = useQuery(MY_ONBOARDING_PROGRESS);

  // Administrator selalu mendapatkan akses penuh ke seluruh menu tanpa terkunci oleh onboarding/survey
  if (pathname?.startsWith('/admin') || loading || !data?.myOnboardingProgress) {
    return {
      canAccessAbsensi: true,
      canAccessKeuangan: true,
      canAccessEvaluasi: true,
      loading: false,
    };
  }

  const steps = data.myOnboardingProgress;

  const hasSiswa = steps.find((s: any) => s.step === 'siswa')?.completed ?? false;
  const hasJadwal = steps.find((s: any) => s.step === 'jadwal')?.completed ?? false;
  const hasSpp = steps.find((s: any) => s.step === 'spp')?.completed ?? false;

  return {
    canAccessAbsensi: hasSiswa,
    canAccessKeuangan: hasJadwal,
    canAccessEvaluasi: hasSpp,
    loading: false,
  };
}
export default useMenuAccess;
