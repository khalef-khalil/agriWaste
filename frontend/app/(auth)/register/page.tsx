'use client';

import { RegisterForm } from '@/components/auth/RegisterForm';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  return (
    <AuthGuard requireAuth={false}>
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2 text-primary">Créer un Compte</h1>
        <p className="text-muted-foreground">
          Rejoignez la communauté AgriWaste Marketplace
        </p>
      </div>
      <RegisterForm />
    </AuthGuard>
  );
} 