# Frontend Changes for NestJS Backend Integration

## 📋 Summary

**Changes Required**: 3 lines of code in 2 files
**Difficulty**: Very Easy
**Time**: 2 minutes

---

## ✅ Changes Needed

### Change 1: Login Endpoint
**File**: `frontend/src/actions/userActions.js`
**Line**: 43

**Before (Express):**
```javascript
const { data } = await axios.post(
  '/api/users/login',
  { email, password },
  config
)
```

**After (NestJS):**
```javascript
const { data } = await axios.post(
  '/api/auth/login',
  { email, password },
  config
)
```

---

### Change 2: Register Endpoint
**File**: `frontend/src/actions/userActions.js`
**Line**: 90

**Before (Express):**
```javascript
const { data } = await axios.post(
  '/api/users',
  { name, email, password },
  config
)
```

**After (NestJS):**
```javascript
const { data } = await axios.post(
  '/api/auth/register',
  { name, email, password },
  config
)
```

---

### Change 3: Payment Gateway Endpoint
**File**: `frontend/src/actions/orderActions.js`
**Line**: 124

**Before (Express):**
```javascript
const { data } = await axios.get(`/api/combank/${id}`, config);
```

**After (NestJS):**
```javascript
const { data } = await axios.get(`/api/payments/combank/${id}`, config);
```

---

## 📝 All Other Endpoints - NO CHANGES NEEDED! ✅

The following remain exactly the same:

### Users
- ✅ `/api/users` (GET, POST, PUT, DELETE)
- ✅ `/api/users/profile` (GET, PUT)
- ✅ `/api/users/:id` (GET, PUT, DELETE)

### Products
- ✅ `/api/products` (GET, POST)
- ✅ `/api/products/:id` (GET, PUT, DELETE)
- ✅ `/api/products/:id/reviews` (POST)
- ✅ `/api/products/top` (GET)

### Orders
- ✅ `/api/orders` (GET, POST)
- ✅ `/api/orders/:id` (GET)
- ✅ `/api/orders/:id/pay` (PUT)
- ✅ `/api/orders/:id/deliver` (PUT)
- ✅ `/api/orders/myorders` (GET)

### Groups
- ✅ `/api/groups` (All methods)
- ✅ `/api/groups/:id` (All methods)

### Carousel
- ✅ `/api/carousel` (All methods)
- ✅ `/api/carousel/:id` (All methods)

### Uploads
- ✅ `/api/upload` (POST)

---

## 🎯 Migration Strategy

### Option 1: Make Changes and Switch (Recommended)
1. Update the 3 lines in frontend
2. Switch proxy to NestJS backend
3. Test thoroughly
4. Deploy

### Option 2: Keep Both Backends Running
1. Keep Express on port 5001
2. Run NestJS on port 5002
3. Test NestJS with updated frontend
4. Switch when confident

---

## 🔧 Quick Update Commands

I can make these changes for you automatically:

**Change 1:**
```bash
# Update login endpoint
sed -i '' "s|'/api/users/login'|'/api/auth/login'|g" frontend/src/actions/userActions.js
```

**Change 2:**
```bash
# Update register endpoint (line 90 specifically)
sed -i '' "90s|'/api/users'|'/api/auth/register'|" frontend/src/actions/userActions.js
```

**Change 3:**
```bash
# Update payment endpoint
sed -i '' "s|/api/combank/|/api/payments/combank/|g" frontend/src/actions/orderActions.js
```

---

## 📊 Impact Analysis

### Breaking Changes: ❌ NONE
- Same request/response format
- Same authentication mechanism (JWT)
- Same data structures
- Same error handling

### New Features: ✅ MANY
- Better error messages (from DTOs)
- Validation errors are more descriptive
- Type-safe responses
- Better performance

---

## 🧪 Testing Checklist

After making changes, test:

- [ ] User registration
- [ ] User login
- [ ] Token storage in localStorage
- [ ] Protected routes
- [ ] Admin routes
- [ ] Product CRUD
- [ ] Order creation
- [ ] Payment gateway
- [ ] File uploads
- [ ] Logout functionality

---

## ⚠️ Potential Issues & Solutions

### Issue 1: Different Error Message Format
**Express Error:**
```json
{ "message": "Invalid email or password" }
```

**NestJS Error:**
```json
{
  "statusCode": 401,
  "message": "Invalid email or password",
  "error": "Unauthorized"
}
```

**Solution**: Your frontend error handling already checks for `error.response.data.message` so it will work fine! ✅

### Issue 2: Validation Errors
**NestJS returns more detailed validation errors:**
```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password must be longer than or equal to 6 characters"
  ],
  "error": "Bad Request"
}
```

**Solution**: Handle array of messages in error handling if needed.

---

## 🚀 Ready to Update?

**Total Changes**: 3 lines in 2 files
**Risk**: Very Low
**Time**: 2 minutes

Would you like me to make these changes automatically?

