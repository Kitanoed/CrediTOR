"# CrediTOR - Secure Transcript of Records Verification System

A professional, enterprise-grade web application for secure Transcript of Records verification with a comprehensive Administrative Portal for Registrars, a public Verification Portal, and a complete Spring Boot backend with PostgreSQL.

---

## Features

### Administrative Portal

**Issue New TOR**
- Create and register Transcript of Records
- Automatic Document Control Number generation
- QR code generation for public verification
- PDF file upload with drag-and-drop interface
- Print-ready document preview
- Automatic audit trail logging

**Registered Documents**
- Comprehensive document management interface
- Inline status editing (Active, Revoked, Expired)
- Search and filter functionality
- Summary statistics by status
- Instant audit log updates on status changes

**Audit Trail Logs**
- Complete system event tracking
- Timeline and detailed table views
- Event filtering and search
- User action attribution
- CSV export capability

### Public Verification Portal

- Manual verification by Document Control Number
- Automatic verification via QR token
- Color-coded verification status
- Privacy-protected name masking
- Security warnings for fraud detection
- Mobile-responsive design

### Backend API

- User authentication with JWT tokens
- Complete CRUD operations for documents
- Token and manual search verification
- Audit log management and export
- Secure file upload and download
- Health monitoring endpoints

---

## Architecture

```
Frontend (React)              Backend (Spring Boot)        Database (PostgreSQL)
├── Admin Portal              ├── Spring Web               ├── Tables
├── Public Portal             ├── Authentication           ├── Indexes
├── Login Page                ├── TOR Controllers          ├── Constraints
└── API Client                ├── Verification Service     ├── Triggers
                              ├── Audit Service            └── Row Level Security
                              └── File Management
```

---

## Technology Stack

### Frontend
- React 19
- Vite build tool
- Tailwind CSS
- lucide-react icons
- qrcode.react for QR generation

### Backend
- Java 17 runtime
- Spring Boot 4.0.6 framework
- Spring Data JPA for database access
- Spring Security for authentication
- PostgreSQL driver
- Maven for dependency management

### Database & Infrastructure
- PostgreSQL relational database
- JPA entities and relationships
- Database migrations
- Automatic backups

---

## Getting Started

### Prerequisites

- Java 17 or higher
- Maven 3.6+
- Node.js v16+ (for frontend)
- npm or yarn package manager
- PostgreSQL 12+ database

### Installation Steps

**1. Install Frontend Dependencies**

```bash
cd frontend
npm install
```

**2. Setup PostgreSQL Database**

Create a PostgreSQL database and configure your connection:

```sql
CREATE DATABASE creditor;
```

**3. Configure Backend Environment**

Create or update `backend/creditor/creditor/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/creditor
spring.datasource.username=postgres
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
server.port=8080
```

**4. Build and Run Backend**

```bash
cd backend/creditor/creditor
mvn clean install
mvn spring-boot:run
```

**5. Start the Frontend**

```bash
cd frontend
npm run dev
```

**6. Access the Application**

- Frontend: http://localhost:5173
- Backend API: http://localhost:8080
- Test credentials: registrar@creditor.test / TestPassword123!

---

## Dependencies

### Frontend Dependencies

When you run `npm install`, the following packages will be installed:

**Core Framework:**
- `react` (^19.2.6) - React library for building user interfaces
- `react-dom` (^19.2.6) - React DOM rendering library

**Styling:**
- `tailwindcss` (^4.3.0) - Utility-first CSS framework
- `@tailwindcss/vite` (^4.3.0) - Vite plugin for Tailwind CSS

**UI Components & Icons:**
- `lucide-react` (^0.344.0) - Icon library for React
- `qrcode.react` (^1.0.1) - QR code generation component
- `qrcode` (^1.5.4) - QR code encoder library

**Document Processing:**
- `pdf-lib` (^1.17.1) - PDF manipulation library

**Build Tools (Dev):**
- `vite` (via npm) - Lightning-fast build tool
- `@vitejs/plugin-react` (^6.0.1) - Vite plugin for React
- `eslint` (^10.3.0) - JavaScript linter
- `eslint-plugin-react-hooks` (^7.1.1) - ESLint rules for React Hooks
- `eslint-plugin-react-refresh` (^0.5.2) - Fast Refresh for Vite

### Backend Dependencies

When you run `mvn clean install`, Maven will download and install:

**Spring Boot Starters:**
- `spring-boot-starter-parent` (4.0.6) - Spring Boot parent POM
- `spring-boot-starter-data-jpa` - Spring Data JPA for database access
- `spring-boot-starter-webmvc` - Spring Web MVC for REST APIs
- `spring-boot-starter-security` - Spring Security for authentication/authorization
- `spring-boot-starter-validation` - Validation support with annotations

**Database:**
- `postgresql` - PostgreSQL JDBC driver for database connectivity
- `h2` - H2 in-memory database (for testing)

**JWT Authentication:**
- `jjwt-api` (0.12.6) - JWT creation and verification API
- `jjwt-impl` (0.12.6) - JWT implementation
- `jjwt-jackson` (0.12.6) - JWT Jackson processor

**Data Processing:**
- `jackson-databind` - JSON serialization/deserialization

**Development & Utilities:**
- `lombok` - Code generation library for reducing boilerplate
- `spring-boot-maven-plugin` - Maven plugin for Spring Boot applications

**Testing (Scope: test):**
- `spring-boot-starter-data-jpa-test` - JPA testing support
- `spring-boot-starter-webmvc-test` - Web MVC testing support

### Total Package Count

- **Frontend**: 7 production dependencies + 8 dev dependencies
- **Backend**: 13+ production dependencies + 2 test dependencies

All dependencies are automatically installed with `npm install` (frontend) and `mvn clean install` (backend).

---

## Project Structure

```
CrediTOR/
├── frontend/
│   ├── src/
│   │   ├── components/              # React components
│   │   ├── api/                     # API client module
│   │   ├── services/                # Business logic
│   │   ├── App.jsx                  # Main application
│   │   └── main.jsx                 # Entry point
│   ├── package.json
│   └── vite.config.js
│
├── backend/creditor/creditor/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/edu/cit/creditor/
│   │   │   │   ├── controller/      # Spring Controllers
│   │   │   │   ├── service/         # Business logic
│   │   │   │   ├── repository/      # Data access layer
│   │   │   │   ├── model/           # JPA entities
│   │   │   │   ├── dto/             # Data transfer objects
│   │   │   │   └── Application.java # Main application class
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/                    # JUnit tests
│   ├── pom.xml
│   └── mvnw
│
├── README.md                         # This file
└── SETUP_IN_30_MINUTES.md           # Setup guide
```

---

## Security

The application implements comprehensive security measures:

- JWT-based authentication with secure token storage
- Bcryptjs password hashing for user accounts
- Row Level Security (RLS) policies in the database
- CORS protection with configurable origins
- Security headers via Helmet middleware
- Input validation on all API endpoints
- SQL injection prevention through parameterized queries
- Soft delete functionality for data recovery
- Complete audit trail of all system actions  

---

## API Endpoints

### Authentication

```
POST   /api/auth/signup          Register new registrar account
POST   /api/auth/login           User login
GET    /api/auth/me              Get current user information
POST   /api/auth/logout          User logout
```

### Transcript Records

```
POST   /api/tor                  Create new TOR record
GET    /api/tor                  List all records with pagination
GET    /api/tor/:id              Retrieve specific record
PUT    /api/tor/:id/status       Update record status
DELETE /api/tor/:id              Delete record
```

### Verification

```
GET    /api/verify/by-token/:token      Verify using QR token
GET    /api/verify/by-dcn/:dcn          Verify using manual search
```

### Audit Logs

```
GET    /api/audit-logs                  List audit events
GET    /api/audit-logs/stats            Get event statistics
GET    /api/audit-logs/export/csv       Export logs as CSV
```

### File Management

```
POST   /api/files/upload                Upload PDF document
GET    /api/files/download/:dcn         Download document
DELETE /api/files/:dcn                  Delete document
```

### System

```
GET    /api/health                      Check API health status
```

---

## Testing

### Pre-loaded Test Data

The database is seeded with sample data for testing:

- 4 sample Transcript records with different statuses
- 6 audit log entries showing system events
- 1 test registrar account with full permissions

### Test Credentials

```
Email:    registrar@creditor.test
Password: TestPassword123!
```

### Testing Workflow

1. Log in with test credentials
2. Create a new Transcript record
3. Upload a PDF document
4. Modify the document status
5. View the audit trail
6. Test the public verification portal

---

## Database Schema

The application uses four main tables:

- **tor_records** - Stores Transcript of Records with metadata and verification tokens
- **audit_logs** - Records all system events with actor and timestamp information
- **verification_attempts** - Tracks document verification requests and results
- **user_profiles** - Manages user information and roles

All tables include appropriate indexes for performance optimization and implement Row Level Security policies for access control.

---

## Documentation

| Document | Purpose |
|----------|---------|
| [SETUP_IN_30_MINUTES.md](./SETUP_IN_30_MINUTES.md) | Quick setup guide |
| [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) | Feature checklist |

---

## Deployment

The application is production-ready with:

- Complete Spring Boot backend with Maven
- React frontend with Vite
- PostgreSQL database
- Environment-based configuration
- Error handling and logging
- CORS configuration
- Health check endpoints

### Deployment Targets
- **Frontend**: Vercel, Netlify, or GitHub Pages
- **Backend**: Cloud VM, Docker container, or dedicated server
- **Database**: PostgreSQL on managed service or self-hosted

---

---

## Troubleshooting

### Backend won't start
```bash
# Check if port 8080 is already in use
netstat -ano | findstr :8080

# If port is in use, kill the process
taskkill /PID <PID> /F

# Clean build and try again
cd backend/creditor/creditor
mvn clean install
mvn spring-boot:run
```

### Frontend can't connect to backend
1. Verify backend is running on port 8080
2. Check CORS is configured in Spring Boot
3. Verify API URLs in frontend client match `http://localhost:8080`
4. Clear browser cache and reload

### Login fails
1. Verify PostgreSQL database is running
2. Check database connection in `application.properties`
3. Review backend logs for authentication errors
4. Verify test user exists in database

---

## Support & Resources

- React Documentation: https://react.dev
- Spring Boot Documentation: https://spring.io/projects/spring-boot
- PostgreSQL Documentation: https://www.postgresql.org/docs/
- Maven Guide: https://maven.apache.org/

---

## License

This project is part of a Capstone initiative. All rights reserved.

---

## Contributing

To extend this project:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

**Built with React, Spring Boot, and PostgreSQL**" 
