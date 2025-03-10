'use client';

import { ProfileForm } from '@/components/auth/ProfileForm';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  return (
    <AuthGuard requireAuth={true}>
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl font-bold mb-2 text-primary">Votre Profil</h1>
          <p className="text-muted-foreground">
            Gérez vos informations personnelles et préférences
          </p>
        </motion.div>
        <ProfileForm />
      </div>
    </AuthGuard>
  );
} 