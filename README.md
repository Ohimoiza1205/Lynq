# Lynq

**AI-Powered VideoDoc Platform for Healthcare Training**

Lynq transforms medical education by providing intelligent video analysis, interactive learning tools, and comprehensive training documentation for healthcare professionals.

## Overview

Lynq is a comprehensive healthcare training platform that leverages artificial intelligence to analyze medical videos, generate interactive content, and create structured learning experiences. The platform supports bulk video import, real-time Q&A, automated quiz generation, and detailed progress tracking.

## Key Features

### Video Intelligence
- **Automated Transcription**: Generate accurate transcripts for medical procedures and training videos
- **Smart Segmentation**: AI-powered detection of procedural steps and key moments
- **Anomaly Detection**: Identify irregularities, tool slips, and critical events
- **Timeline Markers**: Interactive navigation with hover tooltips and instant seeking

### Interactive Learning
- **Natural Language Q&A**: Ask questions about video content with timestamp-linked answers
- **Automated Quiz Generation**: AI-created assessments with multiple choice, short answer, and identification questions
- **Procedural Checklists**: Step-by-step guidance with progress tracking
- **Study Plans**: Personalized learning paths with session blocks

### Content Management
- **Bulk Import**: Discover and import medical videos from YouTube using healthcare taxonomy
- **Medical Classification**: Automatic tagging by specialty (oncology, neurosurgery, orthopedics)
- **Searchable Library**: Filter by procedure type, duration, and medical tags
- **Export Capabilities**: Generate PDF reports and CSV data for training records

### Security & Access Control
- **Role-Based Permissions**: Uploader, Reviewer, and Admin access levels
- **Secure Authentication**: Auth0 integration with Google and email login
- **HIPAA-Ready Architecture**: Secure file handling and data protection

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for responsive design
- **Vite** for fast development and building
- **Auth0** for authentication

### Backend
- **Node.js** with Express and TypeScript
- **MongoDB Atlas** with Vector Search
- **Cloudflare Workers** for serverless processing
- **Cloudflare R2** for secure file storage

### AI & Analytics
- **Twelve Labs API** for video understanding and embeddings
- **Google Gemini API** for content synthesis and Q&A
- **YouTube Data API v3** for content discovery

## Project Structure

```
lynq/
├── frontend/               # React TypeScript application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API integration
│   │   └── types/          # TypeScript definitions
├── backend/                # Node.js Express API
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Authentication and validation
│   │   ├── models/         # Database schemas
│   │   ├── routes/         # API endpoints
│   │   └── services/       # External API integrations
├── workers/                # Cloudflare Workers
│   ├── import-jobs/        # Bulk import processing
│   └── file-processing/    # Video analysis pipeline
├── docs/                   # Documentation
└── config/                 # Environment configurations
```

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- MongoDB Atlas account
- Required API keys (see setup documentation)

### Required API Keys

- **Auth0**: Domain, Client ID, Client Secret
- **MongoDB Atlas**: Connection string
- **Twelve Labs API**: API key for video analysis
- **Google Gemini API**: API key for AI processing
- **YouTube Data API v3**: API key for content discovery
- **Cloudflare**: Workers and R2 storage tokens

### Installation

1. Clone the repository
```bash
git clone https://github.com/Ohimoiza1205/Lynq.git
cd Lynq
```

2. Install frontend dependencies
```bash
cd frontend
npm install
```

3. Install backend dependencies
```bash
cd ../backend
npm install
```

4. Configure environment variables
```bash
cp .env.example .env
# Edit .env with your API keys and configuration
```

5. Start development servers
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## API Documentation

### Core Endpoints

- `POST /api/import/youtube` - Bulk import from YouTube
- `POST /api/videos` - Upload video files
- `POST /api/videos/:id/index` - Process video with AI
- `GET /api/videos/:id/segments` - Retrieve video segments
- `POST /api/videos/:id/qa` - Ask questions about video content
- `GET /api/videos/:id/quiz` - Generate quiz questions
- `GET /api/videos/:id/export` - Export training data

### Authentication

All API endpoints require valid Auth0 JWT tokens. Role-based access control ensures appropriate permissions for different user types.

## Deployment

### Development
```bash
docker-compose up -d
```

### Production
Deploy using Cloudflare Workers for serverless scaling and MongoDB Atlas for managed database hosting.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For questions, issues, or feature requests, please open an issue on GitHub or contact the development team.

## Acknowledgments

- Twelve Labs for advanced video understanding capabilities
- Google Gemini for AI-powered content generation
- MongoDB Atlas for vector search and database hosting
- Cloudflare for edge computing and storage solutions