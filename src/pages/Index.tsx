import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/layout/AppLayout';
import { PrincipalDashboard } from '@/components/dashboard/PrincipalDashboard';
import { EADashboard } from '@/components/dashboard/EADashboard';
import { ManagerHome } from '@/components/dashboard/ManagerHome';

export default function Index() {
  const { isPrincipal, isEA, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <AppLayout>
      {isPrincipal ? (
        <PrincipalDashboard />
      ) : isEA ? (
        <EADashboard />
      ) : (
        <ManagerHome />
      )}
    </AppLayout>
  );
}
