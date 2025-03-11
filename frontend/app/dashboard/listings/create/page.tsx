'use client'

import ListingForm from '@/components/marketplace/ListingForm'
import { motion } from 'framer-motion'

export default function CreateListingPage() {
  return (
    <div className="container py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div 
        className="mb-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <h1 className="text-3xl font-bold">Créer une nouvelle annonce</h1>
        <p className="text-muted-foreground mt-2">
          Publiez vos produits de déchets agricoles sur le marché
        </p>
      </motion.div>
      
      <ListingForm />
    </div>
  )
} 