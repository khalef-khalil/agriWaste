'use client';

import { ProfileForm } from '@/components/auth/ProfileForm';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  return (
    <AuthGuard requireAuth={true}>
      <div className="container mx-auto px-4 py-12">
        <ProfileForm />
      </div>
    </AuthGuard>
  );
} 