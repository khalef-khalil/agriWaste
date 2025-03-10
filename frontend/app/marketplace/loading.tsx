import { Card } from "@/components/ui/card";

export default function MarketplaceLoading() {
  return (
    <>
      {/* Hero section placeholder */}
      <div className="relative w-full h-64 md:h-80 bg-gray-300 animate-pulse"></div>

      <div className="container mx-auto py-8 px-4 md:px-6">
        <div className="animate-pulse">
          <div className="h-10 w-48 bg-gray-200 rounded mb-2"></div>
          <div className="h-5 w-96 bg-gray-200 rounded mb-8"></div>

          <div className="mb-8">
            <div className="h-8 w-36 bg-gray-200 rounded mb-3"></div>
            <div className="flex flex-wrap gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 w-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="h-10 flex-grow bg-gray-200 rounded"></div>
            <div className="h-10 w-full md:w-48 bg-gray-200 rounded"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="p-4 h-80">
                <div className="w-full h-40 bg-gray-200 rounded-md mb-4"></div>
                <div className="w-3/4 h-5 bg-gray-200 rounded mb-2"></div>
                <div className="w-1/2 h-5 bg-gray-200 rounded mb-4"></div>
                <div className="flex justify-between">
                  <div className="w-1/4 h-5 bg-gray-200 rounded"></div>
                  <div className="w-1/4 h-5 bg-gray-200 rounded"></div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
} 