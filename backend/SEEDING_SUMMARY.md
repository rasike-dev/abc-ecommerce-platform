# Database Seeding Summary

✅ **Successfully seeded the database with sample data!**

## What Was Inserted

### 👥 Users (10 entries)
1. **Admin User** - `admin@example.com` (Admin privileges)
2. John Doe - `john@example.com`
3. Jane Smith - `jane@example.com`
4. Michael Johnson - `michael@example.com`
5. Emily Davis - `emily@example.com`
6. David Wilson - `david@example.com`
7. Sarah Brown - `sarah@example.com`
8. Robert Taylor - `robert@example.com`
9. Lisa Anderson - `lisa@example.com`
10. James Martinez - `james@example.com`

**Default Password:** `admin123` for admin, `password123` for others

---

### 📚 Groups (10 entries)
1. **Advanced Mathematics** (MATH301) - Dr. Sarah Brown
2. **Introduction to Physics** (PHYS101) - Dr. Robert Taylor
3. **English Literature** (ENG201) - Prof. Lisa Anderson
4. **Computer Science Fundamentals** (CS101) - Dr. James Martinez
5. **Chemistry Basics** (CHEM101) - Dr. Emily Davis
6. **World History** (HIST202) - Dr. Michael Johnson
7. **Biology and Life Sciences** (BIO150) - Dr. David Wilson
8. **Business Management** (BUS301) - Prof. Jane Smith
9. **Art and Design** (ART101) - Ms. Sarah Brown
10. **Psychology 101** (PSY101) - Dr. John Doe

Each group has a teacher reference linked to a User.

---

### 🎓 Products (10 entries)
1. **Mathematics Grade 10** - Full Year Course (₹12,000)
2. **Physics Grade 11** - Mechanics (₹15,000)
3. **English Literature** - Poetry and Drama (₹10,000)
4. **Computer Science** - Python Programming (₹18,000)
5. **Chemistry Grade 10** - Organic Chemistry (₹13,500)
6. **World History** - Ancient Civilizations (₹9,500)
7. **Biology Grade 11** - Cell Biology (₹14,000)
8. **Business Studies** - Entrepreneurship (₹16,000)
9. **Art and Design** - Digital Graphics (₹11,500)
10. **Psychology** - Human Behavior (₹12,500)

Each product includes:
- User reference (creator/admin)
- 2-3 sample reviews with ratings (4-5 stars)
- Average rating calculated from reviews
- High-quality placeholder images from Unsplash

---

### 🎨 Carousel (10 entries)
1. **Summer Learning Sale** - Up to 30% Off
2. **New Computer Science Courses** Available
3. **Mathematics Mastery Program**
4. **Science Lab Simulations** Now Available
5. **Enroll Now** for Academic Year 2024
6. **Excellence in English Literature**
7. **Business and Entrepreneurship Track**
8. **Creative Arts & Design Workshops**
9. **Join Our Study Groups**
10. **Free Trial** - Test Any Course

All carousel items are linked to the admin user.

---

## Database Relationships

```
📊 Relationship Map:

Users (10)
  ├─→ Groups (10) - via teacher.user reference
  ├─→ Products (10) - via user reference (creator)
  │   └─→ Reviews (~25) - via user reference (reviewer)
  └─→ Carousel (10) - via user reference (admin)
```

---

## Quick Commands

### View the Data
```bash
# Connect to MongoDB
mongo mongodb://localhost:27017/ecommerce

# Or using MongoDB Compass
# Connect to: mongodb://localhost:27017/ecommerce
```

### Re-seed the Database
```bash
cd backend-nestjs
npm run seed
```

### Test Login
Use these credentials to test authentication:
- **Admin:** admin@example.com / admin123
- **User:** john@example.com / password123

---

## Sample Data Features

✨ **Reviews:** Each product has 2-3 authentic-looking reviews from different users
📈 **Ratings:** Calculated averages from review scores (4.0 - 4.9)
🖼️ **Images:** High-quality placeholder images from Unsplash
🔗 **References:** All relationships properly linked with ObjectIds
⏰ **Timestamps:** All documents include createdAt/updatedAt timestamps

---

## Notes

- All passwords are properly hashed using bcrypt
- User references are maintained across collections
- Sample reviews are randomly generated with realistic content
- Images use Unsplash for consistent quality
- The admin user owns all products and carousel items
- Teachers in groups are linked to corresponding users where name matches

---

**Need to clear the database?**
The seed script automatically clears existing data before inserting new records.

