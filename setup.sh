#!/bin/bash

echo "🚀 Setting up ReviseIt - LeetCode Revision Platform"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2)
REQUIRED_VERSION="18.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please install Node.js v18 or higher."
    exit 1
fi

echo "✅ Node.js version $NODE_VERSION detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm run install:all

# Create environment files
echo "⚙️  Setting up environment files..."

# Backend .env
if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo "📝 Created backend/.env from example"
    echo "⚠️  Please update the following in backend/.env:"
    echo "   - MONGODB_URI (if using a different MongoDB setup)"
    echo "   - JWT_SECRET (generate a secure random string)"
    echo "   - GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET (from GitHub OAuth App)"
else
    echo "✅ backend/.env already exists"
fi

# Frontend .env
if [ ! -f "frontend/.env" ]; then
    cp frontend/.env.example frontend/.env
    echo "📝 Created frontend/.env from example"
else
    echo "✅ frontend/.env already exists"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Set up MongoDB (local or cloud)"
echo "2. Create a GitHub OAuth App:"
echo "   - Go to GitHub Settings > Developer settings > OAuth Apps"
echo "   - Create new app with callback URL: http://localhost:3000/auth/callback"
echo "   - Update GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in backend/.env"
echo "3. Update JWT_SECRET in backend/.env with a secure random string"
echo "4. Run 'npm run dev' to start both frontend and backend"
echo ""
echo "📚 For detailed setup instructions, see README.md"
