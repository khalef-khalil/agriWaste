#!/usr/bin/env python
"""
AgriWaste Marketplace API Test Script
-------------------------------------
This script tests all API endpoints of the AgriWaste Marketplace backend.
It covers authentication, user management, waste catalog, and marketplace features.

Usage:
    pipenv run python test_api.py

Requirements:
    - requests library (pip install requests)
    - A running instance of the AgriWaste Marketplace backend
"""

import requests
import json
import time
import os
import random
import string
from datetime import date, timedelta

# Configuration
BASE_URL = "http://localhost:8000"
ADMIN_USER = {"username": "admin", "password": "admin"}
VERBOSE = True  # Set to True for detailed logging

# Country choices for marketplace
COUNTRY_CHOICES = (
    ('TN', 'Tunisia'),
    ('LY', 'Libya'),
    ('DZ', 'Algeria'),
)

# Generate unique usernames for testing
def generate_random_string(length=5):
    """Generate a random string of fixed length"""
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

# Generate random usernames
random_suffix = generate_random_string()
TEST_FARMER = {
    "username": f"farmer_{random_suffix}", 
    "email": f"farmer_{random_suffix}@example.com", 
    "password": "securepass123", 
    "first_name": "John", 
    "last_name": "Farmer"
}
TEST_RESEARCHER = {
    "username": f"researcher_{random_suffix}", 
    "email": f"researcher_{random_suffix}@example.com", 
    "password": "securepass123", 
    "first_name": "Jane", 
    "last_name": "Researcher"
}

# Utility functions
def log(message):
    """Print message if verbose mode is enabled"""
    if VERBOSE:
        print(message)

def pretty_print_json(data):
    """Pretty print JSON data"""
    if VERBOSE:
        print(json.dumps(data, indent=4))

def assert_status_code(response, expected_code):
    """Assert that the response has the expected status code"""
    if response.status_code != expected_code:
        print(f"ERROR: Expected status code {expected_code}, got {response.status_code}")
        pretty_print_json(response.json())
        return False
    return True

class APITester:
    def __init__(self):
        self.tokens = {}
        self.user_ids = {}
        self.waste_category_id = None
        self.waste_type_id = None
        self.document_id = None
        self.listing_id = None
        self.order_id = None
        self.message_id = None
        self.review_id = None

    def run_all_tests(self):
        """Run all tests in sequence"""
        success = True
        
        # Authentication and user tests
        success = success and self.test_admin_login()
        success = success and self.test_user_registration()
        success = success and self.test_user_login()
        success = success and self.test_get_user_profile()
        success = success and self.test_update_user_profile()
        
        # Waste catalog tests
        success = success and self.test_create_waste_category()
        success = success and self.test_list_waste_categories()
        success = success and self.test_create_waste_type()
        success = success and self.test_list_waste_types()
        success = success and self.test_get_waste_type_detail()
        success = success and self.test_waste_types_by_category()
        
        # Test public access to catalog without auth
        success = success and self.test_public_access_to_catalog()
        
        # Continue with authenticated operations
        success = success and self.test_create_resource_document()
        success = success and self.test_list_resource_documents()
        
        # Marketplace tests
        # Test country-specific listings
        success = success and self.test_multiple_country_listings()
        
        # Test public access to marketplace without auth
        success = success and self.test_public_access_to_marketplace()
        
        # Continue with authenticated marketplace operations
        success = success and self.test_list_waste_listings()
        success = success and self.test_get_active_listings()
        success = success and self.test_get_my_listings()
        success = success and self.test_create_order()
        success = success and self.test_get_my_orders()
        success = success and self.test_get_my_sales()
        success = success and self.test_update_order_status()
        success = success and self.test_create_review()
        success = success and self.test_create_message()
        success = success and self.test_get_my_messages()
        success = success and self.test_get_unread_messages()
        success = success and self.test_mark_message_as_read()
        
        # Cleanup tests
        success = success and self.test_delete_listing()
        success = success and self.test_delete_waste_type()
        success = success and self.test_delete_waste_category()
        
        # Performance tests
        success = success and self.test_api_performance()
        
        if success:
            print("\n✅ All tests passed successfully!")
        else:
            print("\n❌ Some tests failed. Check the logs for details.")
        
        return success
    
    # Authentication Tests
    def test_admin_login(self):
        """Test admin login and token retrieval"""
        log("\n🔑 Testing admin login...")
        
        url = f"{BASE_URL}/api-token-auth/"
        response = requests.post(url, data=ADMIN_USER)
        
        if not assert_status_code(response, 200):
            return False
        
        data = response.json()
        if 'token' not in data:
            log("ERROR: No token in response")
            return False
        
        self.tokens['admin'] = data['token']
        log("✅ Admin login successful")
        return True
    
    def test_user_registration(self):
        """Test user registration"""
        log("\n👤 Testing user registration...")
        
        # Register a farmer
        url = f"{BASE_URL}/api/users/"
        
        # Create farmer profile data
        farmer_data = TEST_FARMER.copy()
        farmer_data['profile'] = {
            'user_type': 'FARMER',
            'organization': 'Green Farms Inc.',
            'bio': 'Organic farmer with 10 years of experience',
            'address': '123 Farm Road, Countryside',
            'phone_number': '+1234567890'
        }
        
        response = requests.post(url, json=farmer_data)
        if not assert_status_code(response, 201):
            return False
        
        data = response.json()
        self.user_ids['farmer'] = data['id']
        log("✅ Farmer registered successfully")
        
        # Register a researcher
        researcher_data = TEST_RESEARCHER.copy()
        researcher_data['profile'] = {
            'user_type': 'RESEARCHER',
            'organization': 'Science University',
            'bio': 'Researching sustainable waste management',
            'address': '456 Lab Avenue, Scienceville',
            'phone_number': '+1987654321'
        }
        
        response = requests.post(url, json=researcher_data)
        if not assert_status_code(response, 201):
            return False
        
        data = response.json()
        self.user_ids['researcher'] = data['id']
        log("✅ Researcher registered successfully")
        
        return True
    
    def test_user_login(self):
        """Test user login"""
        log("\n🔑 Testing user login...")
        
        url = f"{BASE_URL}/api-token-auth/"
        
        # Farmer login
        response = requests.post(url, data={
            'username': TEST_FARMER['username'],
            'password': TEST_FARMER['password']
        })
        
        if not assert_status_code(response, 200):
            return False
        
        data = response.json()
        if 'token' not in data:
            log("ERROR: No token in response")
            return False
        
        self.tokens['farmer'] = data['token']
        log("✅ Farmer login successful")
        
        # Researcher login
        response = requests.post(url, data={
            'username': TEST_RESEARCHER['username'],
            'password': TEST_RESEARCHER['password']
        })
        
        if not assert_status_code(response, 200):
            return False
        
        data = response.json()
        if 'token' not in data:
            log("ERROR: No token in response")
            return False
        
        self.tokens['researcher'] = data['token']
        log("✅ Researcher login successful")
        
        return True
    
    def test_get_user_profile(self):
        """Test getting user profile"""
        log("\n👤 Testing get user profile...")
        
        url = f"{BASE_URL}/api/users/me/"
        headers = {'Authorization': f"Token {self.tokens['farmer']}"}
        
        response = requests.get(url, headers=headers)
        if not assert_status_code(response, 200):
            return False
        
        data = response.json()
        if data['username'] != TEST_FARMER['username']:
            log(f"ERROR: Wrong username, got {data['username']}")
            return False
        
        log("✅ Get user profile successful")
        return True
    
    def test_update_user_profile(self):
        """Test updating user profile"""
        log("\n✏️ Testing update user profile...")
        
        url = f"{BASE_URL}/api/users/update_me/"
        headers = {'Authorization': f"Token {self.tokens['farmer']}"}
        
        profile_data = {
            'first_name': 'Updated',
            'last_name': 'Farmer',
            'email': TEST_FARMER['email'],
            'profile': {
                'user_type': 'FARMER',
                'organization': 'Updated Farms Inc.',
                'bio': 'Updated bio',
                'address': 'Updated address',
                'phone_number': '+9876543210',
                'country': 'TN'  # Add Tunisia as country
            }
        }
        
        response = requests.put(url, json=profile_data, headers=headers)
        if not assert_status_code(response, 200):
            return False
        
        data = response.json()
        if data['first_name'] != 'Updated':
            log(f"ERROR: First name not updated, got {data['first_name']}")
            return False
            
        # Verify country field is updated correctly
        if data['profile']['country'] != 'TN':
            log(f"ERROR: Country not updated, got {data['profile'].get('country', 'None')}")
            return False
            
        log("✅ Profile country updated to Tunisia successfully")
        
        # Test changing to a different country
        profile_data['profile']['country'] = 'DZ'  # Change to Algeria
        
        response = requests.put(url, json=profile_data, headers=headers)
        if not assert_status_code(response, 200):
            return False
            
        data = response.json()
        if data['profile']['country'] != 'DZ':
            log(f"ERROR: Country not updated to Algeria, got {data['profile'].get('country', 'None')}")
            return False
            
        log("✅ Profile country updated to Algeria successfully")
        
        log("✅ Update user profile successful")
        return True
    
    # Waste Catalog Tests
    def test_create_waste_category(self):
        """Test creating a waste category (admin only)"""
        log("\n🗂️ Testing create waste category...")
        
        url = f"{BASE_URL}/api/waste-catalog/categories/"
        headers = {'Authorization': f"Token {self.tokens['admin']}"}
        
        category_data = {
            'name': 'Crop Residues',
            'description': 'Agricultural residues from crop harvesting and processing'
        }
        
        response = requests.post(url, json=category_data, headers=headers)
        if not assert_status_code(response, 201):
            return False
        
        data = response.json()
        self.waste_category_id = data['id']
        log(f"✅ Waste category created with ID: {self.waste_category_id}")
        return True
    
    def test_list_waste_categories(self):
        """Test listing waste categories"""
        log("\n📋 Testing list waste categories...")
        
        url = f"{BASE_URL}/api/waste-catalog/categories/"
        headers = {'Authorization': f"Token {self.tokens['farmer']}"}
        
        response = requests.get(url, headers=headers)
        if not assert_status_code(response, 200):
            return False
        
        data = response.json()
        if not isinstance(data['results'], list):
            log("ERROR: Expected a list of categories")
            return False
        
        log(f"✅ Listed {len(data['results'])} waste categories")
        return True
    
    def test_create_waste_type(self):
        """Test creating a waste type (admin only)"""
        log("\n🌱 Testing create waste type...")
        
        url = f"{BASE_URL}/api/waste-catalog/types/"
        headers = {'Authorization': f"Token {self.tokens['admin']}"}
        
        waste_type_data = {
            'category': self.waste_category_id,
            'name': 'Corn Stalks',
            'description': 'Leftover corn stalks after harvesting',
            'potential_uses': 'Biofuel production, animal bedding, mulch',
            'sustainability_score': 8.5
        }
        
        response = requests.post(url, json=waste_type_data, headers=headers)
        if not assert_status_code(response, 201):
            return False
        
        data = response.json()
        self.waste_type_id = data['id']
        log(f"✅ Waste type created with ID: {self.waste_type_id}")
        return True
    
    def test_list_waste_types(self):
        """Test listing waste types"""
        log("\n📋 Testing list waste types...")
        
        url = f"{BASE_URL}/api/waste-catalog/types/"
        headers = {'Authorization': f"Token {self.tokens['researcher']}"}
        
        response = requests.get(url, headers=headers)
        if not assert_status_code(response, 200):
            return False
        
        data = response.json()
        if not isinstance(data['results'], list):
            log("ERROR: Expected a list of waste types")
            return False
        
        log(f"✅ Listed {len(data['results'])} waste types")
        return True
    
    def test_get_waste_type_detail(self):
        """Test getting waste type details"""
        log("\n🔍 Testing get waste type detail...")
        
        url = f"{BASE_URL}/api/waste-catalog/types/{self.waste_type_id}/"
        headers = {'Authorization': f"Token {self.tokens['researcher']}"}
        
        response = requests.get(url, headers=headers)
        if not assert_status_code(response, 200):
            return False
        
        data = response.json()
        if data['id'] != self.waste_type_id:
            log(f"ERROR: Wrong waste type ID, got {data['id']}")
            return False
        
        log("✅ Get waste type detail successful")
        return True
    
    def test_waste_types_by_category(self):
        """Test getting waste types by category"""
        log("\n🔍 Testing get waste types by category...")
        
        url = f"{BASE_URL}/api/waste-catalog/types/by_category/?category_id={self.waste_category_id}"
        headers = {'Authorization': f"Token {self.tokens['researcher']}"}
        
        response = requests.get(url, headers=headers)
        if not assert_status_code(response, 200):
            return False
        
        data = response.json()
        if not isinstance(data, list):
            log("ERROR: Expected a list of waste types")
            return False
        
        log(f"✅ Listed {len(data)} waste types for category")
        return True
    
    def test_create_resource_document(self):
        """Test creating a resource document (admin only)"""
        log("\n📄 Testing create resource document...")
        
        url = f"{BASE_URL}/api/waste-catalog/documents/"
        headers = {'Authorization': f"Token {self.tokens['admin']}"}
        
        # Create a temporary file for testing
        test_file = "test_document.txt"
        with open(test_file, "w") as f:
            f.write("This is a test document for the AgriWaste API tests.")
        
        document_data = {
            'waste_type': self.waste_type_id,
            'title': 'Corn Stalks Usage Guide',
            'document_type': 'GUIDE',
            'author': 'Dr. Agri Researcher',
            'publication_date': date.today().isoformat(),
            'description': 'A comprehensive guide on using corn stalks'
        }
        
        files = {
            'file': open(test_file, 'rb')
        }
        
        response = requests.post(url, data=document_data, files=files, headers=headers)
        
        # Clean up the test file
        if os.path.exists(test_file):
            os.remove(test_file)
        
        if not assert_status_code(response, 201):
            return False
        
        data = response.json()
        self.document_id = data['id']
        log(f"✅ Resource document created with ID: {self.document_id}")
        return True
    
    def test_list_resource_documents(self):
        """Test listing resource documents"""
        log("\n📋 Testing list resource documents...")
        
        url = f"{BASE_URL}/api/waste-catalog/documents/"
        headers = {'Authorization': f"Token {self.tokens['researcher']}"}
        
        response = requests.get(url, headers=headers)
        if not assert_status_code(response, 200):
            return False
        
        data = response.json()
        if not isinstance(data['results'], list):
            log("ERROR: Expected a list of documents")
            return False
        
        log(f"✅ Listed {len(data['results'])} resource documents")
        return True
    
    # Marketplace Tests
    def test_create_waste_listing(self):
        """Test creating a waste listing"""
        log("\n🏷️ Testing create waste listing...")
        
        url = f"{BASE_URL}/api/marketplace/listings/"
        headers = {'Authorization': f"Token {self.tokens['farmer']}"}
        
        # Get the farmer's user ID
        farmer_user_id = self.user_ids['farmer']
        
        listing_data = {
            'waste_type': self.waste_type_id,
            'seller': farmer_user_id,  # Add the seller ID explicitly
            'title': 'Fresh Corn Stalks Available',
            'description': 'High quality corn stalks from recent harvest',
            'quantity': 500,
            'unit': 'KG',
            'price': 150,
            'location': 'Farmville, USA',
            'country': 'TN',  # Add Tunisia as the country
            'available_from': date.today().isoformat(),
            'available_until': (date.today() + timedelta(days=30)).isoformat()
        }
        
        response = requests.post(url, json=listing_data, headers=headers)
        if not assert_status_code(response, 201):
            return False
        
        data = response.json()
        self.listing_id = data['id']
        log(f"✅ Waste listing created with ID: {self.listing_id}")
        return True
    
    def test_list_waste_listings(self):
        """Test listing waste listings"""
        log("\n📋 Testing list waste listings...")
        
        url = f"{BASE_URL}/api/marketplace/listings/"
        headers = {'Authorization': f"Token {self.tokens['researcher']}"}
        
        response = requests.get(url, headers=headers)
        if not assert_status_code(response, 200):
            return False
        
        data = response.json()
        if not isinstance(data['results'], list):
            log("ERROR: Expected a list of listings")
            return False
        
        log(f"✅ Listed {len(data['results'])} waste listings")
        return True
    
    def test_get_active_listings(self):
        """Test getting active listings"""
        log("\n🔍 Testing get active listings...")
        
        url = f"{BASE_URL}/api/marketplace/listings/active/"
        headers = {'Authorization': f"Token {self.tokens['researcher']}"}
        
        response = requests.get(url, headers=headers)
        if not assert_status_code(response, 200):
            return False
        
        data = response.json()
        if not isinstance(data['results'], list):
            log("ERROR: Expected a list of active listings")
            return False
        
        log(f"✅ Listed {len(data['results'])} active listings")
        return True
    
    def test_get_my_listings(self):
        """Test getting user's listings"""
        log("\n🔍 Testing get my listings...")
        
        url = f"{BASE_URL}/api/marketplace/listings/my_listings/"
        headers = {'Authorization': f"Token {self.tokens['farmer']}"}
        
        response = requests.get(url, headers=headers)
        if not assert_status_code(response, 200):
            return False
        
        data = response.json()
        if not isinstance(data['results'], list):
            log("ERROR: Expected a list of my listings")
            return False
        
        log(f"✅ Listed {len(data['results'])} of my listings")
        return True
    
    def test_create_order(self):
        """Test creating an order"""
        log("\n🛒 Testing create order...")
        
        url = f"{BASE_URL}/api/marketplace/orders/"
        headers = {'Authorization': f"Token {self.tokens['researcher']}"}
        
        # Get listing details to calculate price
        listing_url = f"{BASE_URL}/api/marketplace/listings/{self.listing_id}/"
        listing_response = requests.get(listing_url, headers=headers)
        if not assert_status_code(listing_response, 200):
            return False
        
        listing_data = listing_response.json()
        quantity = 100
        total_price = quantity * float(listing_data['price'])
        
        order_data = {
            'listing': self.listing_id,
            'buyer': self.user_ids['researcher'],  # Add buyer explicitly
            'quantity': quantity,
            'total_price': total_price,  # Add total price explicitly
            'shipping_address': '456 Lab Avenue, Scienceville'
        }
        
        response = requests.post(url, json=order_data, headers=headers)
        if not assert_status_code(response, 201):
            return False
        
        data = response.json()
        self.order_id = data['id']
        log(f"✅ Order created with ID: {self.order_id}")
        return True
    
    def test_get_my_orders(self):
        """Test getting user's orders"""
        log("\n🔍 Testing get my orders...")
        
        url = f"{BASE_URL}/api/marketplace/orders/my_orders/"
        headers = {'Authorization': f"Token {self.tokens['researcher']}"}
        
        response = requests.get(url, headers=headers)
        if not assert_status_code(response, 200):
            return False
        
        data = response.json()
        if not isinstance(data['results'], list):
            log("ERROR: Expected a list of my orders")
            return False
        
        log(f"✅ Listed {len(data['results'])} of my orders")
        return True
    
    def test_get_my_sales(self):
        """Test getting user's sales"""
        log("\n🔍 Testing get my sales...")
        
        url = f"{BASE_URL}/api/marketplace/orders/my_sales/"
        headers = {'Authorization': f"Token {self.tokens['farmer']}"}
        
        response = requests.get(url, headers=headers)
        if not assert_status_code(response, 200):
            return False
        
        data = response.json()
        if not isinstance(data['results'], list):
            log("ERROR: Expected a list of my sales")
            return False
        
        log(f"✅ Listed {len(data['results'])} of my sales")
        return True
    
    def test_update_order_status(self):
        """Test updating order status"""
        log("\n✏️ Testing update order status...")
        
        url = f"{BASE_URL}/api/marketplace/orders/{self.order_id}/update_status/"
        headers = {'Authorization': f"Token {self.tokens['farmer']}"}
        
        status_data = {
            'status': 'ACCEPTED'
        }
        
        response = requests.post(url, json=status_data, headers=headers)
        if not assert_status_code(response, 200):
            return False
        
        data = response.json()
        if data['status'] != 'ACCEPTED':
            log(f"ERROR: Status not updated, got {data['status']}")
            return False
        
        # Change to completed for the review test
        status_data = {
            'status': 'COMPLETED'
        }
        
        response = requests.post(url, json=status_data, headers=headers)
        if not assert_status_code(response, 200):
            return False
        
        log("✅ Order status updated successfully")
        return True
    
    def test_create_review(self):
        """Test creating a review"""
        log("\n⭐ Testing create review...")
        
        url = f"{BASE_URL}/api/marketplace/reviews/"
        headers = {'Authorization': f"Token {self.tokens['researcher']}"}
        
        review_data = {
            'order_id': self.order_id,
            'rating': 5,
            'comment': 'Excellent quality corn stalks, fast delivery!'
        }
        
        response = requests.post(url, json=review_data, headers=headers)
        if not assert_status_code(response, 201):
            return False
        
        data = response.json()
        self.review_id = data['id']
        log(f"✅ Review created with ID: {self.review_id}")
        return True
    
    def test_create_message(self):
        """Test creating a message"""
        log("\n✉️ Testing create message...")
        
        url = f"{BASE_URL}/api/marketplace/messages/"
        headers = {'Authorization': f"Token {self.tokens['researcher']}"}
        
        # Use the IDs directly from self.user_ids
        researcher_id = self.user_ids['researcher']
        farmer_id = self.user_ids['farmer']
        
        message_data = {
            'sender': researcher_id,  # Add the sender ID explicitly
            'receiver': farmer_id,
            'listing': self.listing_id,
            'subject': 'Question about corn stalks',
            'content': 'Are these stalks suitable for research purposes?'
        }
        
        response = requests.post(url, json=message_data, headers=headers)
        if not assert_status_code(response, 201):
            return False
        
        data = response.json()
        self.message_id = data['id']
        log(f"✅ Message created with ID: {self.message_id}")
        return True
    
    def test_get_my_messages(self):
        """Test getting user's messages"""
        log("\n🔍 Testing get my messages...")
        
        url = f"{BASE_URL}/api/marketplace/messages/my_messages/"
        headers = {'Authorization': f"Token {self.tokens['farmer']}"}
        
        response = requests.get(url, headers=headers)
        if not assert_status_code(response, 200):
            return False
        
        data = response.json()
        if not isinstance(data['results'], list):
            log("ERROR: Expected a list of my messages")
            return False
        
        log(f"✅ Listed {len(data['results'])} of my messages")
        return True
    
    def test_get_unread_messages(self):
        """Test getting unread messages"""
        log("\n🔍 Testing get unread messages...")
        
        url = f"{BASE_URL}/api/marketplace/messages/unread/"
        headers = {'Authorization': f"Token {self.tokens['farmer']}"}
        
        response = requests.get(url, headers=headers)
        if not assert_status_code(response, 200):
            return False
        
        data = response.json()
        if not isinstance(data['results'], list):
            log("ERROR: Expected a list of unread messages")
            return False
        
        log(f"✅ Listed {len(data['results'])} unread messages")
        return True
    
    def test_mark_message_as_read(self):
        """Test marking a message as read"""
        log("\n✅ Testing mark message as read...")
        
        url = f"{BASE_URL}/api/marketplace/messages/{self.message_id}/mark_as_read/"
        headers = {'Authorization': f"Token {self.tokens['farmer']}"}
        
        response = requests.post(url, headers=headers)
        if not assert_status_code(response, 200):
            return False
        
        data = response.json()
        if not data['read']:
            log("ERROR: Message not marked as read")
            return False
        
        log("✅ Message marked as read successfully")
        return True
    
    # Cleanup Tests
    def test_delete_listing(self):
        """Test deleting a listing"""
        log("\n🗑️ Testing delete listing...")
        
        url = f"{BASE_URL}/api/marketplace/listings/{self.listing_id}/"
        headers = {'Authorization': f"Token {self.tokens['farmer']}"}
        
        response = requests.delete(url, headers=headers)
        if not assert_status_code(response, 204):
            return False
        
        log("✅ Listing deleted successfully")
        return True
    
    def test_delete_waste_type(self):
        """Test deleting a waste type (admin only)"""
        log("\n🗑️ Testing delete waste type...")
        
        url = f"{BASE_URL}/api/waste-catalog/types/{self.waste_type_id}/"
        headers = {'Authorization': f"Token {self.tokens['admin']}"}
        
        response = requests.delete(url, headers=headers)
        if not assert_status_code(response, 204):
            return False
        
        log("✅ Waste type deleted successfully")
        return True
    
    def test_delete_waste_category(self):
        """Test deleting a waste category (admin only)"""
        log("\n🗑️ Testing delete waste category...")
        
        url = f"{BASE_URL}/api/waste-catalog/categories/{self.waste_category_id}/"
        headers = {'Authorization': f"Token {self.tokens['admin']}"}
        
        response = requests.delete(url, headers=headers)
        if not assert_status_code(response, 204):
            return False
        
        log("✅ Waste category deleted successfully")
        return True
    
    def test_public_access_to_catalog(self):
        """Test public access to catalog endpoints without authentication"""
        log("\n🔍 Testing public access to catalog...")
        
        # Test waste categories
        url = f"{BASE_URL}/api/waste-catalog/categories/"
        response = requests.get(url)
        if not assert_status_code(response, 200):
            return False
        log("✅ Public access to waste categories successful")
        
        # Test waste types
        url = f"{BASE_URL}/api/waste-catalog/types/"
        response = requests.get(url)
        if not assert_status_code(response, 200):
            return False
        log("✅ Public access to waste types successful")
        
        # Test waste type detail
        if self.waste_type_id:
            url = f"{BASE_URL}/api/waste-catalog/types/{self.waste_type_id}/"
            response = requests.get(url)
            if not assert_status_code(response, 200):
                return False
            log("✅ Public access to waste type detail successful")
        
        # Test waste types by category
        if self.waste_category_id:
            url = f"{BASE_URL}/api/waste-catalog/types/by_category/?category_id={self.waste_category_id}"
            response = requests.get(url)
            if not assert_status_code(response, 200):
                return False
            log("✅ Public access to waste types by category successful")
        
        return True
    
    def test_public_access_to_marketplace(self):
        """Test public access to marketplace endpoints without authentication"""
        log("\n🔍 Testing public access to marketplace...")
        
        # Test marketplace listings
        url = f"{BASE_URL}/api/marketplace/listings/"
        response = requests.get(url)
        if not assert_status_code(response, 200):
            return False
        log("✅ Public access to marketplace listings successful")
        
        # Test active listings
        url = f"{BASE_URL}/api/marketplace/listings/active/"
        response = requests.get(url)
        if not assert_status_code(response, 200):
            return False
        log("✅ Public access to active listings successful")
        
        # Test listings by country
        url = f"{BASE_URL}/api/marketplace/listings/by_country/?country=TN"
        response = requests.get(url)
        if not assert_status_code(response, 200):
            return False
        log("✅ Public access to listings by country successful")
        
        return True
    
    def test_multiple_country_listings(self):
        """Test creating and filtering listings for different countries"""
        log("\n🌍 Testing multiple country listings...")
        
        if not self.user_ids.get('farmer') or not self.waste_type_id:
            log("ERROR: Missing required farmer ID or waste type ID")
            return False
        
        # Create listings for different countries
        headers = {'Authorization': f"Token {self.tokens['farmer']}"}
        farmer_id = self.user_ids['farmer']
        
        countries = [
            ('TN', 'Tunisia Corn Stalks'),
            ('LY', 'Libya Olive Waste'),
            ('DZ', 'Algeria Date Palm Residue')
        ]
        
        country_listing_ids = {}
        
        for country_code, title in countries:
            country_name = dict(COUNTRY_CHOICES).get(country_code)
            listing_data = {
                'waste_type': self.waste_type_id,
                'seller': farmer_id,
                'title': title,
                'description': f'Agricultural waste from {country_name}',
                'quantity': 500,
                'unit': 'KG',
                'price': 150,
                'location': f'City in {country_name}',
                'country': country_code,
                'available_from': date.today().isoformat(),
                'available_until': (date.today() + timedelta(days=30)).isoformat()
            }
            
            url = f"{BASE_URL}/api/marketplace/listings/"
            response = requests.post(url, json=listing_data, headers=headers)
            if not assert_status_code(response, 201):
                return False
            
            data = response.json()
            country_listing_ids[country_code] = data['id']
            log(f"✅ Created listing for {country_name} with ID: {data['id']}")
        
        # Test filtering by each country
        for country_code, country_name in COUNTRY_CHOICES:
            url = f"{BASE_URL}/api/marketplace/listings/by_country/?country={country_code}"
            response = requests.get(url)
            if not assert_status_code(response, 200):
                return False
                
            data = response.json()
            if isinstance(data, dict) and 'results' in data:
                listings = data['results']
            else:
                listings = data
                
            country_listings = [l for l in listings if l.get('country') == country_code]
            log(f"✅ Found {len(country_listings)} listings for {dict(COUNTRY_CHOICES).get(country_code)}")
        
        # Save a listing ID for later use
        if country_listing_ids.get('TN'):
            self.listing_id = country_listing_ids['TN']
        
        return True
    
    def test_api_performance(self):
        """Test API performance with optimized queries"""
        log("\n⏱️ Testing API performance with optimized queries...")
        
        # Test listing with multiple countries
        start_time = time.time()
        url = f"{BASE_URL}/api/marketplace/listings/"
        headers = {'Authorization': f"Token {self.tokens['farmer']}"}
        response = requests.get(url, headers=headers)
        if not assert_status_code(response, 200):
            return False
        listing_time = time.time() - start_time
        log(f"✅ Got listings in {listing_time:.4f} seconds")
        
        # Test waste types with category inclusion
        start_time = time.time()
        url = f"{BASE_URL}/api/waste-catalog/types/"
        headers = {'Authorization': f"Token {self.tokens['researcher']}"}
        response = requests.get(url, headers=headers)
        if not assert_status_code(response, 200):
            return False
        waste_types_time = time.time() - start_time
        log(f"✅ Got waste types in {waste_types_time:.4f} seconds")
        
        # Test messages with related data
        start_time = time.time()
        url = f"{BASE_URL}/api/marketplace/messages/my_messages/"
        headers = {'Authorization': f"Token {self.tokens['farmer']}"}
        response = requests.get(url, headers=headers)
        if not assert_status_code(response, 200):
            return False
        messages_time = time.time() - start_time
        log(f"✅ Got messages in {messages_time:.4f} seconds")
        
        return True

if __name__ == "__main__":
    print("\n🚀 Starting AgriWaste Marketplace API Tests\n")
    tester = APITester()
    tester.run_all_tests() 