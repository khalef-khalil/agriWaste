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
        
        // Debug token for create order
        if (config.url === '/api/marketplace/orders/' && config.method === 'post') {
          console.log('Adding token to create order request:', token.substring(0, 10) + '...');
          console.log('Full headers:', config.headers);
          console.log('Request data:', JSON.stringify(config.data, null, 2));
        }
        
        // Debug token for message creation/retrieval
        if (config.url?.includes('/api/marketplace/messages') && 
            (config.method === 'post' || config.method === 'get')) {
          console.log('Adding token to message API request:', token.substring(0, 10) + '...');
          console.log('Full headers:', config.headers);
          if (config.data) {
            console.log('Message request data:', JSON.stringify(config.data, null, 2));
          }
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
  seller: UserProfile | number;
  seller_username?: string;
  location: string;
  country: string;
  status: string;
  featured: boolean;
  is_active?: boolean;
  available_from: string;
  available_until?: string;
  created_at: string;
  updated_at: string;
  images: ListingImage[];
  quantity_unit?: string;
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

// Order related interfaces
export interface Order {
  id: number;
  // These can be either numbers (IDs) or full objects
  listing: number | Listing;
  listing_details?: Listing;
  buyer: number | UserProfile;
  buyer_details?: UserProfile;
  seller: number | UserProfile;
  seller_details?: UserProfile;
  quantity: number | string;
  total_price: number;
  status: OrderStatus;
  notes?: string;
  shipping_address?: string;
  shipping_method?: string;
  payment_method?: string;
  created_at: string;
  updated_at: string;
}

export type OrderStatus = 'pending' | 'accepted' | 'rejected' | 'shipped' | 'delivered' | 'completed' | 'cancelled';

export interface CreateOrderRequest {
  listing: number;
  quantity: number;
  buyer: number;
  seller: number;
  total_price: number;
  notes?: string;
  shipping_address?: string;
  shipping_method?: string;
  payment_method?: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  notes?: string;
}

// Marketplace API - Orders
export const ordersApi = {
  // Create a new order
  createOrder: async (data: CreateOrderRequest): Promise<Order> => {
    try {
      // Validate required fields
      if (!data.buyer) {
        throw new Error('Buyer ID is required');
      }
      
      if (!data.seller) {
        throw new Error('Seller ID is required');
      }
      
      if (!data.total_price) {
        throw new Error('Total price is required');
      }
      
      console.log('Sending order data to API:', data);
      const response = await api.post('/api/marketplace/orders/', data);
      console.log('Order creation successful, response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating order:', error);
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
      }
      throw error;
    }
  },

  // Get user's orders (as buyer)
  getMyOrders: async (): Promise<PaginatedResponse<Order>> => {
    try {
      const response = await api.get('/api/marketplace/orders/my_orders/');
      return response.data;
    } catch (error) {
      console.error('Error fetching my orders:', error);
      throw error;
    }
  },

  // Get user's sales (as seller)
  getMySales: async (): Promise<PaginatedResponse<Order>> => {
    try {
      const response = await api.get('/api/marketplace/orders/my_sales/');
      return response.data;
    } catch (error) {
      console.error('Error fetching my sales:', error);
      throw error;
    }
  },

  // Get order details with retry functionality
  getOrderById: async (id: number, retryCount = 0): Promise<Order> => {
    try {
      console.log(`Fetching order with ID: ${id}${retryCount > 0 ? ` (retry ${retryCount})` : ''}`);
      const response = await api.get(`/api/marketplace/orders/${id}/`);
      
      // Debug the actual structure of the response data
      console.log(`Order ${id} response:`, response.data);
      console.log(`Order ${id} response raw structure:`, JSON.stringify(response.data));
      
      // Create a structured order object
      const orderData = response.data;
      
      // Check if listing is an object or ID and handle accordingly
      if (orderData.listing && typeof orderData.listing === 'object') {
        console.log(`Order ${id}: Listing is an object`, orderData.listing);
        // If listing is an object but listing_details isn't set, copy it
        if (!orderData.listing_details) {
          orderData.listing_details = {...orderData.listing};
          console.log(`Order ${id}: Created listing_details from listing object`);
        }
      } else {
        console.error(`Order ${id} missing listing_details`);
      }
      
      // Check if buyer is an object or ID and handle accordingly
      if (orderData.buyer && typeof orderData.buyer === 'object') {
        console.log(`Order ${id}: Buyer is an object`, orderData.buyer);
        // If buyer is an object but buyer_details isn't set, copy it
        if (!orderData.buyer_details) {
          orderData.buyer_details = {...orderData.buyer};
          console.log(`Order ${id}: Created buyer_details from buyer object`);
        }
      } else {
        console.error(`Order ${id} missing buyer_details`);
      }
      
      // Check for seller or try to extract from listing
      if (orderData.seller && typeof orderData.seller === 'object') {
        console.log(`Order ${id}: Seller is an object`, orderData.seller);
        // If seller is an object but seller_details isn't set, copy it
        if (!orderData.seller_details) {
          orderData.seller_details = {...orderData.seller};
          console.log(`Order ${id}: Created seller_details from seller object`);
        }
      } else if (orderData.listing && typeof orderData.listing === 'object' && orderData.listing.seller) {
        // Try to get seller from listing
        console.log(`Order ${id}: Extracting seller from listing`, orderData.listing.seller);
        // If seller_details isn't set, use the seller from listing
        if (!orderData.seller_details) {
          orderData.seller_details = {...orderData.listing.seller};
          orderData.seller = orderData.listing.seller.id;
          console.log(`Order ${id}: Created seller_details from listing.seller`);
        }
      } else {
        console.error(`Order ${id} missing seller_details`);
      }
      
      // If we still have missing fields and have retries left, try again
      const missingFields = [];
      if (!orderData.listing_details) missingFields.push('listing_details');
      if (!orderData.buyer_details) missingFields.push('buyer_details');
      if (!orderData.seller_details) missingFields.push('seller_details');
      
      if (missingFields.length > 0 && retryCount < 2) {
        console.log(`Retrying order ${id} fetch due to missing fields: ${missingFields.join(', ')}`);
        // Wait a moment before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
        return ordersApi.getOrderById(id, retryCount + 1);
      }
      
      return orderData;
    } catch (error) {
      console.error(`Error fetching order #${id}:`, error);
      throw error;
    }
  },

  // Update order status
  updateOrderStatus: async (id: number, data: UpdateOrderStatusRequest): Promise<Order> => {
    try {
      const response = await api.post(`/api/marketplace/orders/${id}/update_status/`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating order #${id} status:`, error);
      throw error;
    }
  },

  // Attempt to repair incomplete order data by fetching related entities
  repairOrderData: async (order: Order): Promise<Order> => {
    console.log(`Attempting to repair incomplete order data for order #${order.id}`);
    console.log(`Order structure:`, order);
    
    // Create a deep copy of the order to avoid mutating the original
    const repairedOrder = JSON.parse(JSON.stringify(order)) as Order;
    let fetchedListingDetails = null;
    
    try {
      // Normalize status if it's in uppercase
      if (repairedOrder.status && typeof repairedOrder.status === 'string') {
        const upperStatus = repairedOrder.status.toUpperCase();
        // Check if we have an uppercase status that needs conversion
        if (upperStatus === 'PENDING' || 
            upperStatus === 'ACCEPTED' || 
            upperStatus === 'REJECTED' || 
            upperStatus === 'SHIPPED' || 
            upperStatus === 'DELIVERED' || 
            upperStatus === 'COMPLETED' || 
            upperStatus === 'CANCELLED') {
          // Convert to lowercase for consistency
          repairedOrder.status = repairedOrder.status.toLowerCase() as OrderStatus;
          console.log(`Normalized order #${order.id} status from ${order.status} to ${repairedOrder.status}`);
        }
      }
      
      // Check if seller_details exists but is empty
      const sellerDetailsEmpty = 
        repairedOrder.seller_details && 
        typeof repairedOrder.seller_details === 'object' && 
        Object.keys(repairedOrder.seller_details).length === 0;
      
      // If we have no seller or empty seller_details, try to extract from other sources
      if (!repairedOrder.seller_details || sellerDetailsEmpty) {
        console.log(`Order #${order.id} is missing seller_details or has empty seller_details`);
        
        // Check if listing is already an object with properties we need
        if (typeof repairedOrder.listing === 'object' && repairedOrder.listing !== null) {
          // If listing is an object, use it as listing_details
          fetchedListingDetails = repairedOrder.listing;
          if (!repairedOrder.listing_details) {
            repairedOrder.listing_details = repairedOrder.listing;
            console.log(`Using existing listing object as listing_details for order #${order.id}`);
          }
        } 
        // If listing is an ID, try to fetch the details
        else {
          const listingId = getIdSafely(repairedOrder.listing);
          if (listingId) {
            console.log(`Fetching listing details for order #${order.id}, listing ID: ${listingId}`);
            try {
              fetchedListingDetails = await marketplaceApi.getListingById(listingId);
              repairedOrder.listing_details = fetchedListingDetails;
              console.log(`Successfully fetched listing details for order #${order.id}`);
            } catch (error) {
              console.error(`Failed to fetch listing details for order #${order.id}:`, error);
            }
          }
        }
        
        // Now that we have the listing details, try to extract seller information
        if (fetchedListingDetails || repairedOrder.listing_details) {
          const listingData = fetchedListingDetails || repairedOrder.listing_details;
          
          // If listing has seller as an object, use it
          if (listingData && typeof listingData.seller === 'object' && listingData.seller) {
            console.log(`Using seller from listing for order #${order.id}:`, listingData.seller);
            repairedOrder.seller_details = listingData.seller;
            
            // If seller is missing, set it to the seller's ID
            if (!repairedOrder.seller) {
              repairedOrder.seller = listingData.seller.id;
            }
          }
          // If listing has seller_username but not a seller object, create a basic seller object
          else if (listingData && listingData.seller_username) {
            console.log(`Creating seller from seller_username for order #${order.id}: ${listingData.seller_username}`);
            repairedOrder.seller_details = {
              id: typeof listingData.seller === 'number' ? listingData.seller : 0,
              username: listingData.seller_username,
              email: '',
              first_name: listingData.seller_username,
              last_name: '',
              user_type: 'seller',
              profile_image: ''
            };
            
            // If seller is missing, set it to the seller's ID if available
            if (!repairedOrder.seller && typeof listingData.seller === 'number') {
              repairedOrder.seller = listingData.seller;
            }
          }
        }
      }
      
      // Check if buyer_details exists but is empty
      const buyerDetailsEmpty = 
        repairedOrder.buyer_details && 
        typeof repairedOrder.buyer_details === 'object' && 
        Object.keys(repairedOrder.buyer_details).length === 0;
      
      // Handle buyer data - if buyer is an object, use it as buyer_details
      if (typeof repairedOrder.buyer === 'object' && repairedOrder.buyer !== null) {
        if (!repairedOrder.buyer_details) {
          repairedOrder.buyer_details = repairedOrder.buyer;
          console.log(`Using existing buyer object as buyer_details for order #${order.id}`);
        }
      } else {
        // For buyer ID, create a placeholder
        const buyerId = getIdSafely(repairedOrder.buyer);
        if (buyerId && !repairedOrder.buyer_details) {
          console.log(`Creating placeholder for buyer details, ID: ${buyerId}`);
          repairedOrder.buyer_details = {
            id: buyerId,
            username: `User ${buyerId}`,
            email: '',
            first_name: 'Acheteur',
            last_name: `#${buyerId}`,
            user_type: 'buyer'
          };
        }
      }
      
      console.log("Repaired order:", repairedOrder);
      return repairedOrder;
    } catch (error) {
      console.error(`Error repairing order #${order.id}:`, error);
      return order; // Return original order if repair fails
    }
  },

  // Delete an order (for maintenance/cleanup of incomplete orders)
  deleteOrder: async (id: number): Promise<void> => {
    try {
      console.log(`Deleting order with ID: ${id}`);
      await api.delete(`/api/marketplace/orders/${id}/`);
      console.log(`Successfully deleted order ${id}`);
    } catch (error) {
      console.error(`Error deleting order #${id}:`, error);
      throw error;
    }
  },
};

// Types for Reviews and Messages
export interface Review {
  id: number;
  order: number;
  reviewer: number | UserProfile;
  reviewer_details?: UserProfile;
  recipient: number | UserProfile;
  recipient_details?: UserProfile;
  rating: number;
  comment: string;
  created_at: string;
}

export interface CreateReviewRequest {
  order: number;
  rating: number;
  comment: string;
}

export interface Message {
  id: number;
  sender: number | UserProfile;
  sender_details?: UserProfile;
  recipient: number | UserProfile;
  recipient_details?: UserProfile;
  listing?: number | Listing;
  listing_details?: Listing;
  subject: string;
  content: string;
  is_read: boolean;
  created_at: string;
  parent_message?: number;
}

export interface CreateMessageRequest {
  receiver: number;
  subject: string;
  content: string;
  listing?: number;
  parent_message?: number;
}

// API functions for reviews
export const reviewsApi = {
  // Create a new review
  createReview: async (reviewData: CreateReviewRequest): Promise<Review> => {
    try {
      const response = await api.post('/api/marketplace/reviews/', reviewData);
      return response.data;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  },

  // Get reviews for a user
  getUserReviews: async (userId: number): Promise<Review[]> => {
    try {
      const response = await api.get<PaginatedResponse<Review>>(`/api/marketplace/reviews/?recipient=${userId}`);
      return response.data.results;
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      throw error;
    }
  },

  // Get reviews for a listing
  getListingReviews: async (listingId: number): Promise<Review[]> => {
    try {
      const response = await api.get<PaginatedResponse<Review>>(`/api/marketplace/reviews/?listing=${listingId}`);
      return response.data.results;
    } catch (error) {
      console.error('Error fetching listing reviews:', error);
      throw error;
    }
  }
};

// API functions for messages
export const messagesApi = {
  // Get user's messages
  getMyMessages: async (): Promise<Message[]> => {
    try {
      const response = await api.get<PaginatedResponse<Message>>('/api/marketplace/messages/my_messages/');
      return response.data.results;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },

  // Get unread messages
  getUnreadMessages: async (): Promise<Message[]> => {
    try {
      const response = await api.get<PaginatedResponse<Message>>('/api/marketplace/messages/unread/');
      return response.data.results;
    } catch (error) {
      console.error('Error fetching unread messages:', error);
      throw error;
    }
  },

  // Create a new message
  createMessage: async (messageData: CreateMessageRequest): Promise<Message> => {
    try {
      // First, verify we have a valid token
      const token = localStorage.getItem('token');
      console.log("Create Message - Auth token available:", !!token);
      if (token) {
        console.log("Create Message - Token first 10 chars:", token.substring(0, 10) + "...");
      }
      
      console.log("Create Message - Data:", JSON.stringify(messageData, null, 2));
      
      // Validate that we have required fields before sending
      if (!messageData.receiver) {
        console.error("Create Message - Error: Receiver ID is required");
        throw new Error('Receiver ID is required');
      }
      
      if (!messageData.subject || !messageData.content) {
        console.error("Create Message - Error: Subject and content are required");
        throw new Error('Subject and content are required');
      }
      
      // We're good to go, make the request
      console.log("Create Message - Making API request to create message");
      const response = await api.post('/api/marketplace/messages/', messageData);
      console.log("Create Message - Success:", response.data);
      return response.data;
    } catch (error) {
      console.error('Create Message - Error creating message:', error);
      
      // Log more details about the error for debugging
      if (axios.isAxiosError(error) && error.response) {
        console.error("Create Message - Error details:", {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        });
      }
      
      throw error;
    }
  },

  // Mark message as read
  markAsRead: async (messageId: number): Promise<Message> => {
    try {
      const response = await api.post(`/api/marketplace/messages/${messageId}/mark_as_read/`);
      return response.data;
    } catch (error) {
      console.error(`Error marking message ${messageId} as read:`, error);
      throw error;
    }
  },
  
  // Get conversation thread (all messages related to the same parent)
  getMessageThread: async (parentMessageId: number): Promise<Message[]> => {
    try {
      const response = await api.get<PaginatedResponse<Message>>(`/api/marketplace/messages/?parent_message=${parentMessageId}`);
      return response.data.results;
    } catch (error) {
      console.error('Error fetching message thread:', error);
      throw error;
    }
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
  updateListing: async (id: number, listingData: Partial<Listing> & {seller?: number}): Promise<Listing> => {
    console.log('Updating listing with data:', listingData);
    
    // Create a clean formatted data object
    const formattedData: any = {};
    
    // Explicitly copy fields we know should be included
    const fieldsToInclude = [
      'title', 'description', 'price', 'unit', 'currency', 'quantity',
      'waste_type', 'location', 'country', 'available_from', 'status',
      'available_until', 'seller'
    ];
    
    // Only include fields that are present and non-undefined
    fieldsToInclude.forEach(field => {
      if (field in listingData && listingData[field as keyof typeof listingData] !== undefined) {
        formattedData[field] = listingData[field as keyof typeof listingData];
      }
    });
    
    // Make sure waste_type is a number, not an object
    if (formattedData.waste_type && typeof formattedData.waste_type === 'object' && 'id' in formattedData.waste_type) {
      formattedData.waste_type = formattedData.waste_type.id;
    }
    
    // Ensure seller is included
    if (!formattedData.seller) {
      console.error('No seller ID provided for update. This will likely cause the backend to change ownership.');
    }
    
    // Format dates properly if present
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
  },

  ...ordersApi,
  ...reviewsApi,
  ...messagesApi,
};

export default api; 