import { AuthCard } from '@/features/auth/components/AuthCard';
import { AuthSplitScreen } from '@/features/auth/components/AuthSplitScreen';
import { ClientLoginForm } from '@/features/auth/components/ClientLoginForm';

function LoginPage() {
  return (
    <AuthSplitScreen>
      <AuthCard
        title="Iniciar sesión"
        subtitle="Estás a un paso de manejar tu próximo carro."
      >
        <ClientLoginForm />
      </AuthCard>
    </AuthSplitScreen>
  );
}

export default LoginPage;