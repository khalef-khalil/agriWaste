"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { marketplaceApi, Listing } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { Search, Filter, MapPin } from "lucide-react";
import ListingCard from "@/components/marketplace/ListingCard";
import CountryFilter from "@/components/marketplace/CountryFilter";

export default function MarketplacePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);

  useEffect(() => {
    const fetchListings = async () => {
      setIsLoading(true);
      try {
        let response;
        if (selectedCountry) {
          response = await marketplaceApi.getListingsByCountry(selectedCountry, currentPage);
        } else {
          response = await marketplaceApi.getActiveListings(currentPage);
        }
        setListings(response.results);
        setFilteredListings(response.results);
        setTotalCount(response.count);
        setHasNextPage(!!response.next);
        setHasPreviousPage(!!response.previous);
      } catch (error) {
        console.error("Error fetching listings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, [selectedCountry, currentPage]);

  useEffect(() => {
    let result = [...listings];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (listing) =>
          listing.title.toLowerCase().includes(query) ||
          listing.description.toLowerCase().includes(query) ||
          listing.waste_type_name.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    if (sortBy === "newest") {
      result = result.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } else if (sortBy === "oldest") {
      result = result.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    } else if (sortBy === "price_low") {
      result = result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price_high") {
      result = result.sort((a, b) => b.price - a.price);
    }

    setFilteredListings(result);
  }, [listings, searchQuery, sortBy]);

  const handleCountrySelect = (country: string | null) => {
    setSelectedCountry(country);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0);
  };

  return (
    <>
      {/* Hero section */}
      <div className="relative w-full h-64 md:h-80 overflow-hidden">
        <Image 
          src="/marketplace-hero.jpg" 
          alt="Déchets agricoles" 
          fill 
          priority
          className="object-cover brightness-50"
          sizes="100vw"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-5xl font-bold mb-2 text-center"
          >
            Marché des Déchets Agricoles
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg md:text-xl text-center max-w-2xl"
          >
            Connectez-vous avec des vendeurs à travers l'Afrique du Nord pour sourcer des matériaux durables
          </motion.p>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <CountryFilter
            selectedCountry={selectedCountry}
            onCountrySelect={handleCountrySelect}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col md:flex-row gap-4 mb-8"
        >
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Rechercher des annonces..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="w-full md:w-48">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Plus récent</SelectItem>
                <SelectItem value="oldest">Plus ancien</SelectItem>
                <SelectItem value="price_low">Prix: croissant</SelectItem>
                <SelectItem value="price_high">Prix: décroissant</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="p-4 h-80 animate-pulse">
                <div className="w-full h-40 bg-gray-200 rounded-md mb-4"></div>
                <div className="w-3/4 h-5 bg-gray-200 rounded mb-2"></div>
                <div className="w-1/2 h-5 bg-gray-200 rounded mb-4"></div>
                <div className="w-1/4 h-5 bg-gray-200 rounded"></div>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {filteredListings.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <h3 className="text-xl font-medium mb-2">Aucune annonce trouvée</h3>
                <p className="text-muted-foreground mb-6">
                  Essayez de modifier vos critères de recherche ou revenez plus tard
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCountry(null);
                    setCurrentPage(1);
                  }}
                  variant="outline"
                >
                  Effacer les filtres
                </Button>
              </motion.div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {filteredListings.map((listing, index) => (
                      <motion.div
                        key={listing.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{
                          duration: 0.3,
                          delay: index * 0.05,
                        }}
                      >
                        <ListingCard listing={listing} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Pagination controls */}
                <div className="mt-8 flex justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!hasPreviousPage}
                  >
                    Page précédente
                  </Button>
                  <span className="flex items-center px-4 py-2 bg-muted rounded-md">
                    Page {currentPage} sur {Math.ceil(totalCount / 15)}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!hasNextPage}
                  >
                    Page suivante
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
} 