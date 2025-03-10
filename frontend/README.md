# AgriWaste Marketplace Frontend

This is the frontend application for the AgriWaste Marketplace, a platform connecting agricultural waste producers with researchers, startups, and industries to promote sustainable solutions.

## Technologies Used

- **Next.js 14.2.16**: React framework with App Router
- **TypeScript**: For type safety
- **Tailwind CSS**: For styling
- **Framer Motion**: For animations
- **Shadcn UI**: For UI components
- **Zod**: For form validation
- **Axios**: For API requests
- **JWT Authentication**: For secure user authentication

## Features Implemented (Phase 1)

- **Authentication System**
  - JWT-based authentication
  - Login and registration forms
  - Protected routes
  - User session management

- **User Management**
  - User registration with different user types (Farmer, Researcher, Startup, Industry)
  - User profile management
  - Profile editing

- **Modern UI/UX**
  - Responsive design for all screen sizes
  - Framer Motion animations
  - Custom color scheme with complementary colors
  - Dark/light mode support

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd agriwaste/frontend
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up environment variables
Create a `.env.local` file in the root directory with the following variables:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

4. Run the development server
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

- `/app`: Next.js App Router pages
- `/components`: Reusable UI components
  - `/auth`: Authentication-related components
  - `/layout`: Layout components (Header, Footer, etc.)
  - `/ui`: UI components from shadcn/ui
- `/lib`: Utility functions and hooks
- `/public`: Static assets

## Backend API Integration

This frontend connects to the AgriWaste backend API. The following endpoints are used in Phase 1:

- `POST /api-token-auth/`: Get authentication token
- `POST /api/users/`: Register a new user
- `GET /api/users/me/`: Get current user profile
- `PUT /api/users/update_me/`: Update current user profile

## Next Steps

Future phases will implement:
- Waste catalog browsing
- Marketplace listings
- User listings management
- Orders and transactions
- Reviews and messaging
- Analytics and advanced features

## License

[MIT](LICENSE)
