# AgriWaste Mock Data Generator

This command generates realistic mock data for the AgriWaste application, creating sample data for each model in the system: users, categories, waste types, resource documents, listings, orders, reviews, and messages.

## Features

- Creates realistic agricultural waste categories and types with meaningful descriptions
- Generates users with different roles (farmers, researchers, startups, industry)
- Creates resource documents linked to waste types
- Generates marketplace listings with appropriate sellers and waste types
- Creates orders, reviews, and messaging conversations
- Maintains relationships between models (e.g., only farmers can create listings, only completed orders can have reviews)

## Usage

### Install Requirements

Make sure you have the Faker library installed:

```bash
pip install faker
# Or if using pipenv
pipenv install faker
```

### Run the Command

To generate mock data with default settings:

```bash
python manage.py generate_mock_data
```

### Command Options

You can customize the amount of data to generate:

```bash
python manage.py generate_mock_data --users 30 --categories 10 --types 40 --documents 60 --listings 100 --orders 50 --reviews 40 --messages 80
```

Available options:

- `--users`: Number of users to create (default: 20)
- `--categories`: Number of waste categories to create (default: 8)
- `--types`: Number of waste types to create (default: 30)
- `--documents`: Number of resource documents to create (default: 50)
- `--listings`: Number of waste listings to create (default: 80)
- `--orders`: Number of orders to create (default: 40)
- `--reviews`: Number of reviews to create (default: 30)
- `--messages`: Number of messages to create (default: 60)
- `--clear`: Clear existing data before creating new mock data

### Examples

Clear existing data and generate a small dataset for testing:

```bash
python manage.py generate_mock_data --clear --users 10 --categories 5 --types 15 --documents 20 --listings 30 --orders 15 --reviews 10 --messages 20
```

Generate a large dataset:

```bash
python manage.py generate_mock_data --users 50 --types 80 --listings 200
```

## Notes

- The command creates mock data that has realistic relationships — for example, only farmers create listings, and listings are tied to specific waste types.
- User passwords are set to "password123" for easy testing.
- Images and files are referenced but not actually created.
- Country data is limited to Tunisia, Libya, and Algeria as per application requirements.

## Troubleshooting

### Common Issues

1. **Invalid Faker locale**: If you see an error about invalid Faker locales, the script will automatically fall back to the default locale.

2. **File field errors**: The script creates references to files (like documents and images) but doesn't create actual files. This might cause warnings but shouldn't stop the script from running.

3. **Model field mismatches**: If your model fields don't match what the script expects, it will try to adapt automatically. If a critical field is missing, the script will warn you.

4. **Database errors**: If you encounter database errors, try running with the `--clear` option to start fresh.

### Making the Script Work with Custom Models

If you've customized the models in your application, you might need to modify the script. Look for:

- The `check_model_compatibility` method checks for required fields
- Each `create_*` method has error handling to adapt to model changes
- Field names like `potential_uses` vs `potential_applications` are handled automatically

### File and Media Handling

The script assumes the existence of certain media directories. The helper shell script (`generate_mock_data.sh`) will create these directories automatically:

- `media/documents/` - For resource documents
- `media/listing_images/` - For listing images
- `media/waste_types/` - For waste type images
- `media/profile_images/` - For user profile images 