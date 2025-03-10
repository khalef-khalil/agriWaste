'use client';

import { useState, useEffect } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, Search, ArrowLeft } from 'lucide-react';
import { catalogApi, Category, WasteType } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { WasteTypeCard } from '@/components/catalog/WasteTypeCard';

export default function CategoryDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const categoryId = parseInt(params.id);
  
  const [category, setCategory] = useState<Category | null>(null);
  const [wasteTypes, setWasteTypes] = useState<WasteType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCategoryData() {
      try {
        setLoading(true);
        console.log(`Loading data for category ID: ${categoryId}`);
        
        // Load categories to get the current category
        const categories = await catalogApi.getCategories();
        console.log('Categories loaded:', categories);
        const currentCategory = categories.find(c => c.id === categoryId);
        console.log('Current category:', currentCategory);
        
        if (!currentCategory) {
          console.error(`Category with ID ${categoryId} not found`);
          return notFound();
        }
        
        setCategory(currentCategory);
        
        // Load waste types for this category
        console.log(`Fetching waste types for category ID: ${categoryId}`);
        const wasteTypeData = await catalogApi.getWasteTypesByCategory(categoryId);
        console.log('Waste types loaded (raw):', wasteTypeData);
        console.log('Waste types type:', Array.isArray(wasteTypeData) ? 'Array' : typeof wasteTypeData);
        console.log('Waste types count:', Array.isArray(wasteTypeData) ? wasteTypeData.length : 'N/A');
        
        setWasteTypes(wasteTypeData || []); // Ensure it's always an array
        console.log('Waste types state set');
      } catch (err) {
        console.error('Failed to load category data:', err);
        setError('Failed to load the category data. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    if (isNaN(categoryId)) {
      return notFound();
    }
    
    loadCategoryData();
  }, [categoryId]);

  // Ensure wasteTypes is always an array
  const safeWasteTypes = Array.isArray(wasteTypes) ? wasteTypes : [];
  console.log('Safe waste types array:', safeWasteTypes);
  console.log('Safe waste types length:', safeWasteTypes.length);
  
  // Print properties of the first waste type if available
  if (safeWasteTypes.length > 0) {
    const sampleWasteType = safeWasteTypes[0];
    console.log('Sample waste type properties:', Object.keys(sampleWasteType));
  }
  
  // Filter waste types based on search query with null checks
  const filteredWasteTypes = searchQuery
    ? safeWasteTypes.filter(wasteType => {
        // Ensure we have strings for all fields
        const name = (wasteType.name || '').toLowerCase();
        const description = (wasteType.description || '').toLowerCase();
        // Check for both potential_applications and potential_uses (for compatibility)
        const potentialApplications = (wasteType.potential_applications || '').toLowerCase();
        const potentialUses = (wasteType.potential_uses || '').toLowerCase();
        const searchLower = searchQuery.toLowerCase();
        
        return name.includes(searchLower) ||
               description.includes(searchLower) ||
               potentialApplications.includes(searchLower) ||
               potentialUses.includes(searchLower);
      })
    : safeWasteTypes;
    
  console.log('Filtered waste types:', filteredWasteTypes);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <span>Chargement de la catégorie...</span>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center p-4">
        <div className="text-center py-12 bg-destructive/10 rounded-lg max-w-2xl w-full">
          <p className="text-destructive mb-4">{error || 'Catégorie non trouvée'}</p>
          <Button 
            variant="outline" 
            className="mr-2"
            onClick={() => router.back()}
          >
            Retour
          </Button>
          <Button 
            variant="default"
            onClick={() => window.location.reload()}
          >
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Hero Section */}
      <section className="relative bg-primary/10 py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <Button
              variant="ghost"
              className="mb-6"
              onClick={() => router.back()}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au catalogue
            </Button>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {category.name}
            </h1>
            <p className="text-lg mb-8 text-muted-foreground">
              {category.description}
            </p>

            {/* Search Bar */}
            <div className="relative max-w-xl">
              <Input
                type="text"
                placeholder="Rechercher un type de déchet..."
                className="pl-10 h-12 rounded-full border-2 focus:border-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Waste Types Section */}
      <section className="py-16 container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold mb-2">Types de déchets</h2>
            <p className="text-muted-foreground">
              {filteredWasteTypes ? filteredWasteTypes.length : 0} types de déchets dans cette catégorie
            </p>
          </div>
        </div>

        {filteredWasteTypes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWasteTypes.map((wasteType, index) => (
              <WasteTypeCard 
                key={wasteType.id} 
                wasteType={wasteType} 
                delay={index * 0.1}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted rounded-lg">
            <p className="text-muted-foreground mb-4">
              Aucun type de déchet ne correspond à votre recherche.
            </p>
            <Button variant="outline" onClick={() => setSearchQuery('')}>
              Effacer la recherche
            </Button>
          </div>
        )}
      </section>
    </div>
  );
} 