# AgriWaste Marketplace Backend

Backend API for the AgriWaste Marketplace platform - A marketplace for agricultural waste where farmers can sell waste products to researchers, startups, and industries interested in sustainable economy solutions. The platform operates in Tunisia, Libya, and Algeria with country-specific marketplaces.

## Features

- User management with different roles (Farmer, Researcher, Startup, Industry)
- Waste catalog with categories, types, and resource documents
- Country-specific marketplaces (Tunisia, Libya, Algeria)
- Marketplace with listings, orders, reviews, and messaging
- REST API with public and authenticated endpoints
- Admin interface for data management
- Optimized database queries with proper ordering and related data fetching

## Technology Stack

- Django 5.1+
- Django REST Framework
- PostgreSQL (configured for development with SQLite)
- Pipenv for dependency management

## Mock Data Generation

For development and testing purposes, the project includes a mock data generator that can create realistic sample data for all models in the system.

### Using the Mock Data Generator

You can generate mock data using the provided shell script:

```bash
# From the backend directory
./generate_mock_data.sh
```

Or directly using Django's management command:

```bash
# Using pipenv
pipenv run python manage.py generate_mock_data

# Or without pipenv
python manage.py generate_mock_data
```

### Customizing the Mock Data

You can customize the amount and type of data generated:

```bash
./generate_mock_data.sh --users 30 --categories 10 --types 40 --listings 100 --clear
```

See the full documentation in `waste_catalog/management/commands/README.md` for more details.

## Performance Optimizations

- Default ordering on all model querysets
- Optimized database queries using select_related and prefetch_related
- Efficient filtering for country-specific listings
- Cache-friendly model structure

## Getting Started

### Prerequisites

- Python 3.8+
- Pipenv

### Installation

1. Clone the repository and navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
pipenv install
```

3. Activate the virtual environment:

```bash
pipenv shell
```

4. Run migrations:

```bash
python manage.py migrate
```

5. Create a superuser:

```bash
python manage.py createsuperuser
```

6. Run the development server:

```bash
python manage.py runserver
```

The API will be available at http://localhost:8000/

## API Endpoints

### Authentication
- `POST /api-token-auth/`: Get authentication token

### Users (Authentication Required)
- `GET /api/users/me/`: Get current user profile
- `PUT /api/users/update_me/`: Update current user profile
- `POST /api/users/`: Register a new user

### Waste Catalog (Public Access)
- `GET /api/waste-catalog/categories/`: List all waste categories
- `GET /api/waste-catalog/types/`: List all waste types
- `GET /api/waste-catalog/types/{id}/`: Get waste type details
- `GET /api/waste-catalog/types/by_category/?category_id={id}`: Get waste types by category
- `GET /api/waste-catalog/documents/`: List all resource documents

### Marketplace
- `GET /api/marketplace/listings/`: List all waste listings (Public)
- `GET /api/marketplace/listings/active/`: List active waste listings (Public)
- `GET /api/marketplace/listings/by_country/?country=TN`: List listings by country (Public)
- `GET /api/marketplace/listings/my_listings/`: List user's listings (Auth required)
- `POST /api/marketplace/listings/`: Create a new listing (Auth required)
- `GET /api/marketplace/orders/my_orders/`: List user's orders (Auth required)
- `GET /api/marketplace/orders/my_sales/`: List user's sales (Auth required)
- `POST /api/marketplace/orders/`: Create a new order (Auth required)
- `POST /api/marketplace/reviews/`: Create a review (Auth required)
- `GET /api/marketplace/messages/my_messages/`: List user's messages (Auth required)
- `GET /api/marketplace/messages/unread/`: List unread messages (Auth required)

### Country Codes
- Tunisia: `TN`
- Libya: `LY`
- Algeria: `DZ`

## Testing

The backend includes a comprehensive test script that validates all API endpoints and functionality:

```bash
pipenv run python test_api.py
```

The test script verifies:
- Authentication and user management
- Waste catalog browsing (public and authenticated)
- Country-specific marketplace filtering
- Orders, reviews and messaging
- API performance with optimized queries

## License

MIT 