'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { WasteType } from '@/lib/api';
import { toPathString } from '@/lib/utils';

interface WasteTypeCardProps {
  wasteType: WasteType;
  delay?: number;
}

export function WasteTypeCard({ wasteType, delay = 0 }: WasteTypeCardProps) {
  return (
    <Link href={`/catalog/waste-type/${toPathString(wasteType.id)}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        whileHover={{ scale: 1.03 }}
      >
        <Card className="h-full overflow-hidden border-2 hover:border-primary transition-colors duration-300">
          <div className="h-40 bg-muted relative overflow-hidden">
            {wasteType.image ? (
              <img 
                src={wasteType.image} 
                alt={wasteType.name || 'Type de déchet'} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
                <span className="text-4xl font-bold text-primary/40">
                  {wasteType.name ? wasteType.name.charAt(0) : '?'}
                </span>
              </div>
            )}
          </div>
          <CardContent className="p-6">
            <h3 className="text-xl font-bold">{wasteType.name || 'Type de déchet sans nom'}</h3>
            <p className="mt-2 text-muted-foreground line-clamp-3">
              {wasteType.description || 'Aucune description disponible'}
            </p>
            <div className="mt-4 pt-4 border-t">
              <h4 className="text-sm font-medium mb-1">Applications potentielles:</h4>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {wasteType.potential_applications || wasteType.potential_uses || 'Non spécifié'}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
} 