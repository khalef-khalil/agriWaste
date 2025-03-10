import { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/lib/auth';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { RegisterData } from '@/lib/auth';

// Form schema with validation
const registerSchema = z.object({
  username: z.string().min(3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères'),
  email: z.string().email('Veuillez entrer une adresse email valide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  password_confirm: z.string(),
  first_name: z.string().min(1, 'Le prénom est requis'),
  last_name: z.string().min(1, 'Le nom de famille est requis'),
  user_type: z.enum(['Farmer', 'Researcher', 'Startup', 'Industry'], {
    required_error: 'Veuillez sélectionner un type d\'utilisateur',
  }),
  phone_number: z.string().optional(),
  country: z.string().optional(),
  address: z.string().optional(),
  bio: z.string().optional(),
}).refine((data) => data.password === data.password_confirm, {
  message: "Les mots de passe ne correspondent pas",
  path: ['password_confirm'],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const { register, error } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1); // Multi-step form
  const totalSteps = 2;

  // Country choices matching the backend model
  const COUNTRY_CHOICES = [
    { value: 'TN', label: 'Tunisia' },
    { value: 'LY', label: 'Libya' },
    { value: 'DZ', label: 'Algeria' },
  ];

  // Initialize form
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      password_confirm: '',
      first_name: '',
      last_name: '',
      user_type: 'Farmer',
      phone_number: '',
      country: '',
      address: '',
      bio: '',
    },
  });

  // Next step handler
  const goToNextStep = async () => {
    // Validate current step
    if (step === 1) {
      const isValid = await form.trigger([
        'username',
        'email',
        'password',
        'password_confirm',
        'first_name',
        'last_name',
      ]);
      if (isValid) setStep(2);
    }
  };

  // Previous step handler
  const goToPreviousStep = () => {
    if (step > 1) setStep(step - 1);
  };

  // Submit handler
  const onSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true);
    try {
      const userData: RegisterData = {
        ...data,
      };
      await register(userData);
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

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  // Traduire les types d'utilisateur pour l'affichage
  const getUserTypeLabel = (type: string) => {
    switch (type) {
      case 'Farmer': return 'Agriculteur';
      case 'Researcher': return 'Chercheur';
      case 'Startup': return 'Startup';
      case 'Industry': return 'Industrie';
      default: return type;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="border-2 border-muted shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-primary">
            Créer un Compte
          </CardTitle>
          <CardDescription className="text-center">
            Rejoignez AgriWaste Marketplace aujourd'hui
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Step 1: Basic Information */}
              {step === 1 && (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={fadeIn}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
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
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom d'utilisateur</FormLabel>
                        <FormControl>
                          <Input placeholder="Choisissez un nom d'utilisateur" {...field} className="bg-card" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Entrez votre email"
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
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mot de passe</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Créez un mot de passe"
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
                    name="password_confirm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmer le mot de passe</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Confirmez votre mot de passe"
                            {...field}
                            className="bg-card"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
              )}

              {/* Step 2: Additional Information */}
              {step === 2 && (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={fadeIn}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="user_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type d'utilisateur</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-card">
                              <SelectValue placeholder="Sélectionnez un type d'utilisateur" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Farmer">Agriculteur</SelectItem>
                            <SelectItem value="Researcher">Chercheur</SelectItem>
                            <SelectItem value="Startup">Startup</SelectItem>
                            <SelectItem value="Industry">Industrie</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Numéro de téléphone (Optionnel)</FormLabel>
                        <FormControl>
                          <Input placeholder="Votre numéro de téléphone" {...field} className="bg-card" />
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
                        <FormLabel>Pays (Optionnel)</FormLabel>
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
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adresse (Optionnel)</FormLabel>
                        <FormControl>
                          <Input placeholder="Votre adresse" {...field} className="bg-card" />
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
                        <FormLabel>Bio (Optionnel)</FormLabel>
                        <FormControl>
                          <Input placeholder="Courte bio à propos de vous" {...field} className="bg-card" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
              )}

              {/* Form Navigation */}
              <div className="flex justify-between mt-6">
                {step > 1 ? (
                  <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                    <Button
                      type="button"
                      onClick={goToPreviousStep}
                      variant="outline"
                      className="w-32"
                    >
                      Retour
                    </Button>
                  </motion.div>
                ) : (
                  <div className="w-32"></div>
                )}
                
                <div className="flex items-center">
                  {Array.from({ length: totalSteps }).map((_, index) => (
                    <div
                      key={index}
                      className={`w-2.5 h-2.5 rounded-full mx-1 ${
                        step === index + 1 ? 'bg-primary' : 'bg-muted'
                      }`}
                    ></div>
                  ))}
                </div>

                {step < totalSteps ? (
                  <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                    <Button
                      type="button"
                      onClick={goToNextStep}
                      className="w-32 bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      Suivant
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                    <Button
                      type="submit"
                      className="w-32 bg-primary hover:bg-primary/90 text-primary-foreground"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center">
                          <div className="w-4 h-4 border-t-2 border-primary-foreground rounded-full animate-spin mr-2"></div>
                          <span>Inscription...</span>
                        </div>
                      ) : (
                        'S\'inscrire'
                      )}
                    </Button>
                  </motion.div>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center">
            Vous avez déjà un compte ?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Connectez-vous ici
            </Link>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
} 