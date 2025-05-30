from django.urls import path
from .views import (
    CustomTokenObtainPairView,
    EmpleadoAPIView,
    ProductoAPIView,
    PromocionAPIView,
    PromocionDetailAPIView,
    ClienteRegistroView,
    ClienteLoginView,
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('auth/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('empleados/', EmpleadoAPIView.as_view(), name='empleado-list'),
    path('productos/', ProductoAPIView.as_view(), name='producto-list'),
    path('productos/<int:pk>/', ProductoAPIView.as_view(), name='producto-detail'),
    path('promociones/', PromocionAPIView.as_view(), name='promocion-list'),
    path('promociones/<int:pk>/', PromocionDetailAPIView.as_view(), name='promocion-detail'),
    path('clientes/registro/', ClienteRegistroView.as_view(), name='cliente-registro'),
    path('clientes/login/', ClienteLoginView.as_view(), name='cliente-login'),
]