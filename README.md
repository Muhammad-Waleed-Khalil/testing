# Mock Interview Platform

A modern web application built with React, TypeScript, and Vite that provides an interactive mock interview experience.

## Features

- **Mock Interviews**: Practice interviews with AI-generated questions
- **CV Upload**: Upload and analyze your CV/resume
- **Real-time Recording**: Record your interview answers
- **Dashboard**: Track your progress and performance
- **Authentication**: Secure sign-in and sign-up functionality
- **Feedback System**: Get detailed feedback on your interview performance
- **Responsive Design**: Works seamlessly across all devices

## Tech Stack

- React 18 with TypeScript
- Vite for fast development and building
- Firebase for authentication and data storage
- TailwindCSS for styling
- Shadcn/UI for component library

## Project Structure

```
src/
├── components/      # Reusable UI components
├── routes/          # Application routes and pages
├── layouts/         # Layout components
├── config/         # Configuration files
├── handlers/       # Auth and other handlers
├── lib/           # Utility functions
├── provider/      # Context providers
├── types/         # TypeScript type definitions
└── scripts/       # Helper scripts
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Start the development server:
   ```bash
   pnpm dev
   ```
4. Build for production:
   ```bash
   pnpm build
   ```

## Environment Variables

Create a `.env` file in the project root and add the following:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Key Features

- **Interactive Mock Interviews**: Practice with real interview questions
- **Real-time Feedback**: Get instant feedback on your performance
- **Profile Management**: Track your progress and history
- **CV Analysis**: Get insights on your CV/resume
- **Multiple Interview Types**: Practice different types of interviews

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request
