# Quick Start - Development Environment

**Status:** ✅ Backend Running | Frontend Ready to Start

---

## Current Status

### Backend (Django) ✅
- **Status:** RUNNING
- **URL:** http://localhost:8000
- **Port:** 8000
- **Command:** Already started in background

### Frontend (React/Vite) ⏳
- **Status:** Ready to start
- **URL:** http://localhost:3001
- **Port:** 3001

---

## How to Start the Servers

### Option 1: Using PowerShell (Recommended)

```powershell
# From the project root directory, run:
.\START_SERVERS.ps1
```

This will start both servers in separate windows.

### Option 2: Manual - Start Backend

```powershell
# From project root
cd backend
.\venv\Scripts\activate.ps1
python manage.py runserver 0.0.0.0:8000
```

**Note:** If you get an execution policy error, run this first:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Option 3: Manual - Start Frontend

```powershell
# From project root
cd frontend
C:\wamp64\www\Suivi_depense\nodejs-portable\node.exe `
  C:\wamp64\www\Suivi_depense\nodejs-portable\node_modules\npm\bin\npm-cli.js run dev
```

---

## Access the Application

Once both servers are running:

1. **Frontend:** http://localhost:3001
2. **Backend API:** http://localhost:8000/api/
3. **Admin Panel:** http://localhost:8000/admin/

---

## Default Credentials

**Admin Account:**
- Username: `admin`
- Password: `admin123`

---

## Troubleshooting

### Backend Won't Start

```powershell
# Verify Python is available
.\backend\venv\Scripts\python.exe --version

# Check Django installation
.\backend\venv\Scripts\python.exe -m django --version

# Run migrations if needed
.\backend\venv\Scripts\python.exe .\backend\manage.py migrate
```

### Frontend Won't Start

```powershell
# Check Node.js
C:\wamp64\www\Suivi_depense\nodejs-portable\node.exe --version

# Install dependencies if needed
cd frontend
C:\wamp64\www\Suivi_depense\nodejs-portable\node.exe `
  C:\wamp64\www\Suivi_depense\nodejs-portable\node_modules\npm\bin\npm-cli.js install
```

### Port Already in Use

If port 8000 or 3001 is already in use:

```powershell
# Backend on different port
python manage.py runserver 0.0.0.0:8001

# Frontend on different port (edit vite.config.js)
# Change port: 3001 to port: 3002
```

---

## Development Workflow

1. **Backend Changes:** Auto-reload enabled (watch for file changes)
2. **Frontend Changes:** Hot reload enabled (instant updates)
3. **Database Changes:** Run migrations
   ```powershell
   python manage.py makemigrations
   python manage.py migrate
   ```

---

## Useful Commands

### Backend

```powershell
# Create superuser
python manage.py createsuperuser

# Run tests
python manage.py test

# Check configuration
python manage.py check

# Database shell
python manage.py dbshell

# Collect static files
python manage.py collectstatic
```

### Frontend

```powershell
# Build for production
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

---

## API Endpoints

### Authentication
- `POST /api/auth/token/` - Get access token
- `POST /api/auth/token/refresh/` - Refresh token

### Operations
- `GET /api/operations/` - List operations
- `POST /api/operations/` - Create operation
- `GET /api/operations/{id}/` - Get operation
- `PUT /api/operations/{id}/` - Update operation
- `DELETE /api/operations/{id}/` - Delete operation

### Previsions
- `GET /api/previsions/` - List previsions
- `POST /api/previsions/` - Create prevision
- `GET /api/previsions/{id}/` - Get prevision
- `PUT /api/previsions/{id}/` - Update prevision
- `DELETE /api/previsions/{id}/` - Delete prevision

### Categories
- `GET /api/categories/` - List categories
- `POST /api/categories/` - Create category

### Reports
- `GET /api/rapports/monthly/` - Monthly report
- `GET /api/rapports/export_pdf/` - Export PDF
- `GET /api/rapports/export_excel/` - Export Excel

---

## Environment Variables

For development, the following are set to defaults:

```
DEBUG=False (change to True for development)
SECRET_KEY=auto-generated (warning shown)
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:5173
```

To customize, create `backend/.env`:

```
DEBUG=True
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3001
```

---

## Next Steps

1. ✅ Backend is running
2. ⏳ Start frontend using `.\START_SERVERS.ps1`
3. 🌐 Open http://localhost:3001 in browser
4. 🔐 Login with admin/admin123
5. 🚀 Start developing!

---

## Documentation

- **Production Guide:** See `PRODUCTION_DEPLOYMENT_GUIDE.md`
- **Production Checklist:** See `PRODUCTION_CHECKLIST.md`
- **Optimization Summary:** See `OPTIMIZATION_SUMMARY.md`
- **API Documentation:** See `README.md`

---

**Happy Coding!** 🎉
