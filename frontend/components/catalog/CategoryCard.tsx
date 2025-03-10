'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Category } from '@/lib/api';
import { toPathString } from '@/lib/utils';

interface CategoryCardProps {
  category: Category;
  delay?: number;
}

export function CategoryCard({ category, delay = 0 }: CategoryCardProps) {
  console.log("Rendering CategoryCard for:", category);
  return (
    <Link href={`/catalog/category/${toPathString(category.id)}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        whileHover={{ scale: 1.03 }}
      >
        <Card className="h-full overflow-hidden border-2 hover:border-primary transition-colors duration-300">
          <div className="h-48 bg-muted relative overflow-hidden">
            {category.image ? (
              <img 
                src={category.image} 
                alt={category.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
                <span className="text-5xl font-bold text-primary/40">
                  {category.name.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <CardContent className="p-6">
            <h3 className="text-xl font-bold">{category.name}</h3>
            <p className="mt-2 text-muted-foreground line-clamp-3">
              {category.description}
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
} 