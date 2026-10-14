import { AuthCard } from '@/features/auth/components/AuthCard';
import { AuthSplitScreen } from '@/features/auth/components/AuthSplitScreen';
import { RegisterForm } from '@/features/auth/components/RegisterForm';

function RegisterPage() {
  return (
    <AuthSplitScreen>
      <AuthCard
        title="Crea tu cuenta"
        subtitle="Regístrate en RentX y comienza a rentar tu próximo carro."
      >
        <RegisterForm />
      </AuthCard>
    </AuthSplitScreen>
  );
}

export default RegisterPage;