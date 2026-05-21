"# CrediTOR - Secure Transcript of Records (TOR) Verification System

**Status: 60% Complete ✅** | [View Implementation Status](./IMPLEMENTATION_STATUS.md) | [View Remaining 40%](./REMAINING_40_PERCENT.md)

A professional, enterprise-grade web application for secure Transcript of Records verification featuring a comprehensive Administrative Portal for Registrars and a clean, mobile-optimized Public Verification Portal.

---

## 🎯 Overview

CrediTOR is a two-portal system:

1. **Administrative Portal (Registrar)** - Manage, register, and issue TOR documents with QR codes
2. **Public Verification Portal** - Students and third parties verify document authenticity

The system includes:
- ✅ Secure document issuance with QR code generation
- ✅ Real-time status management
- ✅ Comprehensive audit trail logging
- ✅ Mobile-friendly verification interface
- ✅ Anti-fraud detection with masked name verification
- ✅ Pre-loaded mock data for immediate testing

---

## ✨ Features

### Admin Portal
- **Left-Sidebar Navigation** - Modern, persistent sidebar with three main modules
- **Issue New TOR** 
  - Student information form
  - Drag-and-drop PDF upload
  - Auto-generate Document Control Number (DCN)
  - Print-ready preview with QR code
  - Automatic audit logging
- **Registered Documents**
  - Comprehensive data table with search/filter
  - Inline status editing (Active/Revoked/Expired)
  - Summary statistics
  - Instant audit trail updates
- **Audit Trail Logs**
  - Timeline and table views
  - Event filtering and categorization
  - Color-coded event types
  - System-wide operation tracking

### Public Portal
- **Manual DCN Search** - Fallback for QR code scanning failures
- **Verification Results** - Color-coded status display
- **Security Warnings** - Fraud detection banner with critical warnings
- **Masked Name Display** - Privacy-preserving verification (e.g., "M******, K*** D****")
- **Mobile Optimized** - Clean, responsive design for all devices

---

## 🚀 Quick Start

### Prerequisites
- Node.js v16 or higher
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourname/CrediTOR.git
cd CrediTOR/frontend
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Start the development server**
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### First-Time Usage

When you open the application:
- You're automatically logged into the **Admin Portal**
- 4 sample TOR records are pre-loaded
- 6 audit log entries show system activity
- You can immediately test all features

---

## 🧪 Testing Guide

### Admin Portal Testing

**1. Create a New TOR Record**
1. Navigate to "Issue New TOR"
2. Fill in form fields:
   - Student ID: `STU-TEST-001`
   - Full Name: `John Doe`
   - Click "Auto-Generate" for DCN
3. Drag & drop any PDF file or select a file
4. Click "Register & Generate"
5. View the print preview with QR code
6. Click "Print Document" to open print dialog

**2. Manage Document Status**
1. Navigate to "Registered Documents"
2. Click the "Edit" button for any document
3. Change status to Revoked/Expired/Active
4. Click the save button
5. Verify the audit trail was updated

**3. View Audit Trail**
1. Navigate to "Audit Trail Logs"
2. View all events in timeline format
3. Scroll down to see detailed table view
4. Notice new events created from your actions

### Public Portal Testing

**1. Search by DCN**
1. Click "View Public Portal" in the sidebar
2. Enter a valid DCN:
   - `DCN-12345` (Active - will show green)
   - `DCN-54321` (Active - will show green)
   - `DCN-98765` (Expired - will show gray)
   - `DCN-45678` (Revoked - will show red)
3. Click "Verify Document"
4. View the verification result with masked name

**2. Check Security Warnings**
1. Verify any Active document
2. Read the yellow security banner
3. Notice the masked name display
4. Review the status-specific message

**3. Invalid DCN Search**
1. Enter `DCN-INVALID` or any non-existent DCN
2. See the red "Invalid Document" banner
3. Click "Try Another Search"

---

## 📁 Project Structure

```
CrediTOR/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminSidebar.jsx              # Navigation sidebar
│   │   │   ├── IssueNewTOR.jsx               # TOR creation & QR preview
│   │   │   ├── RegisteredDocuments.jsx       # Document management
│   │   │   ├── AuditTrailLogs.jsx            # Audit trail viewer
│   │   │   └── PublicVerificationPortal.jsx  # Public search & results
│   │   ├── services/
│   │   │   └── mockData.js                   # Mock data & utilities
│   │   ├── App.jsx                           # Main app component
│   │   ├── main.jsx                          # Entry point
│   │   ├── index.css                         # Styles
│   │   └── App.css                           # Component styles
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
├── IMPLEMENTATION_STATUS.md                   # What's done (60%)
├── REMAINING_40_PERCENT.md                    # What's left (40%)
└── README.md                                  # This file
```

---

## 🛠️ Technology Stack

- **Frontend Framework**: React 19 with Hooks
- **Build Tool**: Vite (lightning-fast development)
- **Styling**: Tailwind CSS 4
- **QR Code**: qrcode.react
- **Icons**: lucide-react
- **State Management**: React Hooks (useState, useEffect)

---

## 📊 Mock Data

### Pre-loaded Records (4 TOR documents)

| Student ID | Name | DCN | Status | Uploaded File |
|------------|------|-----|--------|---|
| STU-2024-001 | Maria Santos de la Cruz | DCN-12345 | Active | TOR-Maria-Santos.pdf |
| STU-2024-002 | Juan Carlos Ramos Lopez | DCN-54321 | Active | TOR-Juan-Carlos.pdf |
| STU-2024-003 | Ana Maria Fernandez Rodriguez | DCN-98765 | Expired | TOR-Ana-Maria.pdf |
| STU-2024-004 | Carlos Roberto Mendoza Gutierrez | DCN-45678 | Revoked | TOR-Carlos-Roberto.pdf |

### Audit Log Events (6 entries)
- Record creation for each student
- Status change events (Expired, Revoked)
- Verification attempts

---

## 🎨 Design Features

- **Professional Enterprise Theme** - Deep slate blues and crisp whites
- **Color-Coded Status** - Green (Active), Red (Revoked), Gray (Expired)
- **Responsive Design** - Works on desktop and mobile
- **Trust Indicators** - Security badges and warnings
- **Clear Typography** - Bold headers, readable body text
- **Intuitive Navigation** - Left sidebar in admin portal
- **Print-Ready** - Professional document preview

---

## 🔐 Security Features (60%)

- ✅ Masked name display for privacy
- ✅ Security warning banners
- ✅ Status-based access control
- ✅ Audit trail logging of all actions
- ✅ QR code token generation
- ✅ Input validation on forms

**Note**: Full security (authentication, encryption, SSL) comes in the remaining 40%

---

## 📱 Responsive Design

The application is optimized for:
- Desktop browsers (1920x1080 and higher)
- Tablets (768px and higher)
- Mobile phones (320px and higher)
- Print preview (optimized layout)

---

## 🚀 Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview built version
npm run preview

# Lint code
npm run lint
```

---

## 💾 State Management

All data is currently stored in React component state (not persisted). This means:

**Pros:**
- No backend needed for testing
- Fast, responsive UI
- Easy to test all features

**Cons:**
- Data resets on page refresh
- No multi-user support
- No permanent file storage

→ **Phase 2** will add database persistence and file storage

---

## 📝 API Structure (For 40% Backend Implementation)

The frontend is ready to connect to these API endpoints:

```javascript
// TOR Records
POST   /api/tor              // Create new record
GET    /api/tor              // List all records
GET    /api/tor/:id          // Get specific record
PUT    /api/tor/:id/status   // Update status

// Verification
GET    /api/verify?token=xyz123     // Verify by token
GET    /api/verify?dcn=DCN-12345    // Verify by DCN

// Audit Logs
GET    /api/audit-logs       // List all audit logs
GET    /api/audit-logs?event_type=   // Filter logs

// File Management
POST   /api/files/upload     // Upload PDF
GET    /api/files/:id        // Download file
```

---

## 🐛 Known Limitations (60% Build)

- File uploads not persisted (stored in memory)
- No backend/database integration
- Single-user only
- No authentication system
- QR codes generated but not validated server-side
- Print dialog is browser-based
- No email notifications

→ See [REMAINING_40_PERCENT.md](./REMAINING_40_PERCENT.md) for implementation plan

---

## 📚 Documentation

- **[IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md)** - Detailed breakdown of completed features (60%)
- **[REMAINING_40_PERCENT.md](./REMAINING_40_PERCENT.md)** - Roadmap and implementation guide for remaining 40%

---

## 🎓 Component Documentation

### AdminSidebar
Navigation component with three main modules and portal switcher.

### IssueNewTOR
Form for creating new TOR records with file upload and QR preview.

### RegisteredDocuments
Data table with inline status editing and summary statistics.

### AuditTrailLogs
Timeline and table views of all system events.

### PublicVerificationPortal
Public-facing search and verification interface.

---

## 🤝 Contributing

To extend this project:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

For backend development, start with the [REMAINING_40_PERCENT.md](./REMAINING_40_PERCENT.md) roadmap.

---

## 📞 Support & Questions

For questions about specific features:
- Check [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) for what's included
- Review component code in `src/components/`
- Check mock data in `src/services/mockData.js`

---

## 📄 License

This project is part of a Capstone initiative. All rights reserved.

---

## 📈 Next Steps

**To make this production-ready (40% remaining), implement:**

1. **Backend API** (Express.js, Node.js)
2. **Database** (PostgreSQL)
3. **Authentication** (JWT, login system)
4. **File Storage** (AWS S3 or local)
5. **Email Notifications** (SendGrid/Nodemailer)
6. **Security Hardening** (SSL, rate limiting, encryption)
7. **Testing Suite** (Jest, Cypress)
8. **Deployment** (Docker, CI/CD, cloud hosting)
9. **Monitoring** (Logging, error tracking)
10. **Advanced Features** (Analytics, batch operations)

Estimated timeline: 8-12 weeks with 1-2 developers

→ [View detailed implementation roadmap](./REMAINING_40_PERCENT.md)

---

**Built with ❤️ for the CrediTOR Capstone Project**

**Current Status: 60% Complete** ✅  
**Next Phase: Backend + Database + Authentication**" 
