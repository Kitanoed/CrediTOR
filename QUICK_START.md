# CrediTOR - Quick Start Guide

Get the CrediTOR application running in 3 simple steps!

---

## Step 1: Install Dependencies

Open a terminal in the `frontend` folder and run:

```bash
npm install
```

This will install all required packages:
- React & React DOM
- Vite (build tool)
- Tailwind CSS (styling)
- qrcode.react (QR code generation)
- lucide-react (icons)

**Wait time**: 2-5 minutes (depending on internet speed)

---

## Step 2: Start Development Server

While still in the `frontend` folder, run:

```bash
npm run dev
```

You should see:
```
VITE v8.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

---

## Step 3: Open in Browser

Click the link or copy-paste `http://localhost:5173/` into your browser.

**That's it! The application is now running!** 🎉

---

## What You'll See

### First Screen: Admin Portal

You are automatically logged into the **Admin Portal** with:
- Left sidebar navigation (dark blue)
- Three main sections
- 4 pre-loaded sample TOR records
- 6 audit log entries

---

## 🧪 Quick Testing

### Test 1: Create a New TOR (2 minutes)

1. Click **"Issue New TOR"** in the sidebar
2. Fill in the form:
   - Student ID: `TEST-2024`
   - Full Name: `Your Name`
   - Click **"Auto-Generate"** for DCN
3. Drag & drop any PDF file (or click "Browse Files")
4. Click **"Register & Generate"**
5. ✅ You'll see a print preview with a QR code!
6. Click **"Print Document"** to open print dialog

### Test 2: Edit Document Status (1 minute)

1. Click **"Registered Documents"** in the sidebar
2. You'll see all documents in a table
3. Click **"Edit"** on any document
4. Change the status dropdown
5. Click the ✓ button to save
6. ✅ Check "Audit Trail Logs" to see the change logged!

### Test 3: View Audit Trail (1 minute)

1. Click **"Audit Trail Logs"** in the sidebar
2. You'll see all system events
3. Scroll down to see the detailed table view
4. ✅ Notice new events from your actions!

### Test 4: Public Portal Verification (2 minutes)

1. Click **"View Public Portal"** at the bottom of the sidebar
2. You're now in the public verification portal
3. Search for a valid DCN:
   - Try: `DCN-12345` → Shows **Green** (Active)
   - Try: `DCN-98765` → Shows **Gray** (Expired)
   - Try: `DCN-45678` → Shows **Red** (Revoked)
4. ✅ See the masked name and security warning!
5. Try an invalid DCN like `DCN-INVALID`
6. ✅ See the red error message!
7. Click **"← Admin Portal"** to go back

---

## 📊 Pre-loaded Sample Data

4 TOR records are ready to test:

| Student ID | Name | DCN | Status |
|------------|------|-----|--------|
| STU-2024-001 | Maria Santos de la Cruz | DCN-12345 | ✅ Active |
| STU-2024-002 | Juan Carlos Ramos Lopez | DCN-54321 | ✅ Active |
| STU-2024-003 | Ana Maria Fernandez Rodriguez | DCN-98765 | ⚠️ Expired |
| STU-2024-004 | Carlos Roberto Mendoza Gutierrez | DCN-45678 | ❌ Revoked |

---

## 🎨 Key Features to Try

- ✅ **QR Code Generation** - Creates QR codes for each document
- ✅ **Print Preview** - Professional document layout ready to print
- ✅ **Inline Editing** - Change status directly in the table
- ✅ **Masked Names** - Privacy protection shows "M******, K*** D****"
- ✅ **Security Warnings** - Anti-fraud messages on verification
- ✅ **Audit Logging** - All actions automatically logged
- ✅ **Auto DCN Generation** - Generate unique document numbers
- ✅ **File Upload** - Drag-and-drop PDF upload zones
- ✅ **Color Coding** - Green (valid), Red (revoked), Gray (expired)

---

## 🆘 Troubleshooting

### "npm: command not found"
- Make sure Node.js is installed: `node --version`
- Download from: https://nodejs.org/

### Port 5173 already in use?
```bash
# Use a different port
npm run dev -- --port 3000
```

### Styles not loading?
- Clear browser cache (Ctrl+Shift+Delete)
- Restart the development server

### "Cannot find module" error?
- Delete `node_modules` folder and `package-lock.json`
- Run `npm install` again

---

## 📝 Project Structure

```
frontend/
├── src/
│   ├── components/          ← React components
│   │   ├── AdminSidebar.jsx
│   │   ├── IssueNewTOR.jsx
│   │   ├── RegisteredDocuments.jsx
│   │   ├── AuditTrailLogs.jsx
│   │   └── PublicVerificationPortal.jsx
│   ├── services/            ← Mock data & utilities
│   │   └── mockData.js
│   ├── App.jsx              ← Main app
│   ├── main.jsx             ← Entry point
│   └── index.css            ← Styles
├── package.json             ← Dependencies
└── vite.config.js          ← Vite config
```

---

## 📚 Learn More

- **What's included**: See [IMPLEMENTATION_STATUS.md](../IMPLEMENTATION_STATUS.md)
- **What's next**: See [REMAINING_40_PERCENT.md](../REMAINING_40_PERCENT.md)
- **Full documentation**: See [README.md](../README.md)

---

## ✨ About This 60% Build

This is a **fully functional frontend** of CrediTOR with:
- ✅ Complete user interface
- ✅ All workflows operational
- ✅ Mock data for testing
- ✅ QR code generation
- ✅ Print-ready documents

**What's NOT included yet** (the remaining 40%):
- ❌ Backend API
- ❌ Database persistence
- ❌ User authentication
- ❌ File storage
- ❌ Email notifications
- ❌ Production deployment

→ **Next steps**: See [REMAINING_40_PERCENT.md](../REMAINING_40_PERCENT.md) for the implementation roadmap

---

## 🎯 Next Steps

After exploring the 60% build:

1. **Review the code** - Check `src/components/` to understand the implementation
2. **Explore mock data** - See how data flows in `src/services/mockData.js`
3. **Check documentation** - Read [IMPLEMENTATION_STATUS.md](../IMPLEMENTATION_STATUS.md)
4. **Plan backend** - Review [REMAINING_40_PERCENT.md](../REMAINING_40_PERCENT.md)

---

## 🚀 You're Ready!

You now have a working CrediTOR interface. Start by testing all the features above, then explore the code to understand how it works.

**Happy exploring!** 🎉

---

**Questions?** Check the documentation files or review the component code in `src/components/`
