'use client';

import { LoginForm } from '@/components/auth/LoginForm';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { motion } from 'framer-motion';

export default function LoginPage() {
  return (
    <AuthGuard requireAuth={false}>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 text-primary">Connexion</h1>
        <p className="text-muted-foreground">
          Bienvenue sur AgriWaste Marketplace
        </p>
      </div>
      <LoginForm />
    </AuthGuard>
  );
} 