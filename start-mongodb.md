# MongoDB Integration Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start MongoDB

Make sure MongoDB is running on your system:

**Windows:**

```bash
# If MongoDB is installed as a service
net start MongoDB

# Or start manually
mongod --dbpath C:\data\db
```

**macOS:**

```bash
# If installed via Homebrew
brew services start mongodb-community

# Or start manually
mongod --config /usr/local/etc/mongod.conf
```

**Linux:**

```bash
# Start MongoDB service
sudo systemctl start mongod

# Or start manually
mongod --dbpath /var/lib/mongodb
```

### 3. Start the Server

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

## 🔧 Configuration

### Environment Variables (.env)

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/thenewscurator
SESSION_SECRET=your-session-secret-change-this

# Server Configuration
PORT=3001
NODE_ENV=development

# FTP Configuration (for static file deployment)
FTP_HOST=ftp.thenewscurator.com
FTP_USER=deploy@thenewscurator.com
FTP_PASSWORD=your-ftp-password
remoteDir=/
```

## 📊 Database Schema

### Article Collection

- **title**: String (required, min 5 chars)
- **slug**: String (required, unique, min 3 chars)
- **category**: String (enum: General, World, Technology, etc.)
- **author**: String (default: "Admin")
- **spot_number**: Mixed (numbers or letters: 1, 2, A, B, etc.)
- **content**: String (required)
- **excerpt**: String
- **sources**: String
- **published**: Boolean
- **publishedAt**: Date
- **All comprehensive fields**: special*report*\*, suggested_reading, bias_analysis, etc.

## 🌐 API Endpoints

### Articles

- `GET /api/articles` - Get all articles
- `GET /api/articles/:slug` - Get single article
- `POST /api/articles` - Create new article
- `PUT /api/articles/:slug` - Update article
- `DELETE /api/articles/:slug` - Delete article
- `GET /api/articles/category/:category` - Get articles by category
- `GET /api/articles/position/:position` - Get articles by position

### Health Check

- `GET /api/health` - Server and database status

## 🎯 Features

### ✅ What's Working

- **Full CRUD Operations**: Create, Read, Update, Delete articles
- **MongoDB Integration**: All form data saved to database
- **Alphanumeric Positions**: Support for 1, 2, A, B, etc.
- **Category Management**: Organized by news categories
- **Comprehensive Fields**: All verification and analysis fields
- **Edit Mode**: Load existing articles for editing
- **Validation**: Client and server-side validation
- **Error Handling**: Proper error messages and status updates

### 🔄 Form Workflow

1. **Create New**: Fill form → Save to MongoDB → Success message
2. **Edit Existing**: Enter slug → Click "Edit" → Form loads → Modify → Update
3. **Delete**: Enter slug → Click "Delete" → Confirm → Article removed
4. **AI Integration**: Verification data auto-populates all fields

## 🛠️ Troubleshooting

### MongoDB Connection Issues

1. Ensure MongoDB is running
2. Check MONGODB_URI in .env file
3. Verify database permissions
4. Check firewall settings

### Form Submission Errors

1. Check browser console for errors
2. Verify all required fields are filled
3. Ensure slug is unique
4. Check server logs for detailed errors

## 📱 Usage

1. **Navigate to**: `http://localhost:3001/create.html`
2. **Fill the form** with article details
3. **Set position** (1, 2, A, B, etc.)
4. **Click "Publish Article"** to save to MongoDB
5. **Use "Edit Existing"** to modify saved articles
6. **Use "Delete Article"** to remove articles

Your create.html form now saves all data to MongoDB with full CRUD functionality!
