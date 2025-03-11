'use client';

import { useAuth } from '@/lib/auth';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShoppingBag, ListChecks, User, Settings } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <AuthGuard requireAuth={true}>
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2 text-primary">Tableau de Bord</h1>
          <p className="text-muted-foreground">
            Bienvenue, {user?.first_name || 'Utilisateur'}
          </p>
        </motion.div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <DashboardCard 
            title="Mon Profil" 
            description="Gérez vos informations personnelles" 
            icon={<User className="w-5 h-5" />} 
            href="/profile" 
            delay={0.1}
          />
          <DashboardCard 
            title="Mes Annonces" 
            description="Gérez vos annonces sur le marketplace" 
            icon={<ShoppingBag className="w-5 h-5" />} 
            href="/dashboard/listings" 
            delay={0.2}
          />
          <DashboardCard 
            title="Mes Commandes" 
            description="Consultez et gérez vos commandes" 
            icon={<ListChecks className="w-5 h-5" />} 
            href="/dashboard/orders/my-orders" 
            delay={0.3}
          />
          <DashboardCard 
            title="Paramètres" 
            description="Configurez les paramètres de votre compte" 
            icon={<Settings className="w-5 h-5" />} 
            href="/dashboard/settings" 
            delay={0.4}
          />
        </div>

        {/* Coming Soon Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="border border-border rounded-lg p-6 bg-muted/30"
        >
          <h2 className="text-xl font-semibold mb-4">Bientôt Disponible</h2>
          <p className="text-muted-foreground mb-4">
            Nous travaillons sur des fonctionnalités supplémentaires pour votre tableau de bord :
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
            <li>Analyses et statistiques pour vos annonces</li>
            <li>Centre de messagerie pour la communication acheteur-vendeur</li>
            <li>Recommandations personnalisées</li>
            <li>Système de gestion des avis</li>
          </ul>
        </motion.div>
      </div>
    </AuthGuard>
  );
}

interface DashboardCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  delay?: number;
}

function DashboardCard({ title, description, icon, href, delay = 0 }: DashboardCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Link href={href}>
        <Card className="h-full transition-all duration-200 hover:border-primary hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">{title}</CardTitle>
            <div className="p-2 bg-primary/10 rounded-full text-primary">
              {icon}
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-sm mb-4">{description}</CardDescription>
            <div className="flex items-center text-primary text-sm font-medium">
              <span>Gérer</span>
              <ArrowRight className="ml-1 w-4 h-4" />
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
} 