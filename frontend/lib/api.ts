import axios, { AxiosError } from 'axios';
import { API_URL } from './auth';

// Set up axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Check if we're on the client side
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Token ${token}`;
        // Debug token for create listing
        if (config.url === '/api/marketplace/listings/' && config.method === 'post') {
          console.log('Adding token to create listing request:', token.substring(0, 10) + '...');
          console.log('Full headers:', config.headers);
        }
      } else {
        console.warn('No auth token found in localStorage');
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  response => response,
  (error: AxiosError) => {
    // Handle 401 Unauthorized errors globally
    if (error.response?.status === 401) {
      // Clear token if it's expired or invalid
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
      
      // You might want to redirect to login
      console.error('Authentication error: Token expired or invalid');
    }
    
    return Promise.reject(error);
  }
);

// Types for the waste catalog
export interface Category {
  id: number;
  name: string;
  description: string;
  image?: string;
}

export interface WasteType {
  id: number;
  name: string;
  description: string;
  category: number;
  category_name: string;
  seasonal_availability?: string;
  storage_requirements?: string;
  transportation_requirements?: string;
  potential_applications?: string;
  potential_uses?: string;
  challenges?: string;
  image?: string;
}

export interface ResourceDocument {
  id: number;
  title: string;
  description: string;
  file_url: string;
  waste_type: number;
  waste_type_name: string;
  upload_date: string;
}

// Types for marketplace
export interface Listing {
  id: number;
  title: string;
  description: string;
  price: number;
  unit: string;
  currency: string;
  quantity: number;
  waste_type: number;
  waste_type_name: string;
  seller: UserProfile;
  location: string;
  country: string;
  status: string;
  featured: boolean;
  available_from: string;
  available_until?: string;
  created_at: string;
  updated_at: string;
  images: ListingImage[];
}

export interface ListingImage {
  id: number;
  image_url: string;
  listing: number;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: string;
  organization_name?: string;
  profile_image?: string;
}

// Types for paginated responses
interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// API functions for waste catalog
export const catalogApi = {
  // Get all categories
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get<PaginatedResponse<Category>>('/api/waste-catalog/categories/');
    return response.data.results;
  },

  // Get category by ID
  getCategoryById: async (id: number): Promise<Category> => {
    const response = await api.get(`/api/waste-catalog/categories/${id}/`);
    return response.data;
  },

  // Get all waste types
  getWasteTypes: async (): Promise<WasteType[]> => {
    const response = await api.get<PaginatedResponse<WasteType>>('/api/waste-catalog/types/');
    return response.data.results;
  },

  // Get waste type by ID
  getWasteTypeById: async (id: number): Promise<WasteType> => {
    const response = await api.get(`/api/waste-catalog/types/${id}/`);
    return response.data;
  },

  // Get waste types by category
  getWasteTypesByCategory: async (categoryId: number): Promise<WasteType[]> => {
    const response = await api.get<WasteType[]>(`/api/waste-catalog/types/by_category/?category_id=${categoryId}`);
    // API returns array directly, not paginated response
    return response.data;
  },

  // Get all resource documents
  getResourceDocuments: async (): Promise<ResourceDocument[]> => {
    const response = await api.get<PaginatedResponse<ResourceDocument>>('/api/waste-catalog/documents/');
    return response.data.results;
  },

  // Get resource documents by waste type
  getResourceDocumentsByWasteType: async (wasteTypeId: number): Promise<ResourceDocument[]> => {
    const response = await api.get<PaginatedResponse<ResourceDocument>>(`/api/waste-catalog/documents/?waste_type=${wasteTypeId}`);
    return response.data.results;
  }
};

// API functions for marketplace
export const marketplaceApi = {
  // Get all listings
  getListings: async (): Promise<Listing[]> => {
    const response = await api.get<PaginatedResponse<Listing>>('/api/marketplace/listings/');
    return response.data.results;
  },

  // Get active listings
  getActiveListings: async (): Promise<Listing[]> => {
    const response = await api.get<PaginatedResponse<Listing>>('/api/marketplace/listings/active/');
    return response.data.results;
  },

  // Get listings by country
  getListingsByCountry: async (country: string): Promise<Listing[]> => {
    const response = await api.get<PaginatedResponse<Listing>>(`/api/marketplace/listings/by_country/?country=${country}`);
    return response.data.results;
  },

  // Get listing by ID
  getListingById: async (id: number): Promise<Listing> => {
    const response = await api.get(`/api/marketplace/listings/${id}/`);
    return response.data;
  },

  // Get user's listings
  getMyListings: async (): Promise<Listing[]> => {
    const response = await api.get<PaginatedResponse<Listing>>('/api/marketplace/listings/my_listings/');
    return response.data.results;
  },

  // Create a new listing
  createListing: async (listingData: Omit<Listing, 'id' | 'seller' | 'waste_type_name' | 'created_at' | 'updated_at' | 'images' | 'featured'>): Promise<Listing> => {
    console.log('Creating listing with api call, data:', listingData);
    
    // Manually format the data to match exactly what backend expects
    const formattedData = {
      title: listingData.title,
      description: listingData.description,
      price: listingData.price,
      unit: listingData.unit,
      currency: listingData.currency,
      quantity: listingData.quantity,
      waste_type: listingData.waste_type,
      location: listingData.location,
      country: listingData.country,
      // Format dates in YYYY-MM-DD as expected by Django
      available_from: listingData.available_from,
      status: listingData.status,
      // Add a dummy seller ID - the backend will replace this with the authenticated user
      seller: 1, // This value will be ignored and replaced by the backend
    };
    
    // Add optional fields only if they exist
    if (listingData.available_until && listingData.available_until.trim() !== '') {
      // @ts-ignore
      formattedData.available_until = listingData.available_until;
    }
    
    console.log('Formatted data for API:', formattedData);
    
    try {
      const response = await api.post('/api/marketplace/listings/', formattedData);
      console.log('API response:', response);
      return response.data;
    } catch (error) {
      console.error('API error in createListing:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Request that caused error:', {
          url: '/api/marketplace/listings/',
          method: 'POST',
          data: formattedData,
          headers: error.config?.headers
        });
        
        // Log raw request data
        console.error('Request data as string:', JSON.stringify(formattedData));
      }
      throw error;
    }
  },

  // Update a listing
  updateListing: async (id: number, listingData: Partial<Listing>): Promise<Listing> => {
    console.log('Updating listing with data:', listingData);
    
    // Create a formatted data object similar to create to ensure consistency
    // For updates, we need to include the seller ID, not remove it
    const formattedData: any = {
      // Add all fields from the input data
      ...listingData,
    };
    
    // Remove fields that shouldn't be directly updated, but keep seller ID if available
    if (listingData.seller && typeof listingData.seller === 'object' && 'id' in listingData.seller) {
      // Include only the seller ID, not the full object
      formattedData.seller = listingData.seller.id;
    } else if (!formattedData.seller) {
      // If no seller provided, set a dummy one that will be overridden by the server
      formattedData.seller = 1;
    }
    
    // Handle waste_type properly - if it's an object extract the ID
    if (formattedData.waste_type && typeof formattedData.waste_type === 'object' && 'id' in formattedData.waste_type) {
      formattedData.waste_type = formattedData.waste_type.id;
    }
    
    // Clean up response fields
    delete formattedData.waste_type_name;
    delete formattedData.created_at;
    delete formattedData.updated_at;
    delete formattedData.images;
    delete formattedData.is_active; // Remove is_active as we use status instead
    
    // Ensure waste_type is properly included
    if (!formattedData.waste_type && formattedData.waste_type !== 0) {
      console.warn('No waste_type provided for update, this will likely cause an error');
    }
    
    // Format dates properly if present
    if (formattedData.available_from) {
      formattedData.available_from = formattedData.available_from;
    }
    
    if (formattedData.available_until === '') {
      // Set to null if empty string (Django handles null for optional date)
      formattedData.available_until = null;
    }
    
    console.log('Formatted update data:', formattedData);
    
    try {
      const response = await api.put(`/api/marketplace/listings/${id}/`, formattedData);
      console.log('Update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating listing:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  },

  // Delete a listing
  deleteListing: async (id: number): Promise<void> => {
    await api.delete(`/api/marketplace/listings/${id}/`);
  },

  // Upload image for a listing
  uploadListingImage: async (id: number, imageFile: File): Promise<ListingImage> => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await api.post(`/api/marketplace/listings/${id}/upload_image/`, formData, {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    return response.data;
  },
  
  // Delete an image from a listing
  deleteListingImage: async (imageId: number): Promise<void> => {
    await api.delete(`/api/marketplace/images/${imageId}/`);
  }
};

export default api; 