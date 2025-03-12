"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Mail, MessageSquare, Phone, MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("Message envoyé avec succès !");
    setIsSubmitting(false);
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      value: "contact@agriwaste.com",
      link: "mailto:contact@agriwaste.com"
    },
    {
      icon: Phone,
      title: "Téléphone",
      value: "+216 XX XXX XXX",
      link: "tel:+216XXXXXXX"
    },
    {
      icon: MapPin,
      title: "Adresse",
      value: "Tunis, Tunisie",
      link: "#"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Hero Section */}
      <section className="relative bg-primary/10 py-16">
        <motion.div
          className="container mx-auto px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-6">
              Contactez-nous
            </h1>
            <p className="text-xl text-muted-foreground">
              Notre équipe est là pour répondre à toutes vos questions.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Contact Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Contact Form */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Envoyez-nous un message</CardTitle>
                    <CardDescription>
                      Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">Prénom</Label>
                          <Input id="firstName" placeholder="Votre prénom" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Nom</Label>
                          <Input id="lastName" placeholder="Votre nom" required />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="votre@email.com" required />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject">Sujet</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez un sujet" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">Question générale</SelectItem>
                            <SelectItem value="technical">Support technique</SelectItem>
                            <SelectItem value="partnership">Partenariat</SelectItem>
                            <SelectItem value="other">Autre</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                          id="message"
                          placeholder="Votre message..."
                          className="min-h-[150px]"
                          required
                        />
                      </div>

                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Envoi en cours..." : "Envoyer le message"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Contact Information */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
              >
                <div className="grid gap-6">
                  {contactInfo.map((info, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                    >
                      <Card>
                        <CardContent className="flex items-center gap-4 p-6">
                          <div className="p-3 rounded-xl bg-primary/10 text-primary">
                            <info.icon className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="font-medium">{info.title}</h3>
                            <a
                              href={info.link}
                              className="text-muted-foreground hover:text-primary transition-colors"
                            >
                              {info.value}
                            </a>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* FAQ Card */}
                <Card className="bg-primary/5">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 rounded-xl bg-primary/10 text-primary">
                        <MessageSquare className="h-6 w-6" />
                      </div>
                      <h3 className="font-medium">Questions Fréquentes</h3>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      Consultez notre FAQ pour trouver rapidement des réponses à vos questions.
                    </p>
                    <Button variant="outline" asChild>
                      <a href="/faq">Voir la FAQ</a>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 