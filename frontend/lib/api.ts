import axios from 'axios';
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
      }
    }
    return config;
  },
  (error) => {
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

export default api; 