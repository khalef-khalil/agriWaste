'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader2 } from 'lucide-react';
import { catalogApi, Category } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CategoryCard } from '@/components/catalog/CategoryCard';

export default function CatalogPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCategories() {
      try {
        setLoading(true);
        const data = await catalogApi.getCategories();
        console.log('Categories loaded:', data);
        setCategories(data);
      } catch (err) {
        console.error('Failed to load categories:', err);
        setError('Failed to load the waste catalog. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    loadCategories();
  }, []);

  // Filter categories based on search query
  const filteredCategories = searchQuery
    ? categories.filter(category => 
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : categories;

  console.log('Filtered categories:', filteredCategories);
  
  // Determine if there are no categories or if filtering resulted in no matches
  const hasNoCategories = categories.length === 0;
  const hasNoFilterMatches = categories.length > 0 && filteredCategories.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Hero Section */}
      <section className="relative bg-primary/10 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Catalogue des Déchets Agricoles
            </h1>
            <p className="text-lg mb-8 text-muted-foreground">
              Explorez notre base de données complète des déchets agricoles et découvrez leurs applications potentielles.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <Input
                type="text"
                placeholder="Rechercher par nom ou description..."
                className="pl-10 h-12 rounded-full border-2 focus:border-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-2">Catégories</h2>
        <p className="text-muted-foreground mb-8">
          Parcourez les différentes catégories de déchets agricoles
        </p>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Chargement des catégories...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-destructive/10 rounded-lg">
            <p className="text-destructive">{error}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Réessayer
            </Button>
          </div>
        ) : hasNoCategories ? (
          <div className="text-center py-12 bg-muted rounded-lg">
            <p className="text-muted-foreground mb-4">
              Aucune catégorie n'a été trouvée dans la base de données.
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Réessayer
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hasNoFilterMatches ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground mb-4">
                  Aucune catégorie ne correspond à votre recherche "{searchQuery}".
                </p>
                <Button variant="outline" onClick={() => setSearchQuery('')}>
                  Effacer la recherche
                </Button>
              </div>
            ) : (
              filteredCategories.map((category, index) => (
                <CategoryCard 
                  key={category.id} 
                  category={category} 
                  delay={index * 0.1}
                />
              ))
            )}
          </div>
        )}
      </section>

      {/* Guide Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="bg-card rounded-lg p-8 shadow">
            <h2 className="text-2xl font-bold mb-4">Comment utiliser le catalogue</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="bg-background p-6 rounded-lg">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <span className="text-xl font-bold text-primary">1</span>
                </div>
                <h3 className="font-bold mb-2">Parcourir les catégories</h3>
                <p className="text-muted-foreground">
                  Explorez les différentes catégories de déchets agricoles pour trouver ce qui vous intéresse.
                </p>
              </div>
              <div className="bg-background p-6 rounded-lg">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <span className="text-xl font-bold text-primary">2</span>
                </div>
                <h3 className="font-bold mb-2">Découvrir les types de déchets</h3>
                <p className="text-muted-foreground">
                  Pour chaque catégorie, consultez la liste des types de déchets spécifiques et leurs caractéristiques.
                </p>
              </div>
              <div className="bg-background p-6 rounded-lg">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <span className="text-xl font-bold text-primary">3</span>
                </div>
                <h3 className="font-bold mb-2">Accéder aux ressources</h3>
                <p className="text-muted-foreground">
                  Téléchargez les documents ressources pour approfondir vos connaissances sur chaque type de déchet.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 