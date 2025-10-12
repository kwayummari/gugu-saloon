# 📋 Available Commands

## 🗄️ Database Migrations

### Run all pending migrations
```bash
npm run migrate
```

### Check migration status (planned)
```bash
npm run migrate:status
```

---

## 🚀 Server Commands

### Start the server
```bash
node server.js
```

### Start with auto-reload (if nodemon installed)
```bash
nodemon server.js
```

---

## 📦 Package Management

### Install all dependencies
```bash
npm install
```

### Install a new package
```bash
npm install <package-name>
```

### Update packages
```bash
npm update
```

---

## 🔍 Database Commands

### Connect to MySQL
```bash
mysql -u root -p gugu
```

### Check migrations
```sql
SELECT * FROM migrations ORDER BY id;
```

### Check login history
```sql
SELECT * FROM login_history ORDER BY login_time DESC LIMIT 10;
```

### View hairdresser structure
```sql
DESCRIBE hairdresser;
```

---

## 🧪 Testing

### Test SMS service
```bash
node -e "
const { sendSMS } = require('./services/smsService');
sendSMS('0762996305', 'Test SMS 🎉').then(console.log);
"
```

### Test login endpoint
```bash
curl -X POST http://localhost:4000/loginHairDresser \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "name=Noreen gustaving macha&password=YourPassword123!"
```

---

## 📊 Useful Queries

### Count total logins
```sql
SELECT COUNT(*) as total_logins FROM login_history;
```

### Today's logins
```sql
SELECT * FROM login_history 
WHERE DATE(login_time) = CURDATE() 
ORDER BY login_time DESC;
```

### SMS delivery stats
```sql
SELECT 
  sms_sent,
  COUNT(*) as count
FROM login_history
GROUP BY sms_sent;
```

### Most active users
```sql
SELECT 
  user_name,
  COUNT(*) as login_count,
  MAX(login_time) as last_login
FROM login_history
GROUP BY user_name
ORDER BY login_count DESC
LIMIT 10;
```

---

## 🔧 Development

### Check Node version
```bash
node --version
```

### Check npm version
```bash
npm --version
```

### List installed packages
```bash
npm list --depth=0
```

### Check for vulnerabilities
```bash
npm audit
```

### Fix vulnerabilities
```bash
npm audit fix
```

---

## 📝 Logs

### View server logs (if using PM2)
```bash
pm2 logs
```

### View specific log
```bash
tail -f logs/error.log
```

---

## 🎯 Quick Setup (New Environment)

```bash
# 1. Navigate to project
cd /Users/mac/nodejs-projects/gugu/gugu-saloon

# 2. Install dependencies
npm install

# 3. Configure .env
cp .env.example .env
# Then edit .env with your credentials

# 4. Run migrations
npm run migrate

# 5. Start server
node server.js
```

---

## 🆘 Troubleshooting

### Clear node_modules and reinstall
```bash
rm -rf node_modules package-lock.json
npm install
```

### Reset migrations (CAREFUL!)
```sql
-- This will re-run all migrations
TRUNCATE TABLE migrations;
```

### Check database connection
```bash
node -e "
const mysql = require('mysql2');
const conn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'gugu'
});
conn.connect(err => {
  if (err) console.error('❌ Error:', err);
  else console.log('✅ Connected!');
  conn.end();
});
"
```

---

**Keep this file handy for quick reference!** 📚

