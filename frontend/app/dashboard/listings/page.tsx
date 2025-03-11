'use client'

import { useEffect, useState } from 'react'
import { marketplaceApi, Listing } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { PlusIcon, RefreshCcw, Edit, Trash2, ImagePlus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'sonner'
import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import ImageWithFallback from '@/components/ui/image-with-fallback'

export default function MyListingsPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchListings = async () => {
    try {
      setLoading(true)
      const myListings = await marketplaceApi.getMyListings()
      setListings(myListings)
    } catch (error) {
      toast.error('Échec du chargement de vos annonces')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchListings()
  }, [])

  const handleDeleteListing = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
      try {
        await marketplaceApi.deleteListing(id)
        setListings(listings.filter(listing => listing.id !== id))
        toast.success('Annonce supprimée avec succès')
      } catch (error) {
        toast.error('Échec de la suppression de l\'annonce')
        console.error(error)
      }
    }
  }

  const listVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1 
      } 
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring",
        stiffness: 100
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-500';
      case 'SOLD':
        return 'bg-blue-500';
      case 'PAUSED':
        return 'bg-amber-500';
      case 'EXPIRED':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Actif';
      case 'SOLD':
        return 'Vendu';
      case 'PAUSED':
        return 'En pause';
      case 'EXPIRED':
        return 'Expiré';
      default:
        return status;
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  return (
    <div className="container py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Mes Annonces</h1>
          <p className="text-muted-foreground mt-2">
            Gérez vos annonces sur le marché
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={fetchListings}
            disabled={loading}
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
          <Button asChild>
            <Link href="/dashboard/listings/create">
              <PlusIcon className="h-4 w-4 mr-2" /> Créer une annonce
            </Link>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : listings.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-muted/50 rounded-lg p-8 md:p-12 text-center max-w-2xl mx-auto"
        >
          <h3 className="text-xl font-medium mb-4">Vous n'avez pas encore d'annonces</h3>
          <p className="text-muted-foreground mb-6">
            Créez votre première annonce pour commencer à vendre des produits de déchets agricoles
          </p>
          <Button asChild>
            <Link href="/dashboard/listings/create">
              <PlusIcon className="h-4 w-4 mr-2" /> Créer votre première annonce
            </Link>
          </Button>
        </motion.div>
      ) : (
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6"
          variants={listVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence>
            {listings.map((listing) => (
              <motion.div
                key={listing.id}
                variants={itemVariants}
                layout
                className="bg-card rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative h-48 bg-muted">
                  {listing.images && listing.images.length > 0 ? (
                    <ImageWithFallback
                      src={listing.images[0].image_url}
                      alt={listing.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-muted">
                      <p className="text-muted-foreground">Pas d'image</p>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="w-8 h-8 bg-background/80 backdrop-blur-sm"
                      asChild
                    >
                      <Link href={`/dashboard/listings/${listing.id}/images`}>
                        <ImagePlus className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                  {listing.featured && (
                    <div className="absolute top-2 left-2">
                      <Badge variant="default" className="bg-amber-500 hover:bg-amber-600">
                        Mis en avant
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <span 
                        className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(listing.status)}`} 
                      />
                      <span className="text-xs text-muted-foreground">
                        {getStatusText(listing.status)}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(listing.created_at)}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg line-clamp-1">{listing.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{listing.description}</p>
                  <div className="flex flex-col gap-1 mb-4">
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-medium">
                        {listing.price} {listing.currency}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {listing.quantity} {listing.unit}
                      </p>
                    </div>
                    <div className="flex items-center text-xs">
                      <span className="text-muted-foreground">
                        Disponible: {formatDate(listing.available_from)}
                        {listing.available_until ? ` - ${formatDate(listing.available_until)}` : ''}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/marketplace/${listing.id}`}>
                        Voir
                      </Link>
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" asChild>
                        <Link href={`/dashboard/listings/${listing.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="icon" 
                        onClick={() => handleDeleteListing(listing.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
} 