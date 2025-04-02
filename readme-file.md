# Golden Age - Application for Elderly Care Facilities

## Overview
Golden Age is a mobile application designed specifically for residents of elderly care facilities. The application offers an intuitive user interface with large touch targets, clear typography, and straightforward navigation to make it accessible for elderly users.

The app provides residents with easy access to:
- Restaurant hours and daily menus
- Scheduled activities and events
- Messaging system to communicate with staff
- Medical information and appointments
- Emergency assistance

The application supports both Hebrew and English languages, with Hebrew as the default.

## Technology Stack

### Frontend
- **React Native** (via Expo) - Cross-platform mobile framework
- **React Navigation** - For navigation between screens
- **Redux** - For state management
- **i18next** - For internationalization
- **React Native Paper** - UI component library

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web application framework
- **PostgreSQL** - Relational database
- **JWT** - For secure authentication
- **MVC Pattern** - For code organization

## Directory Structure

```
golden-age/
├── mobile/                   # React Native Expo app
│   ├── assets/               # Images, fonts and other static assets
│   ├── components/           # Reusable UI components
│   │   ├── common/           # Common components like buttons, inputs, etc.
│   │   └── screens/          # Screen-specific components
│   ├── constants/            # App constants
│   ├── hooks/                # Custom React hooks
│   ├── i18n/                 # Internationalization files
│   │   ├── en/               # English translations
│   │   └── he/               # Hebrew translations
│   ├── navigation/           # React Navigation configuration
│   ├── screens/              # App screens
│   ├── services/             # API services
│   ├── store/                # Redux store setup
│   │   ├── actions/          # Redux actions
│   │   ├── reducers/         # Redux reducers
│   │   └── slices/           # Redux Toolkit slices
│   ├── utils/                # Utility functions
│   ├── App.js                # Root App component
│   └── app.json              # Expo configuration
└── server/                   # Backend Express server
    ├── config/               # Configuration files
    ├── controllers/          # Express controllers (MVC)
    ├── middleware/           # Custom middleware
    ├── models/               # Database models
    ├── routes/               # Express routes
    ├── services/             # Business logic services
    ├── utils/                # Utility functions
    ├── app.js                # Express application setup
    └── server.js             # Server entry point
```

## Installation

### Prerequisites
- Node.js (v16 or later)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- PostgreSQL (v12 or later)

### Setting up the backend
1. Navigate to the server directory:
   ```
   cd golden-age/server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the server directory with the following environment variables:
   ```
   PORT=3000
   NODE_ENV=development
   DATABASE_URL=postgres://user:password@localhost:5432/golden_age
   JWT_ACCESS_SECRET=your_access_secret_key
   JWT_REFRESH_SECRET=your_refresh_secret_key
   ACCESS_TOKEN_EXPIRY=15m
   REFRESH_TOKEN_EXPIRY=7d
   ```

4. Set up the PostgreSQL database:
   ```
   npx sequelize-cli db:create
   npx sequelize-cli db:migrate
   ```

5. Start the backend server:
   ```
   npm run dev
   ```

### Setting up the frontend
1. Navigate to the mobile directory:
   ```
   cd golden-age/mobile
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the mobile directory with the following environment variables:
   ```
   API_URL=http://localhost:3000/api
   ```

4. Start the Expo development server:
   ```
   expo start
   ```

5. Use the Expo Go app on your mobile device or an emulator to test the application.

## Accessibility Features

Golden Age is designed with elderly users in mind and includes the following accessibility features:

- Large touch targets for easier interaction
- High contrast color schemes
- Customizable text sizes
- Dark/light mode toggle
- Simple, intuitive navigation
- Voice-guided assistance for key features
- Emergency help button accessible from all screens

## Multilingual Support

The application supports both Hebrew and English languages. Hebrew is set as the default language, with the option to switch to English through the settings menu.

## Screenshots

(Screenshots of the application to be added here)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
