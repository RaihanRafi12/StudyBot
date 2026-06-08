from django.urls import path
from ninja import NinjaAPI
from api.auth_endpoints import router as auth_router
from api.resource_endpoints import router as resource_router
from api.admin_endpoints import router as admin_router
from api.user_endpoints import router as user_router

api = NinjaAPI()

api.add_router("/auth/", auth_router)
api.add_router("/resources/", resource_router)
api.add_router("/admin/", admin_router)
api.add_router("/users/", user_router)

urlpatterns = [
    path("", api.urls),
]
