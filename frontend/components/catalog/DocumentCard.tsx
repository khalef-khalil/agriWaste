'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Download } from 'lucide-react';
import { ResourceDocument } from '@/lib/api';

interface DocumentCardProps {
  document: ResourceDocument;
  delay?: number;
}

export function DocumentCard({ document, delay = 0 }: DocumentCardProps) {
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="overflow-hidden hover:border-primary transition-colors duration-300">
        <CardContent className="p-6">
          <div className="flex justify-between">
            <div className="flex-1">
              <h3 className="font-bold">{document.title}</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-3 line-clamp-2">
                {document.description}
              </p>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{formatDate(document.upload_date)}</span>
              </div>
            </div>
            <div className="ml-4 flex items-start">
              <a 
                href={document.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-primary/10 rounded-full text-primary hover:bg-primary/20 transition-colors"
                title="Télécharger"
              >
                <Download className="h-5 w-5" />
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 