from django.urls import path
from ninja import NinjaAPI
from api.auth_endpoints import router as auth_router
from api.resource_endpoints import router as resource_router
from api.user_endpoints import router as user_router
from api.admin_endpoints import router as admin_router

api = NinjaAPI(title='StudyBot API', version='1.0.0')
api.add_router('/auth/', auth_router)
api.add_router('/resources/', resource_router)
api.add_router('/user/', user_router)
api.add_router('/admin/', admin_router)

urlpatterns = [
    path('api/', api.urls),
]
