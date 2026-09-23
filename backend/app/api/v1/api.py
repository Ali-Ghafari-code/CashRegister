from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth, products, customers, sales, shifts, inventory,
    branches, employees, suppliers, purchases, promotions,
    dashboard, reports,
)

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(products.router)
api_router.include_router(customers.router)
api_router.include_router(sales.router)
api_router.include_router(shifts.router)
api_router.include_router(inventory.router)
api_router.include_router(branches.router)
api_router.include_router(employees.router)
api_router.include_router(suppliers.router)
api_router.include_router(purchases.router)
api_router.include_router(promotions.router)
api_router.include_router(dashboard.router)
api_router.include_router(reports.router)
