from django.contrib import admin
from django.urls import path
from ninja import NinjaAPI

api = NinjaAPI()

@api.get("/")
def health(request):
    return {"status": "ok", "message": "StudyBot API is running"}

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', api.urls),
]
