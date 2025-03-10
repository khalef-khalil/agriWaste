'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Leaf, Recycle, PenTool, Factory, CircleUser, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // Only run this code on the client side
    if (typeof window === 'undefined') return;
    
    const shouldReload = searchParams.get('reload') === 'true';
    const fromAuth = searchParams.get('from') === 'auth';
    
    // Create unique key for this session's page reload
    const reloadKey = 'home_page_reloaded';
    
    // Check if we've already reloaded this session or if coming from auth pages with reload param
    const hasReloaded = sessionStorage.getItem(reloadKey);
    
    if (!hasReloaded || shouldReload || fromAuth) {
      // Set flag immediately to prevent reload loops
      sessionStorage.setItem(reloadKey, 'true');
      
      // Force a hard reload after a small delay, removing any query params
      setTimeout(() => {
        console.log('Reloading home page...');
        // Clean the URL by removing query parameters
        window.location.href = window.location.origin + window.location.pathname;
      }, 100);
    }
  }, [searchParams]);
  
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/30 py-20 md:py-32">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 lg:pr-12 mb-12 lg:mb-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
                  Transformez les Déchets Agricoles en <span className="text-primary">Ressources Valorisables</span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl">
                  Connectez-vous avec des chercheurs, des startups et des industries pour acheter et vendre des produits issus de déchets agricoles et promouvoir des solutions durables.
                </p>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  {isAuthenticated ? (
                    <Link href="/marketplace">
                      <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                        Explorer le Marketplace <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  ) : (
                    <>
                      <Link href="/register">
                        <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                          Rejoindre <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </Link>
                      <Link href="/catalog">
                        <Button size="lg" variant="outline">
                          Explorer le Catalogue
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
                <div className="flex items-center mt-8">
                  <ShieldCheck className="h-5 w-5 text-primary mr-2" />
                  <span className="text-sm text-muted-foreground">
                    Approuvé par des agriculteurs et des entreprises à travers l'Afrique du Nord
                  </span>
                </div>
              </motion.div>
            </div>
            <div className="lg:w-1/2">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="rounded-lg overflow-hidden shadow-xl"
              >
                <div className="aspect-video bg-primary/20 rounded-lg overflow-hidden relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center p-6">
                      <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white mx-auto mb-4">
                        <Leaf className="h-10 w-10" />
                      </div>
                      <p className="text-lg font-semibold text-primary">
                        Visualisation AgriWaste Marketplace
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        L'image de démonstration interactive apparaîtrait ici
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-96 h-96 rounded-full bg-accent/10 blur-3xl"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Pourquoi Choisir AgriWaste ?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Notre plateforme propose des solutions complètes pour la gestion des déchets agricoles et les initiatives d'économie circulaire.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Leaf />}
              title="Solutions Durables"
              description="Promouvoir la durabilité environnementale en réutilisant les déchets agricoles."
              delay={0.1}
            />
            <FeatureCard
              icon={<Recycle />}
              title="Économie Circulaire"
              description="Participez à un système en circuit fermé qui minimise les déchets et la pollution."
              delay={0.2}
            />
            <FeatureCard
              icon={<PenTool />}
              title="Opportunités de Recherche"
              description="Accédez à des échantillons de déchets agricoles pour la recherche et le développement."
              delay={0.3}
            />
            <FeatureCard
              icon={<Factory />}
              title="Applications Industrielles"
              description="Trouvez des matériaux organiques pour la production industrielle et la fabrication."
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Qui Peut en Bénéficier ?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              AgriWaste Marketplace sert divers acteurs des secteurs agricole et de la recherche.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <UserTypeCard
              title="Agriculteurs"
              description="Vendez vos déchets agricoles et créez des sources de revenus supplémentaires."
              delay={0.1}
            />
            <UserTypeCard
              title="Chercheurs"
              description="Accédez à divers échantillons de déchets agricoles pour les études scientifiques."
              delay={0.2}
            />
            <UserTypeCard
              title="Startups"
              description="Trouvez des matériaux pour des produits innovants et des solutions durables."
              delay={0.3}
            />
            <UserTypeCard
              title="Industrie"
              description="Trouvez des sources fiables de matériaux organiques pour applications industrielles."
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/10 rounded-lg mx-4 my-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Prêt à Rejoindre la Communauté AgriWaste ?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Créez un compte aujourd'hui et commencez à explorer les opportunités de gestion durable des déchets.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/register">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Créer un Compte
                </Button>
              </Link>
              <Link href="/catalog">
                <Button size="lg" variant="outline">
                  Explorer le Catalogue
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
}

function FeatureCard({ icon, title, description, delay = 0 }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      viewport={{ once: true }}
      className="flex flex-col items-center text-center p-6 bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="p-3 bg-primary/10 rounded-full text-primary mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  );
}

interface UserTypeCardProps {
  title: string;
  description: string;
  delay?: number;
}

function UserTypeCard({ title, description, delay = 0 }: UserTypeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      viewport={{ once: true }}
      className="flex flex-col p-6 bg-background border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center mb-4">
        <div className="p-2 bg-primary/10 rounded-full text-primary mr-3">
          <CircleUser className="h-5 w-5" />
        </div>
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>
      <p className="text-muted-foreground">{description}</p>
      <Link href="/register" className="mt-4 text-primary font-medium text-sm flex items-center">
        Commencer <ArrowRight className="ml-1 h-4 w-4" />
      </Link>
    </motion.div>
  );
}
