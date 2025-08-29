# Zenaris - AI-Powered Meal Preferences Management

> **An accessibility/mobile-first, React-based web application for managing elderly care meal preferences with AI assistance and real-time conflict detection.**

## 🎯 Overview

Zenaris is a comprehensive meal preference management system designed specifically for elderly care facilities, families, and caregivers. The application provides an intuitive interface for recording, managing, and tracking dietary preferences, allergies, and special requirements while ensuring meal safety through AI-powered conflict detection.

### ✨ Key Features

- ** Multi-Person Management** - Support for multiple elderly residents with individual profiles
- ** AI-Powered Assistance** - Intelligent meal suggestions and voice input capabilities  
- ** Safety-First Design** - Real-time allergy and dietary conflict detection
- ** Fully Responsive** - Mobile-first design with desktop optimization
- ** Accessibility Focused** - WCAG compliant with comprehensive keyboard navigation
- ** Auto-Save** - Persistent data storage with change history tracking
- ** Export Capabilities** - Multiple export formats for meal planning
- ** Modern UI/UX** - Clean, intuitive interface built with Tailwind CSS



## 🛠️ Technology Stack

### Core Technologies
- **React 19** - Latest React with concurrent features
- **TypeScript** - Full type safety and developer experience
- **Vite** - Lightning-fast development and build tool
- **Tailwind CSS v4** - Modern utility-first styling

### UI Components & Design
- **Radix UI** - Accessible, unstyled UI primitives
- **Lucide React** - Beautiful, customizable icons
- **Framer Motion** - Smooth animations and interactions
- **React Day Picker** - Calendar and date selection
- **Sonner** - Modern toast notifications

### Data & Validation
- **Zod** - Runtime type validation and parsing
- **React Query** - Server state management (future backend integration)
- **Local Storage** - Client-side data persistence

### Development & Quality
- **ESLint** - Code linting with React-specific rules
- **TypeScript ESLint** - Type-aware linting
- **Vite Dev Tools** - Hot module replacement and debugging

## 🏗️ Project Structure

```
zenaris/
├── public/                     # Static assets and PWA icons
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── ai/               # AI-powered components
│   │   │   ├── AIAutocomplete.tsx
│   │   │   ├── AIFavoritesList.tsx
│   │   │   ├── UnifiedAIButton.tsx
│   │   │   └── MobileAIInterface.tsx
│   │   ├── ui/               # Base UI components (Radix-based)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── tabs.tsx
│   │   ├── DataManager.tsx   # Data persistence logic
│   │   ├── MealSuggestions.tsx
│   │   ├── ProgressBar.tsx
│   │   └── UndoToast.tsx
│   ├── utils/                # Utility functions and validation
│   │   ├── DataValidation.tsx
│   │   ├── button-variants.ts
│   │   └── use-mobile.ts
│   ├── App.tsx              # Main application component
│   ├── main.tsx             # React entry point
│   └── index.css            # Global styles and Tailwind imports
├── package.json
├── tailwind.config.js       # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite build configuration
└── future_plans.md         # Roadmap and expansion plans
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or later)
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/umutsesen/zenaris-web.git
   cd zenaris
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open in browser**
   ```
   http://localhost:5173
   ```

### Build for Production

```bash
# Build the application
npm run build

# Preview production build locally
npm run preview
```

## 💡 Usage Guide

### Getting Started
1. **Select or Add a Person** - Use the dropdown to select an existing resident or add a new profile
2. **Add Favorites** - Record foods the person enjoys using the AI assistant or manual entry
3. **Record Dislikes** - Note foods to avoid with severity levels (mild, moderate, absolute)
4. **Document Allergies** - Critical safety information with mild/severe classifications
5. **Special Notes** - Additional dietary requirements, textures, cultural preferences

### AI Features
- **Voice Input** - Click the microphone icon for hands-free entry
- **Smart Suggestions** - AI analyzes preferences to suggest suitable meals
- **Conflict Detection** - Automatic alerts when foods conflict with allergies or dislikes
- **Meal Planning** - Generate complete daily meal plans based on preferences

### Safety Features
- **Real-time Validation** - Immediate feedback on potential conflicts
- **Visual Indicators** - Color-coded safety levels (green=safe, yellow=caution, red=avoid)
- **Emergency Contacts** - Quick access to caregiver information
- **Export Options** - Share meal plans with kitchen staff or family

##  Configuration

### Environment Variables
Currently, the application runs entirely client-side with no backend dependencies. Future backend integration will require:

```env
# Future backend configuration
VITE_API_URL=https://api.zenaris.com
VITE_AI_SERVICE_URL=https://ai.zenaris.com
```

### Customization
- **Colors**: Modify `tailwind.config.js` for brand customization
- **Components**: UI components in `src/components/ui/` are fully customizable
- **AI Prompts**: AI behavior can be adjusted in `src/components/ai/` components

##  Data Structure

### Core Data Types

```typescript
interface Elder {
  id: string;
  name: string;
  initial: string;
  birthday: string;
  status: string;
  lastOnline: string;
  emergencyContact?: string;
  primaryCaregiver?: string;
}

interface Food {
  id: string;
  name: string;
  category?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

interface Allergy {
  id: string;
  label: string;
  severity: 'mild' | 'severe';
}

interface DislikedFood {
  id: string;
  name: string;
  level: 'mild' | 'moderate' | 'absolute';
}
```

## 🔮 Future Roadmap

See [future_plans.md](./future_plans.md) for the complete expansion plan



*Zenaris - Making meal management safer, smarter, and more accessible for everyone.*