'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft, FileText, Calendar, Box, Truck, FlaskConical, AlertTriangle } from 'lucide-react';
import { catalogApi, WasteType, ResourceDocument } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { DocumentCard } from '@/components/catalog/DocumentCard';
import { toPathString } from '@/lib/utils';

export default function WasteTypeDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const wasteTypeId = parseInt(params.id);
  
  const [wasteType, setWasteType] = useState<WasteType | null>(null);
  const [documents, setDocuments] = useState<ResourceDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadWasteTypeData() {
      try {
        setLoading(true);
        // Load waste type details
        const wasteTypeData = await catalogApi.getWasteTypeById(wasteTypeId);
        console.log('Waste type loaded:', wasteTypeData);
        setWasteType(wasteTypeData);
        
        // Load related documents
        const documentsData = await catalogApi.getResourceDocumentsByWasteType(wasteTypeId);
        console.log('Documents loaded:', documentsData);
        setDocuments(documentsData || []); // Ensure it's always an array
      } catch (err) {
        console.error('Failed to load waste type data:', err);
        setError('Failed to load waste type details. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    if (isNaN(wasteTypeId)) {
      return notFound();
    }
    
    loadWasteTypeData();
  }, [wasteTypeId]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <span>Chargement des détails...</span>
      </div>
    );
  }

  if (error || !wasteType) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center p-4">
        <div className="text-center py-12 bg-destructive/10 rounded-lg max-w-2xl w-full">
          <p className="text-destructive mb-4">{error || 'Type de déchet non trouvé'}</p>
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
      {/* Header Section */}
      <section className="relative bg-primary/10 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Button
              variant="ghost"
              className="mb-6"
              onClick={() => router.back()}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
            
            <div className="flex flex-col md:flex-row md:items-start gap-8">
              <div className="md:flex-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {wasteType.category && (
                    <Link 
                      href={`/catalog/category/${typeof wasteType.category === 'object' ? 
                        toPathString((wasteType.category as any).id || wasteType.category) : 
                        toPathString(wasteType.category)}`} 
                      className="inline-block px-3 py-1 bg-primary/10 rounded-full text-sm font-medium text-primary mb-4 hover:bg-primary/20 transition-colors"
                    >
                      {wasteType.category_name || 'Catégorie'}
                    </Link>
                  )}
                  
                  <h1 className="text-3xl md:text-4xl font-bold mb-4">
                    {wasteType.name || 'Type de déchet'}
                  </h1>
                  
                  <p className="text-lg mb-6 text-muted-foreground">
                    {wasteType.description || 'Aucune description disponible'}
                  </p>
                </motion.div>
              </div>
              
              <motion.div 
                className="md:w-1/3 flex-shrink-0"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                  {wasteType.image ? (
                    <img 
                      src={wasteType.image} 
                      alt={wasteType.name || 'Type de déchet'} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10">
                      <span className="text-6xl font-bold text-primary/40">
                        {wasteType.name ? wasteType.name.charAt(0) : '?'}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Details Section */}
      <section className="py-16 container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Availability & Requirements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Disponibilité et Exigences</h2>
                  
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium">Disponibilité saisonnière</h3>
                        <p className="text-muted-foreground mt-1">{wasteType.seasonal_availability || 'Non spécifié'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Box className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium">Exigences de stockage</h3>
                        <p className="text-muted-foreground mt-1">{wasteType.storage_requirements || 'Non spécifié'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Truck className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium">Exigences de transport</h3>
                        <p className="text-muted-foreground mt-1">{wasteType.transportation_requirements || 'Non spécifié'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            {/* Applications & Challenges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Applications et Défis</h2>
                  
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <FlaskConical className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium">Applications potentielles</h3>
                        <p className="text-muted-foreground mt-1">{wasteType.potential_applications || wasteType.potential_uses || 'Non spécifié'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium">Défis</h3>
                        <p className="text-muted-foreground mt-1">{wasteType.challenges || 'Non spécifié'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          
          {/* Documents Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12"
          >
            <h2 className="text-2xl font-bold mb-6">Documents Ressources</h2>
            
            {documents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documents.map((document, index) => (
                  <DocumentCard 
                    key={document.id} 
                    document={document} 
                    delay={index * 0.1}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-muted rounded-lg p-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucun document disponible</h3>
                <p className="text-muted-foreground">
                  Il n'y a pas encore de documents ressources pour ce type de déchet.
                </p>
              </div>
            )}
          </motion.div>
          
          {/* Marketplace CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-16 bg-primary/10 rounded-lg p-8 text-center"
          >
            <h2 className="text-2xl font-bold mb-3">Recherchez ce type de déchet sur le marché</h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Trouvez des producteurs de {wasteType?.name || 'ce déchet'} et achetez directement auprès d'agriculteurs locaux.
            </p>
            <Link href="/marketplace">
              <Button size="lg" className="px-8">
                Explorer le Marketplace
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
} 