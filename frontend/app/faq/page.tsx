"use client";

import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const faqCategories = [
    {
      title: "Général",
      questions: [
        {
          q: "Qu'est-ce qu'AgriWaste ?",
          a: "AgriWaste est une plateforme qui connecte les agriculteurs avec les chercheurs et les industries pour valoriser les déchets agricoles."
        },
        {
          q: "Comment fonctionne la plateforme ?",
          a: "La plateforme permet aux agriculteurs de lister leurs déchets agricoles et aux acheteurs potentiels de les découvrir et de les contacter."
        },
        {
          q: "Est-ce que le service est gratuit ?",
          a: "L'inscription et la consultation sont gratuites. Des frais peuvent s'appliquer pour certaines fonctionnalités premium."
        }
      ]
    },
    {
      title: "Pour les Agriculteurs",
      questions: [
        {
          q: "Comment puis-je vendre mes déchets agricoles ?",
          a: "Créez un compte, publiez une annonce avec les détails de vos déchets, et attendez que les acheteurs vous contactent."
        },
        {
          q: "Quels types de déchets puis-je vendre ?",
          a: "Tous les types de déchets agricoles sont acceptés, tant qu'ils respectent nos conditions d'utilisation."
        }
      ]
    },
    {
      title: "Pour les Acheteurs",
      questions: [
        {
          q: "Comment puis-je trouver des déchets spécifiques ?",
          a: "Utilisez notre moteur de recherche avancé et nos filtres pour trouver exactement ce que vous cherchez."
        },
        {
          q: "Comment contacter un vendeur ?",
          a: "Cliquez sur le bouton 'Contacter' sur l'annonce qui vous intéresse pour envoyer un message au vendeur."
        }
      ]
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

  // Filter questions based on search query
  const filteredCategories = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
           q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

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
              Questions Fréquentes
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Trouvez rapidement des réponses à vos questions sur AgriWaste.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder="Rechercher une question..."
                className="pl-10 py-6 text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* FAQ Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-3xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredCategories.map((category, categoryIndex) => (
              <motion.div
                key={categoryIndex}
                variants={itemVariants}
                className="mb-8"
              >
                <h2 className="text-2xl font-semibold mb-4">{category.title}</h2>
                <Card>
                  <CardContent className="pt-6">
                    <Accordion type="single" collapsible className="w-full">
                      {category.questions.map((item, index) => (
                        <AccordionItem key={index} value={`item-${categoryIndex}-${index}`}>
                          <AccordionTrigger className="text-left">
                            {item.q}
                          </AccordionTrigger>
                          <AccordionContent>
                            <p className="text-muted-foreground">
                              {item.a}
                            </p>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Contact Support */}
          <motion.div
            className="max-w-3xl mx-auto mt-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-primary/5">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-2">
                  Vous n'avez pas trouvé ce que vous cherchez ?
                </h3>
                <p className="text-muted-foreground mb-4">
                  Notre équipe de support est là pour vous aider.
                </p>
                <Button asChild>
                  <a href="/contact">Contacter le Support</a>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
} 