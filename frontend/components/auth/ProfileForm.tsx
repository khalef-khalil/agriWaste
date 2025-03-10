import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useAuth, User } from '@/lib/auth';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Form schema
const profileSchema = z.object({
  email: z.string().email('Veuillez entrer une adresse email valide'),
  first_name: z.string().min(1, 'Le prénom est requis'),
  last_name: z.string().min(1, 'Le nom de famille est requis'),
  phone_number: z.string().optional(),
  address: z.string().optional(),
  bio: z.string().optional(),
  country: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileForm() {
  const { user, updateProfile, error } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Initialize form with user data
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      email: user?.email || '',
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      phone_number: user?.profile?.phone_number || '',
      address: user?.profile?.address || '',
      bio: user?.profile?.bio || '',
      country: user?.profile?.country || '',
    },
  });

  // Update form values when user data changes
  useEffect(() => {
    if (user) {
      form.reset({
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone_number: user.profile?.phone_number || '',
        address: user.profile?.address || '',
        bio: user.profile?.bio || '',
        country: user.profile?.country || '',
      });
    }
  }, [user, form]);

  // Country choices matching the backend model
  const COUNTRY_CHOICES = [
    { value: 'TN', label: 'Tunisia' },
    { value: 'LY', label: 'Libya' },
    { value: 'DZ', label: 'Algeria' },
  ];

  // Submit handler
  const onSubmit = async (data: ProfileFormValues) => {
    setIsSubmitting(true);
    setIsSuccess(false);
    
    try {
      // Restructure data to match the backend's expected format
      const profileData = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        profile: {
          user_type: user?.profile?.user_type || 'FARMER', // Send the user_type which is required
          bio: data.bio,
          address: data.address,
          phone_number: data.phone_number,
          // country is stored in the profile
          country: data.country,
          // Preserve other profile fields if they exist
          organization: user?.profile?.organization,
          profile_image: user?.profile?.profile_image
        }
      };
      
      await updateProfile(profileData);
      setIsSuccess(true);
      toast.success('Profil mis à jour avec succès');
    } catch (err) {
      // Error is handled in the auth context
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show error toast if there's an auth error
  if (error) {
    toast.error(error);
  }

  // Get initials for avatar fallback
  const getInitials = (user: User | null) => {
    if (!user) return '';
    return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto"
    >
      <Card className="border-2 border-muted shadow-md">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-primary">Votre Profil</CardTitle>
            <CardDescription>
              Mettez à jour vos informations personnelles
            </CardDescription>
          </div>
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-4 sm:mt-0"
          >
            <Avatar className="w-20 h-20 border-2 border-primary">
              {user?.profile_picture ? (
                <AvatarImage src={user.profile_picture} alt={user.username} />
              ) : null}
              <AvatarFallback className="text-xl font-bold bg-accent text-accent-foreground">
                {getInitials(user)}
              </AvatarFallback>
            </Avatar>
          </motion.div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prénom</FormLabel>
                      <FormControl>
                        <Input placeholder="Votre prénom" {...field} className="bg-card" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom</FormLabel>
                      <FormControl>
                        <Input placeholder="Votre nom" {...field} className="bg-card" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Votre email"
                        {...field}
                        className="bg-card"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="phone_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Numéro de téléphone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Votre numéro de téléphone"
                          {...field}
                          className="bg-card"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pays</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-card">
                            <SelectValue placeholder="Sélectionnez un pays" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {COUNTRY_CHOICES.map((country) => (
                            <SelectItem key={country.value} value={country.value}>
                              {country.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Votre adresse"
                        {...field}
                        className="bg-card"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Parlez-nous de vous"
                        {...field}
                        className="bg-card"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Button
                  type="submit"
                  className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-t-2 border-primary-foreground rounded-full animate-spin mr-2"></div>
                      Mise à jour...
                    </div>
                  ) : (
                    'Mettre à jour le profil'
                  )}
                </Button>
              </motion.div>
              
              {isSuccess && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-green-600 dark:text-green-400 mt-2"
                >
                  Profil mis à jour avec succès !
                </motion.p>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </motion.div>
  );
} 