# Database Seeder

This directory contains scripts to populate the database with sample data for development and testing purposes.

## What Gets Seeded

The seeder populates your MongoDB database with:

- **10 Users** - Including 1 admin user and 9 regular users
- **10 Groups** - Educational groups with teacher assignments
- **10 Products** - Course offerings with reviews and ratings
- **10 Carousel Items** - Banner/promotional items

## Usage

### Run the Seeder

```bash
npm run seed
```

This will:
1. Clear all existing data from users, groups, products, and carousel collections
2. Insert fresh sample data with proper relationships
3. Add sample reviews to products

### Default Credentials

After seeding, you can login with these test accounts:

**Admin User:**
- Email: `admin@example.com`
- Password: `admin123`

**Regular Users:**
- Email: `john@example.com`, `jane@example.com`, etc.
- Password: `password123` (for all regular users)

## File Structure

```
src/seed/
├── README.md           # This file
├── seed.data.ts        # Sample data definitions
├── seed.service.ts     # Service that handles database operations
├── seed.module.ts      # NestJS module configuration
└── seed.script.ts      # Standalone script to run seeding
```

## Data Relationships

The seeder maintains proper relationships between collections:

```
Users
├── Groups (teacher.user → User._id)
├── Products (user → User._id, creator)
│   └── Reviews (user → User._id, reviewer)
└── Carousel (user → User._id, admin)
```

## Customizing Seed Data

To modify the sample data, edit the arrays in `seed.data.ts`:

- `seedUsers` - User accounts
- `seedGroups` - Educational groups
- `seedProducts` - Course products
- `seedCarousel` - Banner items

## Warning

⚠️ Running the seeder will **DELETE ALL EXISTING DATA** in the following collections:
- users
- groups
- products
- carousel

Only use this in development environments!

