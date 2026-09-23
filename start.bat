@echo off
REM Start the full CashRegister stack on Windows (needs Docker Desktop running)
docker compose up -d --build
echo.
echo ----------------------------------------------------
echo  Frontend    ^> http://localhost:3000
echo  API (docs)  ^> http://localhost:8000/docs
echo  phpMyAdmin  ^> http://localhost:8080 (root / root)
echo ----------------------------------------------------
echo Default login: admin / admin123  (POS PIN: 0000)
pause
