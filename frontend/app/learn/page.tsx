"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Leaf, Book, Microscope, Factory, Download } from "lucide-react";
import Link from "next/link";

export default function LearnPage() {
  const resources = [
    {
      title: "Guide de l'Agriculture Durable",
      description: "Apprenez les meilleures pratiques pour une agriculture respectueuse de l'environnement.",
      icon: Leaf,
      href: "#",
      color: "text-green-500"
    },
    {
      title: "Recherche et Innovation",
      description: "Découvrez les dernières avancées dans la valorisation des déchets agricoles.",
      icon: Microscope,
      href: "#",
      color: "text-blue-500"
    },
    {
      title: "Applications Industrielles",
      description: "Explorez les différentes utilisations des déchets agricoles dans l'industrie.",
      icon: Factory,
      href: "#",
      color: "text-purple-500"
    },
    {
      title: "Ressources Téléchargeables",
      description: "Accédez à notre bibliothèque de documents et guides pratiques.",
      icon: Download,
      href: "#",
      color: "text-orange-500"
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
      <section className="relative bg-primary/10 py-16 md:py-24">
        <motion.div
          className="container mx-auto px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Apprenez à Valoriser les Déchets Agricoles
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Découvrez comment transformer les déchets agricoles en ressources précieuses pour un avenir plus durable.
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Commencer l'Apprentissage
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Resources Grid */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {resources.map((resource, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Link href={resource.href}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl bg-background border ${resource.color}`}>
                          <resource.icon className="h-6 w-6" />
                        </div>
                        <div>
                          <CardTitle className="group-hover:text-primary transition-colors">
                            {resource.title}
                          </CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base">
                        {resource.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Content */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Contenu à la Une</h2>
              <p className="text-muted-foreground">
                Les ressources les plus populaires sélectionnées par notre communauté.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                >
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle className="text-lg">Guide Pratique {index + 1}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
} 