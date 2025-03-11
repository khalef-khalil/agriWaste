'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { catalogApi, marketplaceApi, Listing, WasteType, ListingImage } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, ImagePlus, X, Upload, FileImage } from 'lucide-react'
import Image from 'next/image'
import ImageWithFallback from '@/components/ui/image-with-fallback'
import { checkAuthToken, getAuthToken } from '@/lib/auth'

const formSchema = z.object({
  title: z.string().min(3, { message: "Le titre doit comporter au moins 3 caractères" }),
  description: z.string().min(10, { message: "La description doit comporter au moins 10 caractères" }),
  quantity: z.coerce.number().positive({ message: "La quantité doit être un nombre positif" }),
  unit: z.string().min(1, { message: "L'unité est requise" }),
  price: z.coerce.number().positive({ message: "Le prix doit être un nombre positif" }),
  currency: z.string().min(1, { message: "La devise est requise" }),
  location: z.string().min(3, { message: "Le lieu doit comporter au moins 3 caractères" }),
  country: z.string().min(2, { message: "Le pays est requis" }),
  waste_type: z.coerce.number().positive({ message: "Le type de déchet est requis" }),
  available_from: z.string().min(1, { message: "La date de disponibilité est requise" }),
  available_until: z.string().optional(),
  status: z.string().min(1, { message: "Le statut est requis" }),
});

type FormData = z.infer<typeof formSchema>;

interface ListingFormProps {
  initialData?: Listing;
  isEdit?: boolean;
}

export default function ListingForm({ initialData, isEdit = false }: ListingFormProps) {
  const [wasteTypes, setWasteTypes] = useState<WasteType[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [images, setImages] = useState<{ id?: number; file?: File; preview: string }[]>(
    initialData?.images?.map(img => ({ id: img.id, preview: img.image_url })) || []
  )
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const [isDragging, setIsDragging] = useState(false);
  const [selectedWasteType, setSelectedWasteType] = useState<number | null>(null);

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      ...initialData,
      waste_type: initialData.waste_type,
      available_from: initialData.available_from ? new Date(initialData.available_from).toISOString().split('T')[0] : undefined,
      available_until: initialData.available_until ? new Date(initialData.available_until).toISOString().split('T')[0] : undefined,
    } : {
      status: 'ACTIVE',
      currency: 'TND',
      country: 'TN',
      unit: 'KG',
      available_from: new Date().toISOString().split('T')[0],
    }
  });

  // Fetch waste types for the dropdown
  useEffect(() => {
    const fetchWasteTypes = async () => {
      try {
        setLoading(true)
        const types = await catalogApi.getWasteTypes()
        setWasteTypes(types)
      } catch (error) {
        toast.error('Failed to fetch waste types')
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchWasteTypes()
  }, [])

  useEffect(() => {
    if (initialData) {
      console.log('Initial data for form:', initialData);
      
      // First set waste_type directly to ensure it's properly initialized
      if (initialData.waste_type) {
        // Handle waste_type which can be either an ID or a full object
        if (typeof initialData.waste_type === 'object' && initialData.waste_type !== null && 'id' in initialData.waste_type) {
          const wasteTypeObj = initialData.waste_type as unknown as WasteType;
          console.log('Setting initial waste_type from object:', wasteTypeObj.id);
          setValue('waste_type', wasteTypeObj.id);
          setSelectedWasteType(wasteTypeObj.id);
        } else {
          console.log('Setting initial waste_type from ID:', initialData.waste_type);
          setValue('waste_type', initialData.waste_type as number);
          setSelectedWasteType(initialData.waste_type as number);
        }
      }
      
      Object.entries(initialData).forEach(([key, value]) => {
        if (key === 'available_from' || key === 'available_until') {
          // Format dates for input fields
          if (value) {
            try {
              // Ensure proper date formatting
              const formattedDate = new Date(value as string).toISOString().split('T')[0];
              console.log(`Setting ${key} date to:`, formattedDate);
              setValue(key as any, formattedDate);
            } catch (e) {
              console.error(`Error formatting date for ${key}:`, e);
              // Fallback to original value
              setValue(key as any, value);
            }
          }
        } else if (key !== 'waste_type' && key !== 'waste_type_name' && key !== 'images' && 
                  key !== 'seller' && key !== 'created_at' && key !== 'updated_at' && 
                  key !== 'featured') {
          // Skip fields we don't need in the form and skip waste_type since we set it above
          console.log(`Setting ${key} to:`, value);
          // @ts-ignore - dynamic key setting
          setValue(key as any, value);
        }
      });
    }
  }, [initialData, setValue]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Process each file
    Array.from(files).forEach(file => {
      processFile(file)
    })
    
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Extract the file processing logic to a separate function to reuse for drag and drop
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

    // Create preview and add to images array
    const preview = URL.createObjectURL(file)
    setImages(prev => [...prev, { file, preview }])
  }

  // Drag and drop event handlers
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
    
    const files = e.dataTransfer.files
    if (!files || files.length === 0) return
    
    // Process each dropped file
    Array.from(files).forEach(file => {
      processFile(file)
    })
  }

  const removeImage = (index: number) => {
    // If image has an ID, it's from the server, and we should handle it differently
    const image = images[index]
    if (image.id) {
      // In edit mode, we might want to confirm deletion from server
      if (confirm('Voulez-vous supprimer cette image ? Cette action est irréversible.')) {
        setImages(images.filter((_, i) => i !== index))
        // Note: actual deletion from server happens when form is submitted
      }
    } else {
      // For local files, just remove from the array and revoke object URL
      URL.revokeObjectURL(image.preview)
      setImages(images.filter((_, i) => i !== index))
    }
  }

  const uploadNewImages = async (listingId: number): Promise<ListingImage[]> => {
    const newImages: ListingImage[] = []
    const filesToUpload = images.filter(img => img.file)

    if (filesToUpload.length === 0) return []

    for (const img of filesToUpload) {
      if (img.file) {
        try {
          const uploadedImage = await marketplaceApi.uploadListingImage(listingId, img.file)
          newImages.push(uploadedImage)
        } catch (error) {
          console.error('Failed to upload image:', error)
          toast.error(`Échec du téléchargement de l'image: ${img.file.name}`)
        }
      }
    }

    return newImages
  }

  const onSubmit = async (data: FormData) => {
    try {
      // Check authentication first with our improved function
      const isAuthenticated = checkAuthToken();
      if (!isAuthenticated) {
        toast.error("Vous devez être connecté pour modifier une annonce. Veuillez vous reconnecter.");
        router.push('/auth/login');
        return;
      }
      
      // Ensure waste_type is set for edit mode
      if (isEdit && (!data.waste_type || data.waste_type === 0)) {
        // Try to use the selectedWasteType if available
        if (selectedWasteType) {
          data.waste_type = selectedWasteType;
        } else if (initialData?.waste_type) {
          // Handle waste_type which can be either an ID or a full object
          if (typeof initialData.waste_type === 'object' && initialData.waste_type !== null && 'id' in initialData.waste_type) {
            const wasteTypeObj = initialData.waste_type as unknown as WasteType;
            data.waste_type = wasteTypeObj.id;
          } else {
            data.waste_type = initialData.waste_type as number;
          }
        } else {
          toast.error("Le type de déchet est requis. Veuillez en sélectionner un.");
          return;
        }
      }
      
      setSubmitting(true);
      
      // Create a copy of the data for submission, with an any type to allow adding seller
      const submissionData: any = { ...data };
      
      // Create a debug copy of the data to see exactly what we're sending
      console.log('Form data being submitted:', submissionData);
      
      if (isEdit && initialData) {
        try {
          // Add more detailed logging for edit mode
          console.log('Editing listing with ID:', initialData.id);
          console.log('Current listing data:', initialData);
          
          // Explicitly include the original seller ID for edit
          if (initialData.seller && typeof initialData.seller === 'object' && 'id' in initialData.seller) {
            // No need for @ts-ignore with 'any' type for submissionData
            submissionData.seller = initialData.seller.id;
            console.log('Including original seller ID:', submissionData.seller);
          }
          
          console.log('Update data being sent:', submissionData);
          
          // Update listing with modified data including seller ID
          const updatedListing = await marketplaceApi.updateListing(initialData.id, submissionData);
          console.log('Update successful, received:', updatedListing);
          
          // Handle image uploads for existing listing
          if (images.some(img => img.file)) {
            setUploadingImage(true);
            await uploadNewImages(initialData.id);
            setUploadingImage(false);
          }
          
          toast.success('Annonce mise à jour avec succès');
          router.push('/dashboard/listings');
        } catch (updateError: any) {
          // More detailed error handling for updates
          console.error('Update listing error:', updateError);
          
          if (updateError.response) {
            console.error('Response status:', updateError.response.status);
            console.error('Response data:', updateError.response.data);
            
            // Log the exact structure of the error data
            console.error('Error data stringified:', JSON.stringify(updateError.response.data, null, 2));
            
            const errorData = updateError.response.data;
            
            // Check for specific field errors and show them
            Object.entries(errorData).forEach(([field, messages]: [string, any]) => {
              const messageText = Array.isArray(messages) ? messages[0] : messages.toString();
              toast.error(`${field}: ${messageText}`);
            });
          } else {
            toast.error('Échec de la mise à jour: problème de connexion');
          }
          
          throw updateError; // Re-throw to be caught by the outer catch
        }
      } else {
        try {
          // Try creating with more robust error handling
          console.log('Creating listing with data:', JSON.stringify(data, null, 2));
        
          const newListing = await marketplaceApi.createListing(data)
          
          console.log('Success! Received new listing:', newListing);
          
          // If we have images to upload, do it now
          if (images.length > 0) {
            setUploadingImage(true)
            await uploadNewImages(newListing.id)
            setUploadingImage(false)
          }
          
          toast.success('Annonce créée avec succès')
          reset()
          router.push('/dashboard/listings')
        } catch (createError: any) {
          // More detailed error logging specific to creation
          console.error('Create listing error:', createError);
          console.error('Error name:', createError.name);
          console.error('Error message:', createError.message);
          
          if (createError.response) {
            console.error('Response status:', createError.response.status);
            console.error('Response data:', createError.response.data);
            console.error('Response headers:', createError.response.headers);
            
            // Log the exact structure of the error data
            console.error('Error data stringified:', JSON.stringify(createError.response.data, null, 2));
            
            const errorData = createError.response.data;
            
            // Check for specific field errors and show them
            Object.entries(errorData).forEach(([field, messages]: [string, any]) => {
              const messageText = Array.isArray(messages) ? messages[0] : messages.toString();
              toast.error(`${field}: ${messageText}`);
            });
          } else {
            toast.error('Échec de la création: problème de connexion');
          }
          
          throw createError; // Re-throw to be caught by the outer catch
        }
      }
    } catch (error: any) {
      console.error('Error submitting form:', error);
      if (error.response?.data) {
        console.error('Server response data:', error.response.data);
        
        // Display field-specific errors if available
        const fieldErrors = error.response.data;
        Object.entries(fieldErrors).forEach(([field, messages]) => {
          const message = Array.isArray(messages) ? messages[0] : messages;
          toast.error(`${field}: ${message}`);
          
          // For seller field errors, show a more helpful message
          if (field === 'seller') {
            toast.error("Erreur d'authentification. Veuillez vous reconnecter.");
          }
        });
      } else {
        toast.error(isEdit ? 'Échec de la mise à jour de l\'annonce' : 'Échec de la création de l\'annonce');
      }
    } finally {
      setSubmitting(false);
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        staggerChildren: 0.05 
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { type: "spring", stiffness: 100 }
    }
  }

  const todayDate = new Date().toISOString().split('T')[0];

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="w-full mx-auto max-w-4xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <motion.div variants={itemVariants} className="space-y-4">
          <h2 className="text-2xl font-bold">Informations de base</h2>
          
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre</Label>
              <Input 
                id="title" 
                {...register("title")} 
                placeholder="Entrez un titre descriptif"
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-red-500 text-sm">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea 
                id="description" 
                {...register("description")} 
                placeholder="Décrivez votre produit de déchets agricoles"
                rows={4}
                className={`w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                  errors.description ? "border-red-500" : ""
                }`}
              />
              {errors.description && (
                <p className="text-red-500 text-sm">{errors.description.message}</p>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-4">
          <h2 className="text-2xl font-bold">Images</h2>
          
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <AnimatePresence>
                {images.map((image, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative h-24 w-24 rounded-md overflow-hidden border"
                  >
                    <ImageWithFallback 
                      src={image.preview} 
                      alt={`Aperçu ${index}`} 
                      fill 
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              <div
                className={`h-24 w-24 border-2 ${isDragging ? 'border-primary bg-primary/10' : 'border-dashed border-muted'} rounded-md flex flex-col items-center justify-center hover:bg-muted/50 transition-colors cursor-pointer`}
                onClick={() => fileInputRef.current?.click()}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <ImagePlus className={`h-6 w-6 ${isDragging ? 'text-primary' : 'text-muted-foreground'} mb-1`} />
                <span className={`text-xs ${isDragging ? 'text-primary' : 'text-muted-foreground'}`}>
                  {isDragging ? 'Déposer ici' : 'Ajouter une image'}
                </span>
              </div>
            </div>
            
            <input
              type="file"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              multiple
            />
            
            <p className="text-xs text-muted-foreground">
              Ajoutez jusqu'à 5 images. Faites glisser et déposez vos images ou cliquez pour sélectionner. JPG, PNG ou GIF, max 5 Mo chacune.
            </p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-4">
          <h2 className="text-2xl font-bold">Prix et Quantité</h2>
          
          <div className="grid gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantité</Label>
                <Input 
                  id="quantity" 
                  type="number" 
                  step="0.01"
                  {...register("quantity")} 
                  placeholder="0.00"
                  className={errors.quantity ? "border-red-500" : ""}
                />
                {errors.quantity && (
                  <p className="text-red-500 text-sm">{errors.quantity.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">Unité</Label>
                <Select 
                  defaultValue={watch("unit")}
                  onValueChange={(value) => setValue("unit", value)}
                >
                  <SelectTrigger className={errors.unit ? "border-red-500" : ""}>
                    <SelectValue placeholder="Sélectionner une unité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KG">Kilogrammes (KG)</SelectItem>
                    <SelectItem value="TON">Tonnes (TON)</SelectItem>
                    <SelectItem value="CUBIC_M">Mètres cubes (m³)</SelectItem>
                    <SelectItem value="LITER">Litres (L)</SelectItem>
                    <SelectItem value="UNIT">Unités</SelectItem>
                  </SelectContent>
                </Select>
                {errors.unit && (
                  <p className="text-red-500 text-sm">{errors.unit.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Prix</Label>
                <Input 
                  id="price" 
                  type="number" 
                  step="0.01"
                  {...register("price")}  
                  placeholder="0.00"
                  className={errors.price ? "border-red-500" : ""}
                />
                {errors.price && (
                  <p className="text-red-500 text-sm">{errors.price.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Devise</Label>
                <Select 
                  defaultValue={watch("currency")}
                  onValueChange={(value) => setValue("currency", value)}
                >
                  <SelectTrigger className={errors.currency ? "border-red-500" : ""}>
                    <SelectValue placeholder="Sélectionner une devise" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TND">Dinar Tunisien (TND)</SelectItem>
                    <SelectItem value="LYD">Dinar Libyen (LYD)</SelectItem>
                    <SelectItem value="DZD">Dinar Algérien (DZD)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.currency && (
                  <p className="text-red-500 text-sm">{errors.currency.message}</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-4">
          <h2 className="text-2xl font-bold">Classification et Localisation</h2>
          
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="waste_type">Type de Déchet</Label>
              {loading ? (
                <div className="h-10 bg-muted rounded-md flex items-center justify-center">
                  <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <Select 
                  defaultValue={selectedWasteType?.toString() || watch("waste_type")?.toString()}
                  onValueChange={(value) => {
                    setValue("waste_type", parseInt(value));
                    setSelectedWasteType(parseInt(value));
                  }}
                >
                  <SelectTrigger className={errors.waste_type ? "border-red-500" : ""}>
                    <SelectValue placeholder="Sélectionner un type de déchet" />
                  </SelectTrigger>
                  <SelectContent>
                    {wasteTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name} ({type.category_name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {errors.waste_type && (
                <p className="text-red-500 text-sm">{errors.waste_type.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Lieu</Label>
                <Input 
                  id="location" 
                  {...register("location")} 
                  placeholder="Ville, Région"
                  className={errors.location ? "border-red-500" : ""}
                />
                {errors.location && (
                  <p className="text-red-500 text-sm">{errors.location.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Pays</Label>
                <Select 
                  defaultValue={watch("country")}
                  onValueChange={(value) => setValue("country", value)}
                >
                  <SelectTrigger className={errors.country ? "border-red-500" : ""}>
                    <SelectValue placeholder="Sélectionner un pays" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TN">Tunisie</SelectItem>
                    <SelectItem value="LY">Libye</SelectItem>
                    <SelectItem value="DZ">Algérie</SelectItem>
                  </SelectContent>
                </Select>
                {errors.country && (
                  <p className="text-red-500 text-sm">{errors.country.message}</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-4">
          <h2 className="text-2xl font-bold">Disponibilité et Statut</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="available_from">Disponible À Partir De</Label>
              <div className="relative">
                <Input 
                  id="available_from" 
                  type="date"
                  min={isEdit ? undefined : todayDate}
                  {...register("available_from")} 
                  className={errors.available_from ? "border-red-500 pr-10" : "pr-10"}
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
              {errors.available_from && (
                <p className="text-red-500 text-sm">{errors.available_from.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="available_until">Disponible Jusqu'à (Optionnel)</Label>
              <div className="relative">
                <Input 
                  id="available_until" 
                  type="date"
                  min={watch("available_from") || todayDate}
                  {...register("available_until")} 
                  className={errors.available_until ? "border-red-500 pr-10" : "pr-10"}
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
              {errors.available_until && (
                <p className="text-red-500 text-sm">{errors.available_until.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select 
                defaultValue={watch("status")}
                onValueChange={(value) => setValue("status", value)}
              >
                <SelectTrigger className={errors.status ? "border-red-500" : ""}>
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Actif</SelectItem>
                  <SelectItem value="PAUSED">En pause</SelectItem>
                  {isEdit && (
                    <>
                      <SelectItem value="SOLD">Vendu</SelectItem>
                      <SelectItem value="EXPIRED">Expiré</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-red-500 text-sm">{errors.status.message}</p>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="flex justify-end space-x-4 pt-6"
        >
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/listings')}
            disabled={submitting || uploadingImage}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={submitting || uploadingImage}
            className="relative"
          >
            {(submitting || uploadingImage) && (
              <div className="absolute inset-0 flex items-center justify-center bg-primary rounded-md">
                <div className="animate-spin w-5 h-5 border-2 border-background border-t-transparent rounded-full"></div>
              </div>
            )}
            <span className={(submitting || uploadingImage) ? "opacity-0" : ""}>
              {isEdit ? "Mettre à jour l'annonce" : "Créer l'annonce"}
            </span>
          </Button>
        </motion.div>
      </form>
    </motion.div>
  )
} 