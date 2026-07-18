'use client';

import { useQuery, gql } from '@apollo/client';

const MY_ONBOARDING_PROGRESS = gql`
  query MyOnboardingProgress {
    myOnboardingProgress {
      step
      completed
    }
  }
`;

export function useMenuAccess() {
  const { data, loading } = useQuery(MY_ONBOARDING_PROGRESS);

  if (loading || !data?.myOnboardingProgress) {
    return {
      canAccessAbsensi: true, // fallback to avoid rendering locks on load
      canAccessKeuangan: true,
      canAccessEvaluasi: true,
      loading,
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
