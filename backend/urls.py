
from django.contrib import admin
from django.urls import path, include
from api.views import healthz

urlpatterns = [
    path('healthz/', healthz),
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]
