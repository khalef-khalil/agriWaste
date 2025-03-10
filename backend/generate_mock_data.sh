#!/bin/bash

echo "AgriWaste Mock Data Generator"
echo "============================"
echo

# Create the media directory if it doesn't exist
if [ ! -d "media/documents" ]; then
    echo "Creating media directories..."
    mkdir -p media/documents
    mkdir -p media/listing_images
    mkdir -p media/waste_types
    mkdir -p media/profile_images
fi

# Check if pipenv is installed
if command -v pipenv &> /dev/null; then
    echo "Installing required packages..."
    pipenv install faker
    
    echo "Running mock data generator..."
    echo "Note: The script will create references to files but not actual files."
    echo "You may see warnings about missing files - this is expected."
    echo
    pipenv run python manage.py generate_mock_data "$@"
else
    # Fall back to pip if pipenv is not available
    echo "Installing required packages..."
    pip install faker
    
    echo "Running mock data generator..."
    echo "Note: The script will create references to files but not actual files."
    echo "You may see warnings about missing files - this is expected."
    echo
    python manage.py generate_mock_data "$@"
fi

if [ $? -eq 0 ]; then
    echo
    echo "✅ Mock data generation completed!"
    echo
    echo "Notes:"
    echo "- All generated user accounts have password 'password123'"
    echo "- If you need to clear the data and start fresh, use --clear option"
    echo "- For more detailed information, see waste_catalog/management/commands/README.md"
else
    echo
    echo "❌ Mock data generation encountered errors."
    echo "You may need to adjust the parameters or check the models in your application."
fi 