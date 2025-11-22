# ReviseIt - LeetCode Revision Platform

ReviseIt is an intelligent LeetCode revision platform that helps you track, analyze, and systematically revise your coding problems using AI-powered insights.

## Features

### 🧠 AI-Powered Analysis
- **Code Pattern Recognition**: Automatically identifies algorithms and data structures used
- **Complexity Analysis**: Estimates time and space complexity
- **Optimization Suggestions**: AI-generated recommendations for code improvement
- **Similar Problem Detection**: Finds related problems based on patterns and topics

### 📊 Smart Revision System
- **Weekly & Biweekly Revision**: Automated scheduling based on spaced repetition
- **Confidence-Based Prioritization**: Problems with low confidence scores get higher priority
- **Interview Topic Focus**: Special attention to critical interview topics (graphs, trees, DP)
- **Performance Tracking**: Track your solving speed and accuracy over time

### 📈 Comprehensive Analytics
- **Progress Visualization**: Charts showing improvement over time
- **Topic Distribution**: See which areas you've covered and which need attention
- **Difficulty Balance**: Track your progress across Easy, Medium, and Hard problems
- **Weak Area Identification**: AI identifies topics that need more practice

### 🔗 GitHub Integration
- **Automatic Sync**: Sync your LeetCode solutions from GitHub repositories
- **Code Analysis**: Parse solution files to extract problem URLs and code
- **Multi-Language Support**: Works with Python, JavaScript, Java, C++, and more

## Tech Stack

### Backend
- **Node.js** with **TypeScript**
- **Express.js** for REST API
- **MongoDB** with **Mongoose** for data persistence
- **JWT** for authentication
- **GitHub OAuth** for user authentication
- **Axios** for external API calls

### Frontend
- **React** with **TypeScript**
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Lucide React** for icons
- **Axios** for API communication

## Project Structure

```
ReviseIt/
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Auth middleware
│   │   └── app.ts         # Express app setup
│   ├── package.json
│   └── tsconfig.json
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API services
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Utility functions
│   ├── package.json
│   └── vite.config.ts
├── shared/                # Shared types
│   └── types/
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud)
- GitHub OAuth App (for authentication)
- OpenAI API Key OR Gemini API Key (for AI-powered analysis)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SRIKARREDDY-dotorg/ReviseIt.git
   cd ReviseIt
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Set up environment variables**

   Backend (`.env`):
   ```env
   MONGODB_URI=mongodb://localhost:27017/reviseit
   JWT_SECRET=your-super-secret-jwt-key-here
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret
   GITHUB_REDIRECT_URI=http://localhost:3000/auth/callback
   FRONTEND_URL=http://localhost:3000
   PORT=5000
   NODE_ENV=development
   OPENAI_API_KEY=your-openai-api-key-here
   GEMINI_API_KEY=your-gemini-api-key-here
   ```

   Frontend (`.env`):
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

5. **Start the development servers**

   Backend:
   ```bash
   cd backend
   npm run dev
   ```

   Frontend (in a new terminal):
   ```bash
   cd frontend
   npm run dev
   ```

### GitHub OAuth Setup

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App with:
   - Application name: ReviseIt
   - Homepage URL: http://localhost:3000
   - Authorization callback URL: http://localhost:3000/auth/callback
3. Copy the Client ID and Client Secret to your backend `.env` file

### AI API Setup (Choose One)

**Option 1: Gemini (Free)**
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Add the API key to your backend `.env` file as `GEMINI_API_KEY`
4. Free tier: 15 requests/minute with gemini-1.5-flash model

**Option 2: OpenAI (Paid)**
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Add the API key to your backend `.env` file as `OPENAI_API_KEY`
4. Cost: ~$0.002 per analysis

**Note**: System tries Gemini first (if available), then OpenAI, then falls back to pattern matching

## Usage

1. **Sign in with GitHub**: Use your GitHub account to authenticate
2. **Sync Problems**: Connect your GitHub repository containing LeetCode solutions
3. **Review Dashboard**: See your progress overview and statistics
4. **Practice Revision**: Work through your AI-generated revision queue
5. **Analyze Performance**: Use the analytics page to identify improvement areas

## API Endpoints

### Authentication
- `GET /api/auth/github/url` - Get GitHub OAuth URL
- `POST /api/auth/github/callback` - Handle GitHub OAuth callback

### Problems
- `GET /api/problems` - Get user's problems with pagination and filters
- `POST /api/problems/sync` - Sync problems from GitHub repository
- `GET /api/problems/:id` - Get specific problem details
- `PUT /api/problems/:id` - Update problem (confidence, notes, etc.)
- `DELETE /api/problems/:id` - Delete a problem

### Revision
- `GET /api/revision/queue` - Get AI-generated revision queue
- `POST /api/revision/complete` - Complete a revision session
- `GET /api/revision/history/:problemId` - Get revision history for a problem
- `GET /api/revision/stats` - Get revision statistics

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard analytics
- `GET /api/analytics/problems` - Get detailed problem analytics
- `GET /api/analytics/performance` - Get performance trends

### AI Features
- `GET /api/ai/similar/:problemId` - Get similar problems
- `POST /api/ai/analyze` - Analyze code patterns and complexity
- `GET /api/ai/optimize/:problemId` - Get optimization suggestions
- `GET /api/ai/study-recommendations` - Get personalized study recommendations
- `GET /api/ai/interview-prep` - Get interview preparation insights

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- LeetCode for providing the platform for coding practice
- GitHub for hosting code repositories
- The open-source community for the amazing tools and libraries used in this project
