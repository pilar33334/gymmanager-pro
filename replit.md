# Gym Management System

## Overview

This is a Flask-based web application for managing gym members. The system provides a comprehensive solution for registering, tracking, and managing gym memberships with a modern web interface built using Bootstrap and vanilla JavaScript.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Backend Architecture
- **Framework**: Flask (Python web framework)
- **Database**: SQLAlchemy ORM with SQLite as default (configurable via environment variables)
- **API Design**: RESTful endpoints for member management
- **Template Engine**: Jinja2 (Flask's default templating engine)

### Frontend Architecture
- **UI Framework**: Bootstrap 5 with dark theme
- **JavaScript**: Vanilla JavaScript with class-based organization
- **Icons**: Font Awesome for consistent iconography
- **Styling**: Custom CSS with CSS variables for theming

### Database Design
- **ORM**: SQLAlchemy with declarative base
- **Primary Model**: Member model with comprehensive gym member attributes
- **Data Persistence**: Automatic table creation on app startup

## Key Components

### 1. Application Structure
- **app.py**: Main Flask application with configuration and initialization
- **main.py**: Entry point for the application
- **models.py**: Database models and schemas
- **routes.py**: API endpoints and request handlers
- **templates/**: HTML templates for the web interface
- **static/**: Static assets (CSS, JavaScript, images)

### 2. Member Management Model
The Member model includes:
- Personal information (name, surname, DNI, email, phone)
- Address and birth date
- Membership details (type, start date, expiration date)
- Status tracking (active/inactive)
- Registration timestamp

### 3. API Endpoints
- `GET /api/members`: Retrieve all members with optional search functionality
- `POST /api/members`: Create new gym members
- Search capabilities across multiple fields (name, surname, DNI, email)

### 4. Frontend Components
- **GymManager Class**: Main JavaScript class handling UI interactions
- **Member Modal**: Bootstrap modal for adding/editing members
- **Search Functionality**: Real-time member search
- **Responsive Design**: Mobile-first approach with Bootstrap grid

## Data Flow

1. **User Registration**: Form data is collected via the frontend modal
2. **API Communication**: JavaScript sends JSON data to Flask backend
3. **Database Operations**: SQLAlchemy handles database transactions
4. **Response Handling**: Frontend updates UI based on API responses
5. **Search Operations**: Real-time filtering of member data

## External Dependencies

### Python Dependencies
- Flask: Web framework
- Flask-SQLAlchemy: Database ORM
- Flask-CORS: Cross-origin resource sharing
- Werkzeug: WSGI utilities and middleware

### Frontend Dependencies
- Bootstrap 5: UI framework (CDN)
- Font Awesome: Icon library (CDN)
- Vanilla JavaScript: No additional frameworks required

## Deployment Strategy

### Configuration
- Environment-based configuration for database URLs
- Secret key management via environment variables
- CORS enabled for frontend-backend communication
- Proxy fix middleware for deployment behind reverse proxies

### Database
- SQLite for development (default)
- PostgreSQL support via DATABASE_URL environment variable
- Automatic table creation on application startup
- Connection pooling and health checks configured

### Server Configuration
- Development server runs on host 0.0.0.0, port 5000
- Debug mode enabled for development
- Logging configured at DEBUG level
- Session management with configurable secret keys

### Production Considerations
- Database URL should be set via environment variables
- Session secret should be properly configured
- CORS configuration may need adjustment for production domains
- Static file serving should be handled by a web server in production

## Key Features

1. **Member Registration**: Complete member information capture
2. **Search and Filter**: Multi-field search capabilities
3. **Membership Management**: Different membership types with automatic expiration calculation
4. **Status Tracking**: Active/inactive member status
5. **Responsive Design**: Works on desktop and mobile devices
6. **Data Validation**: Both frontend and backend validation
7. **Error Handling**: Comprehensive error handling and user feedback

## Development Notes

- The application uses a simple but effective architecture suitable for small to medium-sized gyms
- The database schema is designed to be easily extendable for additional features
- The frontend is built with progressive enhancement in mind
- The API is designed to be easily consumed by other clients if needed