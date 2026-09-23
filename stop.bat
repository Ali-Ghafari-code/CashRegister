@echo off
REM Stop the CashRegister stack. Pass -v as first arg to also wipe MySQL data.
if "%1"=="-v" (
  docker compose down -v
) else (
  docker compose down
)
pause
