"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Cookie } from "lucide-react";

export default function CookiePolicyPage() {
  const sections = [
    {
      title: "1. Qu'est-ce qu'un Cookie ?",
      content: "Un cookie est un petit fichier texte stocké sur votre appareil lorsque vous visitez un site web. Les cookies nous permettent de reconnaître votre appareil et d'améliorer votre expérience sur notre plateforme."
    },
    {
      title: "2. Types de Cookies Utilisés",
      subsections: [
        {
          title: "Cookies Essentiels",
          content: "Ces cookies sont nécessaires au fonctionnement de base de notre site. Ils vous permettent de naviguer sur le site et d'utiliser ses fonctionnalités essentielles."
        },
        {
          title: "Cookies de Performance",
          content: "Ces cookies nous aident à comprendre comment les visiteurs interagissent avec notre site en collectant des informations anonymes. Ils nous permettent d'améliorer continuellement notre plateforme."
        },
        {
          title: "Cookies de Fonctionnalité",
          content: "Ces cookies permettent au site de mémoriser vos choix (comme votre nom d'utilisateur, votre langue ou votre région) et de fournir des fonctionnalités améliorées et plus personnelles."
        },
        {
          title: "Cookies de Ciblage",
          content: "Ces cookies sont utilisés pour diffuser des publicités plus pertinentes pour vous et vos intérêts. Ils sont également utilisés pour limiter le nombre de fois que vous voyez une publicité."
        }
      ]
    },
    {
      title: "3. Comment Gérer les Cookies",
      content: "Vous pouvez contrôler et/ou supprimer les cookies comme vous le souhaitez. Vous pouvez supprimer tous les cookies déjà présents sur votre appareil et vous pouvez configurer la plupart des navigateurs pour les empêcher d'en placer. Toutefois, si vous faites cela, vous devrez peut-être ajuster manuellement certaines préférences chaque fois que vous visitez un site, et certains services et fonctionnalités pourraient ne pas fonctionner."
    },
    {
      title: "4. Cookies Tiers",
      content: "Nous utilisons également des cookies tiers pour :\n- Analyser le trafic de notre site (Google Analytics)\n- Intégrer les fonctionnalités des réseaux sociaux\n- Améliorer la sécurité de notre plateforme"
    },
    {
      title: "5. Durée de Conservation",
      content: "Les cookies que nous utilisons ont différentes durées de conservation :\n- Cookies de session : supprimés lorsque vous fermez votre navigateur\n- Cookies persistants : peuvent rester jusqu'à 13 mois sur votre appareil"
    },
    {
      title: "6. Mise à Jour de la Politique",
      content: "Nous nous réservons le droit de modifier cette politique relative aux cookies à tout moment. Tout changement sera effectif immédiatement après la publication de la politique mise à jour sur notre site web."
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
              <div className="flex items-center gap-4 mb-4">
                <Cookie className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold">Politique des Cookies</h1>
              </div>
              <p className="text-muted-foreground">
                Dernière mise à jour : {new Date().toLocaleDateString()}
              </p>
              <p className="mt-4 text-muted-foreground">
                Cette politique explique comment nous utilisons les cookies et technologies similaires sur notre plateforme 
                pour améliorer votre expérience utilisateur.
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
                    {section.content && (
                      <div className="text-muted-foreground whitespace-pre-line">
                        {section.content}
                      </div>
                    )}
                    {section.subsections && (
                      <div className="space-y-4 mt-4">
                        {section.subsections.map((subsection, subIndex) => (
                          <div key={subIndex} className="pl-4 border-l-2 border-primary/10">
                            <h3 className="font-medium mb-2">{subsection.title}</h3>
                            <p className="text-muted-foreground">{subsection.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <Card className="mt-8">
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Questions sur les Cookies ?</h2>
              <p className="text-muted-foreground mb-4">
                Si vous avez des questions concernant notre utilisation des cookies, n'hésitez pas à nous contacter :
              </p>
              <Button asChild>
                <Link href="/contact">
                  Nous Contacter
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
} 