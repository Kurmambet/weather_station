# /graph/realtime_graph/realtime_graph/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('graph.urls')),
]
