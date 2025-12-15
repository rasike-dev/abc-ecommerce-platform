# 🌱 Seed Data Usage Guide

Your database has been successfully populated with sample data! Here's everything you need to know.

## ✅ What Was Seeded

| Collection | Count | Description |
|------------|-------|-------------|
| 👥 Users | 10 | 1 admin + 9 regular users |
| 📚 Groups | 10 | Educational groups with teachers |
| 🎓 Products | 10 | Course offerings with reviews |
| 🎨 Carousel | 10 | Banner/promotional items |
| ⭐ Reviews | ~25 | Product reviews from users |

## 🔑 Test Credentials

### Admin Account
```
Email: admin@example.com
Password: admin123
```

### Regular User Accounts
```
john@example.com   → password123
jane@example.com   → password123
michael@example.com → password123
emily@example.com  → password123
david@example.com  → password123
sarah@example.com  → password123
robert@example.com → password123
lisa@example.com   → password123
james@example.com  → password123
```

## 📝 Available Commands

### Seed the Database
```bash
npm run seed
```
⚠️ Warning: This clears ALL existing data before inserting new records!

### Verify Seeded Data
```bash
npm run seed:verify
```
Shows a detailed report of what's in the database.

### Start the Server
```bash
npm run start:dev
```

## 🔗 API Endpoints to Test

### Authentication
```bash
# Register a new user
POST http://localhost:3000/auth/register
{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "password123"
}

# Login
POST http://localhost:3000/auth/login
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

### Users
```bash
# Get all users (Admin only)
GET http://localhost:3000/users
Authorization: Bearer <admin_token>

# Get user profile
GET http://localhost:3000/users/profile
Authorization: Bearer <token>
```

### Products
```bash
# Get all products
GET http://localhost:3000/products

# Get product by ID
GET http://localhost:3000/products/:id

# Create product review
POST http://localhost:3000/products/:id/reviews
Authorization: Bearer <token>
{
  "rating": 5,
  "comment": "Excellent course!"
}
```

### Groups
```bash
# Get all groups
GET http://localhost:3000/groups

# Get group by ID
GET http://localhost:3000/groups/:id

# Search groups
GET http://localhost:3000/groups?subject=Mathematics
```

### Carousel
```bash
# Get all carousel items
GET http://localhost:3000/carousel

# Create carousel item (Admin only)
POST http://localhost:3000/carousel
Authorization: Bearer <admin_token>
{
  "name": "New Promotion",
  "image": "https://example.com/image.jpg",
  "description": "Amazing offer!"
}
```

### Orders
```bash
# Create order
POST http://localhost:3000/orders
Authorization: Bearer <token>
{
  "orderItems": [
    {
      "name": "Product Name",
      "month": 12,
      "image": "url",
      "price": 12000,
      "product": "product_id"
    }
  ],
  "shippingAddress": {
    "address": "123 Main St",
    "city": "Colombo",
    "postalCode": "10100",
    "country": "Sri Lanka"
  },
  "paymentMethod": "Card",
  "totalPrice": 12000
}

# Get my orders
GET http://localhost:3000/orders/myorders
Authorization: Bearer <token>
```

## 📊 Sample Data Details

### Products
All products include:
- ✅ Realistic pricing (₹9,500 - ₹18,000)
- ✅ High ratings (4.3 - 4.9 stars)
- ✅ Multiple reviews (2-3 per product)
- ✅ Categories: Mathematics, Science, Language, Technology, etc.
- ✅ Grade levels (8-12)
- ✅ Professional images from Unsplash

### Groups
All groups include:
- ✅ Unique course codes (MATH301, CS101, etc.)
- ✅ Subject categorization
- ✅ Teacher information with user references
- ✅ Detailed descriptions
- ✅ Subject-appropriate images

### Carousel Items
All carousel items include:
- ✅ Marketing/promotional content
- ✅ Eye-catching images
- ✅ Clear call-to-action descriptions
- ✅ Admin user ownership

## 🔍 Database Relationships

```
User (Admin User)
├── Created 10 Products
├── Created 10 Carousel Items
└── Reviews on various products

User (John, Jane, etc.)
├── Reviews on products
└── Linked as teachers in groups

Group
└── teacher.user → User._id

Product
├── user → Admin User._id
└── reviews[].user → Various User._id

Carousel
└── user → Admin User._id
```

## 🛠️ Development Tips

1. **Testing Authentication**: Use the admin account for admin-only features
2. **Testing Reviews**: Login as different users to add varied reviews
3. **Testing Orders**: Use any user account to create test orders
4. **Resetting Data**: Run `npm run seed` anytime to reset to fresh data

## 📱 Frontend Testing

If you have a frontend connected, you can now:
- ✅ Login with test credentials
- ✅ Browse products catalog
- ✅ View group listings
- ✅ See carousel banners
- ✅ Add product reviews
- ✅ Create orders
- ✅ Test admin features

## 🚀 Next Steps

1. Start your backend server: `npm run start:dev`
2. Test API endpoints with Postman or Thunder Client
3. Login as admin to access admin features
4. Login as regular user to test customer features
5. Create orders and test the full e-commerce flow

## 💡 Pro Tips

- Use MongoDB Compass to visually inspect the data: `mongodb://localhost:27017/ecommerce`
- Check relationships by examining the ObjectId references
- Passwords are properly hashed with bcrypt for security
- All documents include timestamps (createdAt, updatedAt)

## 🔄 Re-seeding

Need fresh data? Simply run:
```bash
npm run seed
```

This will:
1. ❌ Delete all existing data
2. ✅ Insert fresh sample data
3. ✅ Recreate all relationships
4. ✅ Add sample reviews

---

**Happy Testing! 🎉**

