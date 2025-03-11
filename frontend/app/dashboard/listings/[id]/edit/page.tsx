'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ListingForm from '@/components/marketplace/ListingForm'
import { Listing, marketplaceApi } from '@/lib/api'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import axios from 'axios'

export default function EditListingPage() {
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true)
        console.log('Fetching listing with ID:', id)
        const data = await marketplaceApi.getListingById(parseInt(id))
        console.log('Fetched listing data:', data)
        
        if (!data.waste_type && data.waste_type !== 0) {
          console.error('Listing missing waste_type:', data)
          setError('Cette annonce ne contient pas de type de déchet. Veuillez contacter l\'administrateur.')
          toast.error('Impossible de modifier une annonce sans type de déchet')
        } else {
          console.log('Waste type detected:', data.waste_type, data.waste_type_name)
          setListing(data)
        }
      } catch (err) {
        console.error('Error fetching listing for edit:', err)
        if (axios.isAxiosError(err) && err.response) {
          console.error('API response error:', err.response.status, err.response.data)
          setError(`Échec du chargement: ${err.response.status} ${JSON.stringify(err.response.data)}`)
        } else {
          setError('Échec du chargement des détails de l\'annonce')
        }
        toast.error('Échec du chargement des détails de l\'annonce')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchListing()
    }
  }, [id])

  if (loading) {
    return (
      <div className="container py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
          <p className="text-muted-foreground">Chargement des détails de l'annonce...</p>
        </div>
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="container py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-destructive/10 border border-destructive rounded-lg p-6 text-center">
          <h3 className="text-xl font-medium mb-2">Erreur de chargement de l'annonce</h3>
          <p className="text-muted-foreground mb-4">{error || 'Annonce non trouvée'}</p>
          <button 
            onClick={() => router.push('/dashboard/listings')}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm"
          >
            Retour aux annonces
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div 
        className="mb-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <h1 className="text-3xl font-bold">Modifier l'annonce</h1>
        <p className="text-muted-foreground mt-2">
          Mettez à jour votre annonce de produit de déchets agricoles
        </p>
      </motion.div>
      
      {listing ? (
        <ListingForm initialData={listing} isEdit={true} />
      ) : null}
    </div>
  )
} 