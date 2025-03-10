import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Marché - AgriWaste",
  description: "Trouvez et achetez des déchets agricoles auprès de vendeurs à travers l'Afrique du Nord",
};

export default function MarketplaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen bg-background">
      {children}
    </main>
  );
} 