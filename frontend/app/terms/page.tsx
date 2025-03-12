"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  const sections = [
    {
      title: "1. Acceptation des Conditions",
      content: "En accédant et en utilisant la plateforme Agriwaste, vous acceptez d'être lié par ces conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service."
    },
    {
      title: "2. Description du Service",
      content: "Agriwaste est une plateforme qui facilite la connexion entre les agriculteurs, les chercheurs et les industries pour la valorisation des déchets agricoles. Nous fournissons des outils et des ressources pour optimiser la gestion et la transformation des déchets agricoles."
    },
    {
      title: "3. Inscription et Compte",
      content: "Pour utiliser certaines fonctionnalités de notre service, vous devez créer un compte. Vous êtes responsable de maintenir la confidentialité de vos informations de connexion et de toutes les activités qui se produisent sous votre compte."
    },
    {
      title: "4. Utilisation du Service",
      content: "Vous acceptez d'utiliser le service conformément à toutes les lois et réglementations applicables. Vous ne devez pas utiliser le service d'une manière qui pourrait endommager, désactiver ou surcharger nos systèmes."
    },
    {
      title: "5. Propriété Intellectuelle",
      content: "Tout le contenu présent sur Agriwaste, y compris mais sans s'y limiter, les textes, graphiques, logos, images et logiciels, est la propriété d'Agriwaste ou de ses concédants de licence et est protégé par les lois sur la propriété intellectuelle."
    },
    {
      title: "6. Confidentialité",
      content: "Votre utilisation de notre service est également régie par notre Politique de Confidentialité. Pour plus d'informations sur nos pratiques en matière de confidentialité, veuillez consulter notre Politique de Confidentialité."
    },
    {
      title: "7. Modifications des Conditions",
      content: "Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications prendront effet dès leur publication sur la plateforme. Votre utilisation continue du service après la publication des modifications constitue votre acceptation des nouvelles conditions."
    },
    {
      title: "8. Résiliation",
      content: "Nous nous réservons le droit de suspendre ou de résilier votre accès au service à tout moment, pour quelque raison que ce soit, y compris en cas de violation de ces conditions d'utilisation."
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <Button
            variant="ghost"
            size="sm"
            className="mb-8"
            asChild
          >
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à l'accueil
            </Link>
          </Button>

          <Card className="mb-8">
            <CardContent className="pt-6">
              <h1 className="text-3xl font-bold mb-4">Conditions d'Utilisation</h1>
              <p className="text-muted-foreground">
                Dernière mise à jour : {new Date().toLocaleDateString()}
              </p>
            </CardContent>
          </Card>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {sections.map((section, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
              >
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-xl font-semibold mb-4">{section.title}</h2>
                    <p className="text-muted-foreground">{section.content}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <Card className="mt-8">
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Contact</h2>
              <p className="text-muted-foreground mb-4">
                Si vous avez des questions concernant ces conditions d'utilisation, veuillez nous contacter :
              </p>
              <Button asChild>
                <Link href="/contact">
                  Contactez-nous
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
} 