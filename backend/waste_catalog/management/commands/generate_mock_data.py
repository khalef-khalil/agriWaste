import os
import random
import datetime
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from django.conf import settings
from django.utils.text import slugify
from faker import Faker
from waste_catalog.models import WasteCategory, WasteType, ResourceDocument
from marketplace.models import WasteListing, ListingImage, Order, Review, Message
from users.models import UserProfile

def model_has_field(model_class, field_name):
    """Check if a model has a specific field."""
    try:
        model_class._meta.get_field(field_name)
        return True
    except:
        return False

class Command(BaseCommand):
    help = 'Generates mock data for the AgriWaste application'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Use only French locale for all generated text
        try:
            self.fake = Faker('fr_FR')
        except (AttributeError, ImportError):
            self.stdout.write(self.style.WARNING('French locale not supported. Using default locale.'))
            self.fake = Faker()  # Default locale
        self.users = []
        self.categories = []
        self.waste_types = []
        self.listings = []

    def add_arguments(self, parser):
        parser.add_argument(
            '--users',
            type=int,
            default=20,
            help='Number of users to create'
        )
        parser.add_argument(
            '--categories',
            type=int,
            default=8,
            help='Number of waste categories to create'
        )
        parser.add_argument(
            '--types',
            type=int,
            default=30,
            help='Number of waste types to create'
        )
        parser.add_argument(
            '--documents',
            type=int,
            default=50,
            help='Number of resource documents to create'
        )
        parser.add_argument(
            '--listings',
            type=int,
            default=30,
            help='Number of marketplace listings to create'
        )
        parser.add_argument(
            '--orders',
            type=int,
            default=15,
            help='Number of orders to create'
        )
        parser.add_argument(
            '--reviews',
            type=int,
            default=30,
            help='Number of reviews to create'
        )
        parser.add_argument(
            '--messages',
            type=int,
            default=60,
            help='Number of messages to create'
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before creating new mock data'
        )

    def handle(self, *args, **options):
        """Command entry point."""
        self.stdout.write("Generating mock data...")
        self.check_model_compatibility()
        
        # Clear existing data if requested
        if options.get('clear', False):
            self.clear_existing_data()
        
        # Store options globally for use in other methods
        self.options = options
        
        # Generate new data
        self.handle_users()
        
        try:
            self.handle_category_data()
            self.handle_waste_type_data()
        except AttributeError:
            # Fall back to the original methods for backward compatibility
            self.stdout.write(self.style.WARNING("Using legacy data generation methods due to compatibility issues."))
            self.handle_categories()
            self.handle_waste_types()
        
        # Generate marketplace listings
        self.handle_listings()
        
        self.handle_orders()
        self.handle_reviews()
        
        self.stdout.write(self.style.SUCCESS("Mock data generation completed successfully."))

    def clear_existing_data(self):
        Message.objects.all().delete()
        Review.objects.all().delete()
        Order.objects.all().delete()
        ListingImage.objects.all().delete()
        WasteListing.objects.all().delete()
        ResourceDocument.objects.all().delete()
        WasteType.objects.all().delete()
        WasteCategory.objects.all().delete()
        UserProfile.objects.all().delete()
        User.objects.filter(is_superuser=False).delete()

    def handle_users(self):
        """Create users with different roles."""
        count = self.options.get('users', 10)  # Default to 10 if not specified
        self.stdout.write(f'Creating {count} users...')
        
        # Create farmers (40%)
        for i in range(int(count * 0.4)):
            user = self.create_user('FARMER')
            self.users.append(user)
        
        # Create researchers (20%)
        for i in range(int(count * 0.2)):
            user = self.create_user('RESEARCHER')
            self.users.append(user)
        
        # Create startups (20%)
        for i in range(int(count * 0.2)):
            user = self.create_user('STARTUP')
            self.users.append(user)
        
        # Create industry (20%)
        for i in range(int(count * 0.2)):
            user = self.create_user('INDUSTRY')
            self.users.append(user)
        
        # Add the rest as OTHER if any
        remaining = count - len(self.users)
        for i in range(remaining):
            user = self.create_user('OTHER')
            self.users.append(user)
        
        self.stdout.write(f'Created {len(self.users)} users')

    def create_user(self, user_type):
        first_name = self.fake.first_name()
        last_name = self.fake.last_name()
        username = f"{slugify(first_name)}_{slugify(last_name)}_{random.randint(1, 999)}"
        
        user = User.objects.create(
            username=username,
            email=self.fake.email(),
            first_name=first_name,
            last_name=last_name,
            password='pbkdf2_sha256$600000$5FmbuMSLGMxoWsOIUbDpBV$t5WF+USxEo9K8jiXtVb5EjCNFfqqU7dOWjy8nmDZe2Q=',  # 'password123'
            is_active=True
        )
        
        # Update profile with additional data
        user.profile.user_type = user_type
        
        if user_type == 'FARMER':
            user.profile.organization = self.fake.company() if random.random() > 0.7 else None
            user.profile.bio = self.fake.paragraph(nb_sentences=3, variable_nb_sentences=True)
        elif user_type == 'RESEARCHER':
            user.profile.organization = self.fake.company()
            user.profile.bio = self.fake.paragraph(nb_sentences=4, variable_nb_sentences=True)
        elif user_type == 'STARTUP':
            user.profile.organization = self.fake.company()
            user.profile.bio = self.fake.paragraph(nb_sentences=4, variable_nb_sentences=True)
        elif user_type == 'INDUSTRY':
            user.profile.organization = self.fake.company()
            user.profile.bio = self.fake.paragraph(nb_sentences=3, variable_nb_sentences=True)
        else:
            user.profile.organization = self.fake.company() if random.random() > 0.5 else None
            user.profile.bio = self.fake.paragraph(nb_sentences=2, variable_nb_sentences=True)
        
        user.profile.address = self.fake.address()
        user.profile.phone_number = self.fake.phone_number()
        user.profile.country = random.choice(['TN', 'LY', 'DZ'])
        user.profile.save()
        
        return user

    def handle_category_data(self):
        """Create waste categories with French descriptions and images."""
        count = self.options.get('categories', 10)  # Default to 10 if not specified
        self.stdout.write(f'Creating {count} waste categories...')
        
        agricultural_waste_categories = [
            {
                'name': 'Résidus de Céréales',
                'description': 'Les résidus des cultures de céréales comme la paille de blé, d\'orge, de riz, et d\'autres céréales.',
                'image': self.get_local_image('Résidus de Céréales')
            },
            {
                'name': 'Déchets d\'Oliveraies',
                'description': 'Sous-produits de la production d\'huile d\'olive, y compris les margines, les grignons, et les résidus de taille.',
                'image': self.get_local_image('Déchets d\'Oliveraies')
            },
            {
                'name': 'Résidus d\'Agrumes',
                'description': 'Déchets issus de la production d\'agrumes, comme les pelures, les pulpes et les graines.',
                'image': self.get_local_image('Résidus d\'Agrumes')
            },
            {
                'name': 'Déchets de Viticulture',
                'description': 'Résidus de la production de raisins et de vin, comme les marcs, les rafles et les sarments de vigne.',
                'image': self.get_local_image('Déchets de Viticulture')
            },
            {
                'name': 'Résidus de Cultures Maraîchères',
                'description': 'Déchets des cultures de légumes, comme les tiges, les feuilles et les produits hors calibre.',
                'image': self.get_local_image('Résidus de Cultures Maraîchères')
            },
            {
                'name': 'Déchets d\'Élevage',
                'description': 'Fumiers, lisiers et autres déchets organiques issus de l\'élevage animal.',
                'image': self.get_local_image('Déchets d\'Élevage')
            },
            {
                'name': 'Déchets de Transformation Alimentaire',
                'description': 'Résidus issus de la transformation des produits agricoles, comme les écorces, pulpes et drêches.',
                'image': self.get_local_image('Déchets de Transformation Alimentaire')
            },
            {
                'name': 'Cultures Énergétiques',
                'description': 'Résidus des cultures dédiées à la production d\'énergie comme le miscanthus ou le switchgrass.',
                'image': self.get_local_image('Cultures Énergétiques')
            },
            {
                'name': 'Biomasse Forestière',
                'description': 'Résidus de l\'exploitation forestière et de l\'entretien des espaces boisés.',
                'image': self.get_local_image('Biomasse Forestière')
            },
            {
                'name': 'Déchets de Floriculture',
                'description': 'Résidus issus de la production de fleurs et de plantes ornementales.',
                'image': self.get_local_image('Déchets de Floriculture')
            }
        ]
        
        # Use the predefined categories or generate random ones if we need more
        for i in range(min(count, len(agricultural_waste_categories))):
            category_data = agricultural_waste_categories[i]
            category = WasteCategory.objects.create(
                name=category_data['name'],
                description=category_data['description'],
                image=category_data['image'],
                created_at=timezone.now() - datetime.timedelta(days=random.randint(1, 365))
            )
            self.categories.append(category)
        
        # Add random categories if needed
        for i in range(count - len(self.categories)):
            category = WasteCategory.objects.create(
                name=self.fake.word().capitalize() + ' ' + self.fake.word(),
                description=self.fake.paragraph(nb_sentences=2),
                image=self.get_local_image(),
                created_at=timezone.now() - datetime.timedelta(days=random.randint(1, 365))
            )
            self.categories.append(category)
        
        self.stdout.write(f'Created {len(self.categories)} waste categories')

    def handle_waste_type_data(self):
        """Create waste types with French descriptions and images."""
        count = self.options.get('types', 20)  # Default to 20 if not specified
        self.stdout.write(f'Creating {count} waste types...')
        
        waste_types_data = [
            # Add specific French waste types
            {
                'category': 'Résidus de Céréales',
                'waste_types': [
                    {
                        'name': 'Paille de Blé',
                        'description': 'Résidus de tiges de blé après récolte des grains.',
                        'potential_uses': 'Litière pour animaux, production de papier, biocarburants, biochar, compost.',
                        'sustainability_score': 4.2,
                        'image': self.get_local_image(waste_type='Paille de Blé')
                    },
                    {
                        'name': 'Paille d\'Orge',
                        'description': 'Tiges et feuilles d\'orge séchées après la moisson.',
                        'potential_uses': 'Alimentation animale, paillage, matériau de construction, biocarburants.',
                        'sustainability_score': 4.0,
                        'image': self.get_local_image(waste_type='Paille de Blé')
                    },
                    {
                        'name': 'Balle de Riz',
                        'description': 'Enveloppe extérieure du grain de riz, séparée lors du décorticage.',
                        'potential_uses': 'Production d\'énergie, matériau isolant, substrat pour champignons, amendement du sol.',
                        'sustainability_score': 4.5,
                        'image': self.get_local_image(waste_type='Balle de Riz')
                    },
                    {
                        'name': 'Rafles de Maïs',
                        'description': 'Parties centrales de l\'épi de maïs après l\'égrenage.',
                        'potential_uses': 'Biocarburants, alimentation animale, substrat pour champignons, panneaux de particules.',
                        'sustainability_score': 4.1,
                        'image': self.get_local_image(waste_type='Tiges de Maïs')
                    }
                ]
            },
            {
                'category': 'Déchets d\'Oliveraies',
                'waste_types': [
                    {
                        'name': 'Margines',
                        'description': 'Effluents liquides issus de l\'extraction de l\'huile d\'olive.',
                        'potential_uses': 'Fertilisant après traitement, production de biogaz, extraction de composés phénoliques.',
                        'sustainability_score': 3.8,
                        'image': self.get_local_image(waste_type='Grignons d\'Olive')
                    },
                    {
                        'name': 'Grignons d\'Olive',
                        'description': 'Résidus solides composés de pulpe et de noyaux d\'olives après extraction de l\'huile.',
                        'potential_uses': 'Combustible, compost, alimentation animale, extraction d\'huile de grignons.',
                        'sustainability_score': 4.3,
                        'image': self.get_local_image(waste_type='Grignons d\'Olive')
                    },
                    {
                        'name': 'Bois de Taille d\'Olivier',
                        'description': 'Branches issues de la taille périodique des oliviers.',
                        'potential_uses': 'Bois de chauffage, production de charbon de bois, paillage, artisanat.',
                        'sustainability_score': 4.7,
                        'image': self.get_local_image()
                    }
                ]
            },
            {
                'category': 'Résidus d\'Agrumes',
                'waste_types': [
                    {
                        'name': 'Écorces d\'Orange',
                        'description': 'Pelures et zestes d\'oranges issus de la consommation et de la transformation industrielle.',
                        'potential_uses': 'Extraction d\'huiles essentielles, pectine, compléments alimentaires, biocarburants.',
                        'sustainability_score': 4.6,
                        'image': self.get_local_image(waste_type='Pelures d\'Orange')
                    },
                    {
                        'name': 'Pulpe de Citron',
                        'description': 'Résidus de chair et d\'écorce après pressage des citrons.',
                        'potential_uses': 'Extraction d\'acide citrique, production de pectine, arômes alimentaires, cosmétiques.',
                        'sustainability_score': 4.4,
                        'image': self.get_local_image(waste_type='Pelures d\'Orange')
                    },
                    {
                        'name': 'Résidus de Pamplemousse',
                        'description': 'Écorces, pulpe et pépins de pamplemousse issus de la transformation.',
                        'potential_uses': 'Extraction de pectine, arômes alimentaires, additifs naturels, biocarburants.',
                        'sustainability_score': 4.3,
                        'image': self.get_local_image(waste_type='Pelures d\'Orange')
                    }
                ]
            },
            {
                'category': 'Déchets de Viticulture',
                'waste_types': [
                    {
                        'name': 'Marc de Raisin',
                        'description': 'Résidus solides du pressage des raisins, composés de peaux, pépins et rafles.',
                        'potential_uses': 'Distillation, extraction d\'huile de pépins, compost, alimentation animale, cosmétiques.',
                        'sustainability_score': 4.5,
                        'image': self.get_local_image(waste_type='Marc de Raisin')
                    },
                    {
                        'name': 'Sarments de Vigne',
                        'description': 'Rameaux ligneux issus de la taille annuelle des vignes.',
                        'potential_uses': 'Combustible, compost, paillage, extraction de tanins, fumage alimentaire.',
                        'sustainability_score': 4.8,
                        'image': self.get_local_image()
                    },
                    {
                        'name': 'Lies de Vin',
                        'description': 'Résidus de levure et autres particules qui se déposent au fond des cuves pendant la fermentation.',
                        'potential_uses': 'Distillation, extraction d\'acide tartrique, amendement des sols, compost.',
                        'sustainability_score': 4.0,
                        'image': self.get_local_image(waste_type='Marc de Raisin')
                    }
                ]
            },
            {
                'category': 'Déchets d\'Élevage',
                'waste_types': [
                    {
                        'name': 'Fumier Bovin',
                        'description': 'Mélange d\'excréments de bovins et de litière.',
                        'potential_uses': 'Fertilisant, production de biogaz, culture de champignons, amendement des sols.',
                        'sustainability_score': 4.5,
                        'image': self.get_local_image(category='Fumier Animal')
                    },
                    {
                        'name': 'Lisier Porcin',
                        'description': 'Effluents liquides issus de l\'élevage porcin.',
                        'potential_uses': 'Production de biogaz, fertilisation après traitement, irrigation fertilisante.',
                        'sustainability_score': 3.9,
                        'image': self.get_local_image(category='Fumier Animal')
                    },
                    {
                        'name': 'Fumier de Volaille',
                        'description': 'Excréments de volailles mélangés à la litière.',
                        'potential_uses': 'Fertilisant riche en azote, production de biogaz, compostage, culture de champignons.',
                        'sustainability_score': 4.6,
                        'image': self.get_local_image(category='Fumier Animal')
                    }
                ]
            }
        ]
        
        # Create waste types from the predefined data
        for category_data in waste_types_data:
            try:
                category = WasteCategory.objects.get(name=category_data['category'])
                
                for type_data in category_data['waste_types']:
                    # Create waste type with appropriate field names based on model structure
                    waste_type_data = {
                        'category': category,
                        'name': type_data['name'],
                        'description': type_data['description'],
                        'sustainability_score': type_data['sustainability_score'],
                        'image': type_data['image'],
                        'created_at': timezone.now() - datetime.timedelta(days=random.randint(1, 300))
                    }
                    
                    # Support both potential field names
                    if model_has_field(WasteType, 'potential_uses'):
                        waste_type_data['potential_uses'] = type_data['potential_uses']
                    elif model_has_field(WasteType, 'potential_applications'):
                        waste_type_data['potential_applications'] = type_data['potential_uses']
                        
                    waste_type = WasteType.objects.create(**waste_type_data)
                    self.waste_types.append(waste_type)
            except WasteCategory.DoesNotExist:
                self.stdout.write(self.style.WARNING(f"Category {category_data['category']} not found"))
        
        # Create additional random waste types
        remaining = count - len(self.waste_types)
        for i in range(remaining):
            category = random.choice(self.categories)
            # Create waste type with appropriate field names
            waste_type_data = {
                'category': category,
                'name': self.fake.word().capitalize() + ' ' + self.fake.word(),
                'description': self.fake.paragraph(nb_sentences=3),
                'sustainability_score': Decimal(str(round(random.uniform(2.5, 5.0), 1))),
                'image': self.get_local_image(),
                'created_at': timezone.now() - datetime.timedelta(days=random.randint(1, 300))
            }
            
            # Support both potential field names
            potential_content = self.fake.paragraph(nb_sentences=2)
            if model_has_field(WasteType, 'potential_uses'):
                waste_type_data['potential_uses'] = potential_content
            elif model_has_field(WasteType, 'potential_applications'):
                waste_type_data['potential_applications'] = potential_content
                
            waste_type = WasteType.objects.create(**waste_type_data)
            self.waste_types.append(waste_type)
        
        self.stdout.write(f'Created {len(self.waste_types)} waste types')

    def handle_listings(self):
        """Generate mock marketplace listings."""
        self.stdout.write("Generating marketplace listings...")
        
        # Get all waste types and users
        waste_types = list(WasteType.objects.all())
        if not waste_types:
            self.stdout.write(self.style.WARNING("No waste types found. Skipping listings generation."))
            return
            
        users = list(User.objects.filter(profile__user_type__in=['FARMER', 'INDUSTRY']))
        if not users:
            self.stdout.write(self.style.WARNING("No appropriate users found (farmers/industrial). Skipping listings generation."))
            return
            
        # Get listing count from options or use default
        listing_count = self.options.get('listings', 30)
        
        # French city names for locations
        cities = [
            "Tunis", "Sfax", "Sousse", "Kairouan", "Bizerte", # Tunisia
            "Tripoli", "Benghazi", "Misrata", "Zawiya", "Zliten", # Libya
            "Alger", "Oran", "Constantine", "Annaba", "Blida", # Algeria
        ]
        
        # Listing titles in French related to agricultural waste
        listing_titles = [
            "Déchets d'olives disponibles",
            "Biomasse agricole à vendre",
            "Résidus de blé en grande quantité",
            "Déchets de maïs frais",
            "Pulpe d'agrumes disponible",
            "Restes de taille d'olivier",
            "Déchets de tomate pour compost",
            "Paille de céréales",
            "Feuilles de palmier dattier",
            "Résidus de pressage d'huile",
            "Marc de raisin après vinification",
            "Déchets de transformation de fruits",
            "Coques d'amandes disponibles",
            "Résidus de café pour compost",
            "Écorces d'agrumes en vrac",
        ]
        
        # Unit prices by waste type category (approx. prices in TND)
        price_ranges = {
            "Résidus de récolte": (20, 150),
            "Déchets de transformation": (50, 200),
            "Biomasse ligneuse": (30, 100),
            "Déchets d'élevage": (15, 80),
            "Résidus agroindustriels": (60, 250),
            "default": (25, 120)
        }
        
        # Country distribution
        country_distribution = {
            'TN': 0.5,  # Tunisia: 50%
            'DZ': 0.3,  # Algeria: 30%
            'LY': 0.2,  # Libya: 20%
        }
        
        # Quantity units by waste type
        unit_mapping = {
            "Résidus de récolte": ["KG", "TON"],
            "Déchets de transformation": ["KG", "LITER"],
            "Biomasse ligneuse": ["KG", "CUBIC_M"],
            "Déchets d'élevage": ["KG", "TON"],
            "Résidus agroindustriels": ["KG", "LITER", "TON"],
            "default": ["KG", "UNIT"]
        }
        
        # Real image files that have been downloaded
        listing_images = [
            "olive_waste.jpg",
            "grain_waste.jpg",
            "fruit_waste.jpg",
            "compost.jpg",
            "palm_leaves.jpg",
            "coffee_waste.jpg"
        ]
        
        # Generate listings
        listings_created = 0
        for _ in range(listing_count):
            try:
                # Select random waste type and seller
                waste_type = random.choice(waste_types)
                seller = random.choice(users)
                
                # Get category name to determine price range and units
                category_name = waste_type.category.name if waste_type.category else "default"
                
                # Determine price range based on category
                min_price, max_price = price_ranges.get(category_name, price_ranges['default'])
                
                # Determine quantity unit based on waste type
                possible_units = unit_mapping.get(category_name, unit_mapping['default'])
                unit = random.choice(possible_units)
                
                # Determine country based on distribution
                country = random.choices(
                    list(country_distribution.keys()),
                    weights=list(country_distribution.values()),
                    k=1
                )[0]
                
                # Select city based on country
                if country == 'TN':
                    location = random.choice(cities[:5])
                elif country == 'LY':
                    location = random.choice(cities[5:10])
                else:  # Algeria
                    location = random.choice(cities[10:])
                
                # Determine availability dates
                today = timezone.now().date()
                available_from = today + datetime.timedelta(days=random.randint(0, 15))
                available_until = available_from + datetime.timedelta(days=random.randint(30, 90))
                
                # Randomize featured status (10% chance of being featured)
                featured = random.random() < 0.1
                
                # Create the listing
                listing = WasteListing.objects.create(
                    seller=seller,
                    waste_type=waste_type,
                    title=random.choice(listing_titles),
                    description=self.fake.paragraph(nb_sentences=random.randint(3, 6)),
                    quantity=Decimal(random.randint(50, 5000)),
                    unit=unit,
                    price=Decimal(random.randint(min_price, max_price)),
                    location=location,
                    country=country,
                    available_from=available_from,
                    available_until=available_until,
                    status='ACTIVE',
                    featured=featured
                )
                
                # Create 1-3 listing images using the real image files
                image_count = random.randint(1, 3)
                for i in range(image_count):
                    is_primary = (i == 0)  # first image is primary
                    # Use an existing image file
                    image_file = random.choice(listing_images)
                    
                    ListingImage.objects.create(
                        listing=listing,
                        image=f"listing_images/{image_file}",
                        is_primary=is_primary
                    )
                
                listings_created += 1
                
                if listings_created % 5 == 0:
                    self.stdout.write(f" - Created {listings_created} listings...")
                    
            except Exception as e:
                self.stdout.write(self.style.WARNING(f"Error creating listing: {str(e)}"))
        
        self.stdout.write(self.style.SUCCESS(f"Created {listings_created} marketplace listings"))

    def handle_orders(self):
        """Create orders."""
        count = self.options.get('orders', 15)  # Default to 15 if not specified
        self.stdout.write(f'Creating {count} orders...')
        
        # Only use active listings for orders
        active_listings = [listing for listing in self.listings if listing.status in ['ACTIVE', 'SOLD']]
        
        if not active_listings:
            self.stdout.write(self.style.WARNING('No active listings available to create orders'))
            return
            
        # Use non-farmer users as buyers to ensure seller != buyer
        buyer_users = [user for user in self.users if user.profile.user_type != 'FARMER']
        
        if not buyer_users:
            self.stdout.write(self.style.WARNING('No buyer users available to create orders'))
            return
            
        orders_created = 0
        
        for i in range(count):
            if not active_listings:
                break
                
            listing = random.choice(active_listings)
            
            # Make sure buyer is not the seller
            potential_buyers = [user for user in buyer_users if user != listing.seller]
            if not potential_buyers:
                continue
                
            buyer = random.choice(potential_buyers)
            
            # Order quantity should be reasonable compared to listing quantity
            max_quantity = float(listing.quantity) * 0.8
            quantity = Decimal(str(round(random.uniform(max_quantity * 0.1, max_quantity), 2)))
            
            # Calculate total price based on listing price and quantity
            unit_price = float(listing.price)
            total_price = Decimal(str(round(unit_price * float(quantity), 2)))
            
            # More realistic status distribution
            status_weights = {'PENDING': 0.1, 'ACCEPTED': 0.2, 'REJECTED': 0.1, 'CANCELLED': 0.1, 'COMPLETED': 0.5}
            status = random.choices(
                list(status_weights.keys()), 
                weights=list(status_weights.values()), 
                k=1
            )[0]
            
            # Create dates that make sense
            listing_created = listing.created_at
            order_created = listing_created + datetime.timedelta(days=random.randint(1, 30))
            
            order = Order.objects.create(
                buyer=buyer,
                listing=listing,
                quantity=quantity,
                total_price=total_price,
                shipping_address=self.fake.address(),
                status=status,
                created_at=order_created,
                updated_at=order_created + datetime.timedelta(days=random.randint(1, 10))
            )
            
            # Mark listing as sold if the order is completed
            if status == 'COMPLETED' and listing.status == 'ACTIVE':
                listing.status = 'SOLD'
                listing.save()
            
            orders_created += 1
            
        self.stdout.write(f'Created {orders_created} orders')

    def handle_reviews(self):
        """Create reviews."""
        count = self.options.get('reviews', 10)  # Default to 10 if not specified
        self.stdout.write(f'Creating {count} reviews...')
        
        # Only use completed orders for reviews
        completed_orders = Order.objects.filter(status='COMPLETED')
        
        if not completed_orders:
            self.stdout.write(self.style.WARNING('No completed orders available to create reviews'))
            return
            
        reviews_created = 0
        
        for i in range(min(count, len(completed_orders))):
            order = completed_orders[i]
            
            # Realistic rating distribution weighted towards positive
            rating_weights = {5: 0.4, 4: 0.3, 3: 0.15, 2: 0.1, 1: 0.05}
            rating = random.choices(
                list(rating_weights.keys()), 
                weights=list(rating_weights.values()), 
                k=1
            )[0]
            
            # Create a more realistic review comment based on the rating
            if rating >= 4:
                comment = random.choice([
                    f"Très satisfait de la qualité de {order.listing.waste_type.name}. Transaction facile et livraison rapide.",
                    f"Excellent produit, conforme à la description. Je recommande ce vendeur.",
                    f"Parfait pour mon projet de recherche. Matériau de très bonne qualité.",
                    f"Service impeccable et produit correspondant parfaitement à nos besoins.",
                    f"Collaboration très professionnelle. Le {order.listing.waste_type.name} était exactement ce dont nous avions besoin."
                ])
            elif rating == 3:
                comment = random.choice([
                    f"Produit correct mais délai de livraison un peu long.",
                    f"Qualité acceptable mais pourrait être améliorée.",
                    f"Correspond à la description mais le conditionnement laissait à désirer.",
                    f"Transaction correcte dans l'ensemble, rien à signaler de particulier.",
                    f"Satisfaisant mais pas exceptionnel."
                ])
            else:
                comment = random.choice([
                    f"Déçu par la qualité du produit, ne correspond pas exactement à la description.",
                    f"Problèmes de communication avec le vendeur et retard de livraison.",
                    f"Matériau de qualité inférieure à ce qui était annoncé.",
                    f"Je ne recommande pas ce vendeur, expérience décevante.",
                    f"Trop cher pour la qualité fournie. Ne rachèterai pas."
                ])
            
            Review.objects.create(
                order=order,
                rating=rating,
                comment=comment,
                created_at=order.updated_at + datetime.timedelta(days=random.randint(1, 14))
            )
            
            reviews_created += 1
            
        self.stdout.write(f'Created {reviews_created} reviews')

    def create_messages(self, count):
        self.stdout.write(f'Creating {count} messages...')
        
        messages_created = 0
        
        # Create message pairs to simulate conversations
        for i in range(count // 2):
            # Pick two random different users
            if len(self.users) < 2:
                break
                
            user_pairs = random.sample(self.users, 2)
            sender = user_pairs[0]
            receiver = user_pairs[1]
            
            # 70% of messages are related to a listing
            if random.random() < 0.7 and self.listings:
                listing = random.choice(self.listings)
                subject = f"Question sur: {listing.title}"
                
                # First message in the conversation
                content = random.choice([
                    f"Bonjour, je suis intéressé par votre {listing.waste_type.name}. Est-il toujours disponible?",
                    f"Bonjour, pouvez-vous me donner plus de détails sur la qualité du {listing.waste_type.name}?",
                    f"Je travaille sur un projet de recherche et votre {listing.waste_type.name} pourrait m'intéresser. Pouvons-nous en discuter?",
                    f"Est-il possible de voir des échantillons avant de passer commande?",
                    f"Bonjour, pouvez-vous faire une livraison à [ville]? Merci."
                ])
            else:
                listing = None
                subject = random.choice([
                    "Question générale",
                    "Demande d'information",
                    "Collaboration potentielle",
                    "Projet de recherche",
                    "Besoin d'expertise"
                ])
                
                content = self.fake.paragraph(nb_sentences=2)
            
            # Create first message
            message_date = timezone.now() - datetime.timedelta(days=random.randint(1, 90))
            
            first_message = Message.objects.create(
                sender=sender,
                receiver=receiver,
                listing=listing,
                subject=subject,
                content=content,
                read=True,  # First message is usually read
                created_at=message_date
            )
            
            messages_created += 1
            
            # Create reply (80% chance)
            if random.random() < 0.8:
                reply_date = message_date + datetime.timedelta(hours=random.randint(1, 48))
                
                # Create response based on the first message
                if listing:
                    reply_content = random.choice([
                        f"Bonjour, oui le {listing.waste_type.name} est toujours disponible. Quelle quantité vous intéresse?",
                        f"Merci pour votre intérêt. Je peux vous fournir des échantillons, donnez-moi votre adresse.",
                        f"Bonjour, nous pouvons certainement discuter de vos besoins spécifiques. Appelez-moi au [numéro].",
                        f"La livraison est possible moyennant des frais supplémentaires. Pouvez-vous préciser la destination?",
                        f"Bien sûr, je serais ravi de vous donner plus de détails. Voici les caractéristiques exactes: [...]"
                    ])
                else:
                    reply_content = self.fake.paragraph(nb_sentences=2)
                
                Message.objects.create(
                    sender=receiver,  # Swap sender and receiver
                    receiver=sender,
                    listing=listing,
                    subject=f"Re: {subject}",
                    content=reply_content,
                    read=random.random() < 0.7,  # 70% chance the reply was read
                    created_at=reply_date
                )
                
                messages_created += 1
        
        self.stdout.write(f'Created {messages_created} messages')

    def check_model_compatibility(self):
        """Check if models have the expected fields."""
        try:
            # Check WasteType model
            waste_type_fields = ['name', 'description']
            for field in waste_type_fields:
                if not model_has_field(WasteType, field):
                    self.stdout.write(self.style.WARNING(f"WasteType model is missing core field '{field}'. Data generation may fail."))
            
            # Check if either potential_uses or potential_applications exists
            if not (model_has_field(WasteType, 'potential_uses') or model_has_field(WasteType, 'potential_applications')):
                self.stdout.write(self.style.WARNING("WasteType model is missing both 'potential_uses' and 'potential_applications' fields."))
            
            # Check ResourceDocument model
            resource_doc_fields = ['title', 'document_type', 'file']
            for field in resource_doc_fields:
                if not model_has_field(ResourceDocument, field):
                    self.stdout.write(self.style.WARNING(f"ResourceDocument model is missing core field '{field}'. Data generation may fail."))
            
            # Check WasteListing model
            listing_fields = ['title', 'description', 'quantity', 'price', 'status']
            for field in listing_fields:
                if not model_has_field(WasteListing, field):
                    self.stdout.write(self.style.WARNING(f"WasteListing model is missing core field '{field}'. Data generation may fail."))
                    
        except Exception as e:
            self.stdout.write(self.style.WARNING(f"Error checking model compatibility: {str(e)}"))
            self.stdout.write(self.style.WARNING("Will attempt to continue with data generation."))

    def get_local_image(self, category=None, waste_type=None):
        """
        Returns a path to a local image file based on the category or waste type.
        """
        # Images for categories
        category_images = {
            'Résidus de Récolte': 'waste_categories/crop_residue.jpg',
            'Déchets de Fruits et Légumes': 'waste_categories/fruit_waste.jpg',
            'Fumier Animal': 'waste_categories/animal_manure.jpg',
            'Déchets d\'Élevage': 'waste_categories/animal_manure.jpg',
            'Résidus de Traitement': 'waste_categories/food_processing.jpg',
            'Biomasse Ligneuse': 'waste_categories/wood_biomass.jpg',
            'Déchets Verts': 'waste_categories/crop_residue.jpg',
            'Résidus de Culture Spécialisée': 'waste_categories/wood_biomass.jpg',
            'Cultures Énergétiques': 'waste_categories/crop_residue.jpg',
            'Déchets de Transformation Alimentaire': 'waste_categories/food_processing.jpg',
        }
        
        # Images for waste types
        waste_type_images = {
            'Paille de Blé': 'waste_types/straw_wheat.jpg',
            'Balle de Riz': 'waste_types/rice_husks.jpg',
            'Grignons d\'Olive': 'waste_types/olive_pomace.jpg',
            'Pelures d\'Orange': 'waste_types/orange_peels.jpg',
            'Marc de Raisin': 'waste_types/grape_marc.jpg',
            'Compost': 'waste_types/compost.jpg',
            'Tiges de Maïs': 'waste_types/corn_stalks.jpg',
        }
        
        # Return the appropriate image path based on inputs
        if category and category in category_images:
            return category_images[category]
        elif waste_type and waste_type in waste_type_images:
            return waste_type_images[waste_type]
        
        # Default images if no match found
        if category:
            # Return a random category image
            return random.choice(list(category_images.values()))
        else:
            # Return a random waste type image
            return random.choice(list(waste_type_images.values())) 