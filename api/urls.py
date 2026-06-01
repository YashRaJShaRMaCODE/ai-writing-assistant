from django.urls import path
from .views import rewrite_text

urlpatterns = [
    path("rewrite/", rewrite_text),
]