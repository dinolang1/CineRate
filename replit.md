# CineRate - Movie Rating Application

## Overview

CineRate is a full-stack movie rating and review application that allows users to discover movies, write reviews, and rate films on a scale of 1-10. The application features a modern cinema-themed interface with movie trailers, detailed movie information, and user profile management. Built as a single-page application with React frontend and Express backend, it provides a comprehensive platform for movie enthusiasts to track and share their viewing experiences.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development practices
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: shadcn/ui component library built on Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS for utility-first styling with custom cinema theme variables
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework for RESTful API endpoints
- **Language**: TypeScript with ES modules for modern JavaScript development
- **Development**: tsx for TypeScript execution in development mode
- **Production**: esbuild for bundling server code for production deployment

### Database & ORM
- **Database**: PostgreSQL as the primary database (configured for Neon serverless)
- **ORM**: Drizzle ORM for type-safe database operations and migrations
- **Schema**: Centralized schema definitions in shared directory for type consistency
- **Migrations**: Drizzle Kit for database schema management and migrations

### Authentication & Session Management
- **Authentication**: Custom authentication service with local storage persistence
- **Session Storage**: Browser storage (localStorage/sessionStorage) for client-side auth state
- **Password Security**: Basic password storage (Note: production should implement proper hashing)

### Data Models
- **Users**: Username, email, password, profile picture, and timestamps
- **Movies**: Title, description, poster paths, trailer URLs, year, duration, genres, cast, director, and aggregated ratings
- **Reviews**: User ratings (1-10 scale), review text, and timestamps with user-movie relationships

### API Design
- **Authentication Routes**: `/api/auth/register`, `/api/auth/login`
- **Movie Routes**: `/api/movies` with filtering by genre and search functionality
- **Review Routes**: `/api/reviews` for CRUD operations on user reviews
- **RESTful Conventions**: Standard HTTP methods and status codes for consistent API behavior

### Development Tools
- **Hot Reload**: Vite HMR for frontend and tsx watch mode for backend development
- **Type Checking**: Shared TypeScript configuration across frontend, backend, and shared modules
- **Code Quality**: ESLint and TypeScript strict mode for code consistency
- **Error Handling**: Runtime error overlays in development mode

### File Organization
- **Monorepo Structure**: Client, server, and shared code in separate directories
- **Shared Types**: Common TypeScript interfaces and schemas in shared directory
- **Component Architecture**: Organized UI components with separation of concerns
- **Asset Management**: Static assets served from attached_assets directory

## External Dependencies

### UI and Styling
- **@radix-ui/***: Comprehensive set of accessible UI primitives for building the component library
- **tailwindcss**: Utility-first CSS framework for responsive design and theming
- **lucide-react**: Icon library for consistent iconography throughout the application
- **class-variance-authority**: Utility for creating component variants with Tailwind CSS

### Data Management
- **@tanstack/react-query**: Server state management with caching, background updates, and synchronization
- **react-hook-form**: Performant form library with minimal re-renders
- **@hookform/resolvers**: Integration layer for form validation libraries
- **zod**: TypeScript-first schema validation for forms and API validation

### Database and ORM
- **drizzle-orm**: Type-safe ORM for PostgreSQL with excellent TypeScript integration
- **drizzle-kit**: Migration and schema management tools for Drizzle ORM
- **@neondatabase/serverless**: Serverless PostgreSQL driver optimized for edge environments

### Development and Build
- **vite**: Next-generation frontend tooling for fast development and optimized builds
- **tsx**: TypeScript execution environment for Node.js development
- **esbuild**: Fast JavaScript bundler for production server builds
- **wouter**: Minimalist routing library for React applications

### Utility Libraries
- **date-fns**: Modern date utility library for date formatting and manipulation
- **clsx**: Utility for constructing className strings conditionally
- **nanoid**: URL-safe unique string ID generator for database records