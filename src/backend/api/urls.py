from django.urls import path
from ninja import NinjaAPI
from .auth_endpoints import router as auth_router
from .user_endpoints import router as user_router
from .resource_endpoints import router as resource_router
from .admin_endpoints import router as admin_router

api = NinjaAPI()

api.add_router("/auth", auth_router)
api.add_router("/user", user_router)
api.add_router("/resources", resource_router)
api.add_router("/admin", admin_router)

urlpatterns = [
    path("", api.urls),
]
