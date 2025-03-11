'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Listing, ListingImage, marketplaceApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { ImagePlus, Trash2, ArrowLeft, Upload, Check, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import ImageWithFallback from '@/components/ui/image-with-fallback'

export default function ListingImagesPage() {
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = params.id as string
  const isNewListing = searchParams.get('new') === 'true'
  const [deleting, setDeleting] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true)
        const data = await marketplaceApi.getListingById(parseInt(id))
        setListing(data)
      } catch (err) {
        console.error(err)
        setError('Échec du chargement des détails de l\'annonce')
        toast.error('Échec du chargement des détails de l\'annonce')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchListing()
    }
  }, [id])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    processFile(file)
  }

  const processFile = (file: File) => {
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La taille du fichier doit être inférieure à 5 Mo')
      return
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Seuls les fichiers image sont autorisés')
      return
    }

    // Create preview
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)

    // Set the file to the file input for later upload
    if (fileInputRef.current) {
      // Create a DataTransfer object to set the file
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)
      fileInputRef.current.files = dataTransfer.files
    }
  }

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    
    processFile(file)
  }

  const uploadImage = async () => {
    if (!fileInputRef.current?.files?.[0] || !listing) return

    try {
      setUploading(true)
      console.log('Téléchargement d\'image pour l\'annonce:', listing.id);
      console.log('Détails du fichier:', {
        name: fileInputRef.current.files[0].name,
        type: fileInputRef.current.files[0].type,
        size: fileInputRef.current.files[0].size
      });
      
      const newImage = await marketplaceApi.uploadListingImage(
        listing.id,
        fileInputRef.current.files[0]
      )
      
      console.log('Téléchargement réussi, reçu:', newImage);
      
      // Update the listing with the new image
      setListing({
        ...listing,
        images: [...listing.images, newImage]
      })
      
      // Clear the file input and preview
      if (fileInputRef.current) fileInputRef.current.value = ''
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
      }
      
      toast.success('Image téléchargée avec succès')
    } catch (error: any) {
      console.error('Image upload failed:', error);
      
      // Show more detailed error information
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
        
        // Use response data in the error message if available
        const errorMessage = error.response?.data?.detail || 
          error.response?.data?.image || 
          'Échec du téléchargement de l\'image. Veuillez réessayer.';
        toast.error(errorMessage);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        toast.error('No response from server. Please check your connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error setting up request:', error.message);
        toast.error('Failed to upload image: ' + error.message);
      }
    } finally {
      setUploading(false)
    }
  }

  const cancelUpload = () => {
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
  }

  const handleDeleteImage = async (imageId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) return;
    
    try {
      setDeleting(imageId);
      await marketplaceApi.deleteListingImage(imageId);
      
      // Update listing by removing the deleted image
      if (listing) {
        setListing({
          ...listing,
          images: listing.images.filter(img => img.id !== imageId)
        });
      }
      
      toast.success('Image supprimée avec succès');
    } catch (error: any) {
      console.error('Image deletion failed:', error);
      
      // Show appropriate error message
      if (error.response) {
        const errorMessage = error.response.data?.detail || 
          'Échec de la suppression de l\'image. Veuillez réessayer.';
        toast.error(errorMessage);
      } else {
        toast.error('Échec de la suppression de l\'image');
      }
    } finally {
      setDeleting(null);
    }
  };

  const containerVariants = {
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
      transition: { type: "spring", stiffness: 100 }
    },
    exit: {
      scale: 0.8,
      opacity: 0,
      transition: { duration: 0.2 }
    }
  }

  if (loading) {
    return (
      <div className="container py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
          <p className="text-muted-foreground">Chargement des images de l'annonce...</p>
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
          <Button onClick={() => router.push('/dashboard/listings')}>
            Retour aux annonces
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {isNewListing && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Alert className="bg-green-50 border-green-200">
            <Check className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Annonce créée avec succès !</AlertTitle>
            <AlertDescription className="text-green-700">
              Votre annonce "{listing.title}" a été créée. Vous pouvez maintenant ajouter des images pour la mettre en valeur sur le marché.
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="flex flex-col gap-2 mb-10"
      >
        <div className="flex items-center mb-2">
          <Button variant="ghost" size="icon" asChild className="mr-2">
            <Link href="/dashboard/listings">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Gérer les images</h1>
        </div>
        <p className="text-muted-foreground">
          {listing.title}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        <motion.div 
          className="col-span-1"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
        >
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Télécharger une nouvelle image</h2>
            
            {isNewListing && listing.images.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-4"
              >
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Ajoutez au moins une image</AlertTitle>
                  <AlertDescription>
                    Les annonces avec images suscitent beaucoup plus d'intérêt auprès des acheteurs potentiels.
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
            
            <div className="mb-4">
              {previewUrl ? (
                <div className="relative rounded-md overflow-hidden h-48 mb-4">
                  <ImageWithFallback 
                    src={previewUrl} 
                    alt="Aperçu" 
                    fill 
                    className="object-cover"
                  />
                </div>
              ) : (
                <div 
                  className={`border-2 border-dashed ${
                    isDragging 
                      ? 'border-primary bg-primary/10' 
                      : isNewListing && listing.images.length === 0 
                        ? 'border-primary' 
                        : 'border-muted'
                  } rounded-md p-8 text-center mb-4 cursor-pointer hover:bg-muted/50 transition-colors`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <ImagePlus className={`h-10 w-10 mx-auto mb-2 ${
                    isDragging || (isNewListing && listing.images.length === 0) 
                      ? 'text-primary' 
                      : 'text-muted-foreground'
                  }`} />
                  <p className={
                    isDragging
                      ? 'text-primary font-medium'
                      : isNewListing && listing.images.length === 0 
                        ? 'text-primary font-medium' 
                        : 'text-muted-foreground'
                  }>
                    {isDragging 
                      ? 'Déposer l\'image ici' 
                      : 'Cliquez ou glissez une image ici pour la télécharger'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    JPG, PNG ou GIF, max 5 Mo
                  </p>
                </div>
              )}
              
              <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
              />
            </div>
            
            {previewUrl ? (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={cancelUpload}
                  disabled={uploading}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button 
                  onClick={uploadImage}
                  disabled={uploading}
                  className="flex-1 relative"
                >
                  {uploading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-primary rounded-md">
                      <div className="animate-spin w-5 h-5 border-2 border-background border-t-transparent rounded-full"></div>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" /> Télécharger
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => fileInputRef.current?.click()}
              >
                <ImagePlus className="h-4 w-4 mr-2" /> Sélectionner une image
              </Button>
            )}
          </div>

          <div className="mt-6 flex justify-between">
            <Button 
              variant="outline" 
              asChild
            >
              <Link href="/dashboard/listings">
                <ArrowLeft className="h-4 w-4 mr-2" /> Retour aux annonces
              </Link>
            </Button>
            {isNewListing && (
              <Button 
                variant={listing.images.length > 0 ? "default" : "outline"}
                asChild
              >
                <Link href={`/marketplace/${listing.id}`}>
                  Voir sur le marché <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                </Link>
              </Button>
            )}
          </div>
        </motion.div>

        <motion.div 
          className="col-span-1 md:col-span-2"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-xl font-semibold mb-4">Images actuelles</h2>
          
          {listing.images.length === 0 ? (
            <motion.div 
              variants={itemVariants}
              className="bg-muted/50 rounded-lg p-6 text-center"
            >
              <p className="text-muted-foreground mb-2">
                Cette annonce n'a pas encore d'images
              </p>
              <p className="text-sm text-muted-foreground">
                Téléchargez des images pour rendre votre annonce plus attrayante pour les acheteurs
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-4">
              <AnimatePresence>
                {listing.images.map((image) => (
                  <motion.div
                    key={image.id}
                    variants={itemVariants}
                    exit="exit"
                    layout
                    className="bg-card border rounded-lg overflow-hidden"
                  >
                    <div className="relative h-48">
                      <ImageWithFallback
                        src={image.image_url}
                        alt={`Image ${image.id}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}