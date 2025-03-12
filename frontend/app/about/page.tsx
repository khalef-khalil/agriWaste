"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Leaf, Target, ChevronRight, Award, Globe } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  const stats = [
    {
      value: "1000+",
      label: "Agriculteurs",
      icon: Users
    },
    {
      value: "500+",
      label: "Déchets Valorisés",
      icon: Leaf
    },
    {
      value: "50+",
      label: "Partenaires",
      icon: Target
    }
  ];

  const values = [
    {
      title: "Innovation",
      description: "Nous encourageons constamment l'innovation dans la valorisation des déchets agricoles.",
      icon: Award,
      color: "text-blue-500"
    },
    {
      title: "Durabilité",
      description: "Notre mission est de promouvoir une agriculture durable et respectueuse de l'environnement.",
      icon: Leaf,
      color: "text-green-500"
    },
    {
      title: "Impact Global",
      description: "Nous travaillons pour créer un impact positif sur l'environnement à l'échelle mondiale.",
      icon: Globe,
      color: "text-purple-500"
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
      <section className="relative bg-primary/10 py-24">
        <motion.div
          className="container mx-auto px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Notre Mission
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Connecter les agriculteurs, les chercheurs et les industries pour transformer les déchets agricoles en ressources précieuses.
            </p>
            <Button size="lg" asChild>
              <Link href="/register">
                Rejoignez-nous
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {stats.map((stat, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="text-center">
                  <CardContent className="pt-6">
                    <div className="flex justify-center mb-4">
                      <div className="p-3 rounded-xl bg-primary/10">
                        <stat.icon className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold mb-2">{stat.value}</div>
                    <div className="text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Nos Valeurs</h2>
              <p className="text-muted-foreground">
                Les principes qui guident nos actions et notre vision.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`p-3 rounded-xl bg-background border ${value.color}`}>
                          <value.icon className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-semibold">{value.title}</h3>
                      </div>
                      <p className="text-muted-foreground">
                        {value.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-primary/5">
              <CardContent className="py-12">
                <h2 className="text-3xl font-bold mb-4">
                  Prêt à Faire Partie du Changement ?
                </h2>
                <p className="text-muted-foreground mb-8">
                  Rejoignez notre communauté et participez à la transformation des déchets agricoles.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" asChild>
                    <Link href="/register">
                      Créer un Compte
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/contact">
                      Contactez-nous
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
} 