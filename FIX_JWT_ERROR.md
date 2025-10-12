# 🔧 Fix JWT Error - "secretOrPrivateKey must have a value"

## Error
```
Error: secretOrPrivateKey must have a value
```

## Cause
Your `.env` file is missing the `JWT_SECRET` configuration.

---

## ✅ Quick Fix

### Step 1: Open .env file
```bash
cd /Users/mac/nodejs-projects/gugu/gugu-saloon
open .env
```

### Step 2: Add these lines

```env
# JWT Configuration
JWT_SECRET=6e0134f6e6c2f14f5facced7270fb917e4ae161a060b7c67b76304ec7e3882f570651ad7b6aafb82233f419c638413a09ebedd6d7a0b1ddf26c81ed6fb9d2d52
JWT_EXPIRES_IN=24h
```

### Step 3: Save the file and restart server

```bash
node server.js
```

---

## 📋 Complete .env File Should Look Like:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=gugu
DB_CONNECTION_TIMEOUT=10

PORT=4000

# JWT Configuration
JWT_SECRET=6e0134f6e6c2f14f5facced7270fb917e4ae161a060b7c67b76304ec7e3882f570651ad7b6aafb82233f419c638413a09ebedd6d7a0b1ddf26c81ed6fb9d2d52
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=http://localhost:3001,http://localhost:4000

# SMS Configuration (Beem Africa) - Optional for now
BEEM_API_KEY=your_api_key_here
BEEM_SECRET_KEY=your_secret_key_here
BEEM_SENDER_ID=GUGU
ADMIN_PHONE=0762996305
BEEM_API_URL=https://apisms.beem.africa/v1/send
```

---

## ✅ After Adding JWT_SECRET:

1. **Save** the `.env` file
2. **Restart** the server: `node server.js`
3. **Try logging in** again with phone: `0762996305`

---

**That's it! The JWT_SECRET is now configured and login will work!** 🎉

