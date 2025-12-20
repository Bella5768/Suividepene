# How to Run the Application

**Problem:** Python is not in your system PATH  
**Solution:** Use the provided batch/PowerShell scripts

---

## ✅ Easiest Way - Double-Click Method

### Option 1: Run Backend (Recommended)
1. Navigate to: `C:\wamp64\www\Suivi_depense\`
2. **Double-click:** `run_backend.bat`
3. A command window will open and Django will start
4. You'll see: `Starting development server at http://0.0.0.0:8000/`

### Option 2: Run with PowerShell
1. Open PowerShell
2. Navigate to the project: `cd C:\wamp64\www\Suivi_depense`
3. Run: `powershell -ExecutionPolicy Bypass -File run_dev.ps1`

---

## 🌐 Access the Application

Once the backend is running:

**Frontend:** http://localhost:3001  
**Backend API:** http://localhost:8000/api/  
**Admin Panel:** http://localhost:8000/admin/  

**Login Credentials:**
- Username: `admin`
- Password: `admin123`

---

## 📋 What Each Script Does

### `run_backend.bat`
- Activates Python virtual environment
- Runs Django development server on port 8000
- Auto-reloads on code changes
- **Best for:** Quick startup, no Python PATH needed

### `run_dev.ps1`
- Directly calls Python from virtual environment
- Runs Django development server on port 8000
- Works in PowerShell without activation
- **Best for:** PowerShell users

### `START_SERVERS.ps1`
- Starts both backend AND frontend in separate windows
- Backend on port 8000
- Frontend on port 3001
- **Best for:** Full development with both servers

---

## 🚀 Complete Startup Procedure

### Step 1: Start Backend
```
Double-click: run_backend.bat
```
Wait for: `Starting development server at http://0.0.0.0:8000/`

### Step 2: Start Frontend (Optional)
Open new PowerShell window and run:
```powershell
cd C:\wamp64\www\Suivi_depense\frontend
C:\wamp64\www\Suivi_depense\nodejs-portable\node.exe `
  C:\wamp64\www\Suivi_depense\nodejs-portable\node_modules\npm\bin\npm-cli.js run dev
```

### Step 3: Open in Browser
- Frontend: http://localhost:3001
- Backend: http://localhost:8000

---

## ❌ If You Get Errors

### Error: "venv\Scripts\activate.bat" not found
**Solution:** Virtual environment not installed
```powershell
cd C:\wamp64\www\Suivi_depense\backend
python -m venv venv
venv\Scripts\activate.bat
pip install -r requirements.txt
```

### Error: "python: command not found"
**Solution:** Use the full path instead
```powershell
C:\wamp64\www\Suivi_depense\backend\venv\Scripts\python.exe manage.py runserver
```

### Error: Port 8000 already in use
**Solution:** Use a different port
```powershell
python manage.py runserver 0.0.0.0:8001
```

### Error: Module not found (whitenoise, etc.)
**Solution:** Install dependencies
```powershell
cd C:\wamp64\www\Suivi_depense\backend
venv\Scripts\activate.bat
pip install -r requirements.txt
```

---

## 📊 Verify Everything Works

### Check Backend
```powershell
curl http://localhost:8000/api/
# Should return JSON response
```

### Check Frontend
Open browser: http://localhost:3001
Should see login page

### Check Admin
Open browser: http://localhost:8000/admin/
Should see Django admin login

---

## 🛑 Stop the Servers

### Backend
- Press `Ctrl+C` in the command window
- Or close the window

### Frontend
- Press `Ctrl+C` in the PowerShell window
- Or close the window

---

## 💡 Pro Tips

### Tip 1: Keep Both Running
Open two command windows:
- Window 1: Backend (run_backend.bat)
- Window 2: Frontend (npm run dev)

### Tip 2: Create Shortcut
Right-click `run_backend.bat` → Send to → Desktop (create shortcut)
Then double-click the shortcut to start backend anytime

### Tip 3: Use VS Code Terminal
Open VS Code in the project folder:
```powershell
code C:\wamp64\www\Suivi_depense
```
Then use integrated terminal to run commands

### Tip 4: Add Python to PATH (Permanent Fix)
1. Open System Properties → Environment Variables
2. Add: `C:\wamp64\www\Suivi_depense\backend\venv\Scripts`
3. Restart PowerShell
4. Then `python` command will work anywhere

---

## 📚 Useful Commands (After Backend Starts)

### Create Superuser
```powershell
python manage.py createsuperuser
```

### Run Migrations
```powershell
python manage.py migrate
```

### Create Test Data
```powershell
python manage.py shell
# Then in Python shell:
# from depenses.models import Categorie
# Categorie.objects.create(nom="Test", code="TEST")
```

### Check Configuration
```powershell
python manage.py check --deploy
```

---

## 🎯 Quick Reference

| Task | Command |
|------|---------|
| Start Backend | Double-click `run_backend.bat` |
| Start Frontend | `npm run dev` (in frontend folder) |
| Start Both | `.\START_SERVERS.ps1` |
| Stop Server | `Ctrl+C` |
| Access Frontend | http://localhost:3001 |
| Access Backend | http://localhost:8000 |
| Access Admin | http://localhost:8000/admin |
| Login | admin / admin123 |

---

## ✅ Everything Ready!

Your application is fully set up and ready to use. Just:

1. **Double-click** `run_backend.bat`
2. **Open browser** to http://localhost:3001
3. **Login** with admin/admin123
4. **Start developing!**

---

**Need help?** Check the comprehensive guides in the project root:
- `QUICK_START_DEV.md` - Development setup
- `PRODUCTION_DEPLOYMENT_GUIDE.md` - Production deployment
- `README.md` - Project overview
