# /graph/realtime_graph/graph/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('', views.index),
    path('api/data/', views.sensor_data, name='sensor_data'),
]
