"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export default function PrivacyPolicyPage() {
  const sections = [
    {
      title: "1. Collecte des Informations",
      content: "Nous collectons différents types d'informations lorsque vous utilisez notre plateforme, notamment :\n- Informations personnelles (nom, email, numéro de téléphone)\n- Informations professionnelles (type d'activité, localisation)\n- Données d'utilisation (interactions avec la plateforme, préférences)\n- Informations techniques (adresse IP, type de navigateur)"
    },
    {
      title: "2. Utilisation des Informations",
      content: "Nous utilisons vos informations pour :\n- Fournir et améliorer nos services\n- Personnaliser votre expérience\n- Communiquer avec vous concernant votre compte\n- Analyser et optimiser notre plateforme\n- Respecter nos obligations légales"
    },
    {
      title: "3. Protection des Données",
      content: "Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos données personnelles contre tout accès non autorisé, modification, divulgation ou destruction."
    },
    {
      title: "4. Partage des Informations",
      content: "Nous ne partageons vos informations personnelles qu'avec votre consentement, sauf dans les cas suivants :\n- Avec nos prestataires de services\n- Pour respecter la loi\n- Pour protéger nos droits et ceux des autres"
    },
    {
      title: "5. Cookies et Technologies Similaires",
      content: "Nous utilisons des cookies et d'autres technologies de suivi pour améliorer votre expérience sur notre plateforme. Vous pouvez contrôler l'utilisation des cookies via les paramètres de votre navigateur."
    },
    {
      title: "6. Vos Droits",
      content: "Conformément au RGPD, vous disposez des droits suivants :\n- Droit d'accès à vos données\n- Droit de rectification\n- Droit à l'effacement\n- Droit à la limitation du traitement\n- Droit à la portabilité des données\n- Droit d'opposition"
    },
    {
      title: "7. Conservation des Données",
      content: "Nous conservons vos données personnelles aussi longtemps que nécessaire pour fournir nos services et respecter nos obligations légales. Lorsque nous n'avons plus besoin de vos données, nous les supprimons de manière sécurisée."
    },
    {
      title: "8. Modifications de la Politique",
      content: "Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. Les modifications prendront effet dès leur publication sur la plateforme. Nous vous informerons des changements importants par email."
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
                <Shield className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold">Politique de Confidentialité</h1>
              </div>
              <p className="text-muted-foreground">
                Dernière mise à jour : {new Date().toLocaleDateString()}
              </p>
              <p className="mt-4 text-muted-foreground">
                Chez Agriwaste, nous accordons une grande importance à la protection de vos données personnelles. 
                Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos informations.
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
                    <div className="text-muted-foreground whitespace-pre-line">
                      {section.content}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <Card className="mt-8">
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Contact DPO</h2>
              <p className="text-muted-foreground mb-4">
                Pour toute question concernant notre politique de confidentialité ou pour exercer vos droits, 
                veuillez contacter notre Délégué à la Protection des Données :
              </p>
              <Button asChild>
                <Link href="/contact">
                  Contacter le DPO
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
} 