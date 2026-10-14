import { AdminAuthShell } from '@/features/auth/components/AdminAuthShell';
import { AdminLoginForm } from '@/features/auth/components/AdminLoginForm';

function AdminLoginPage() {
  return (
    <AdminAuthShell>
      <AdminLoginForm />
    </AdminAuthShell>
  );
}

export default AdminLoginPage;
