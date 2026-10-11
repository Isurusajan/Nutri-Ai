# Nutri AI

An AI-powered nutrition and health assistance platform consisting of web, mobile, and backend services.

## Project Structure

```
├── backend/       # FastAPI Python backend (AI models & API services)
├── web/           # Vite + React web application
├── mobile/        # React Native / Expo mobile application
├── Documents/     # Project documentation & design assets
└── README.md
```

## Getting Started

### Backend
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the development server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Web
1. Navigate to the `web` folder:
   ```bash
   cd web
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```

### Mobile
1. Navigate to the `mobile` folder:
   ```bash
   cd mobile
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Expo development server:
   ```bash
   npx expo start
   ```

## License
MIT
