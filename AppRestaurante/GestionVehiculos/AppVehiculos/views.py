from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status
from rest_framework_simplejwt.views import TokenObtainPairView
from django.shortcuts import get_object_or_404
from .models import Empleado, Producto, Promocion, Cliente
from .serializers import EmpleadoSerializer, ProductoSerializer, CustomTokenObtainPairSerializer, PromocionSerializer, ClienteRegistroSerializer, ClienteLoginSerializer
from .permissions import IsAdmin, IsAdminOrMeseroOrReadOnly  # Importación corregida
from rest_framework import generics
from rest_framework.exceptions import PermissionDenied
from django.core.exceptions import ValidationError
from rest_framework.permissions import AllowAny


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class EmpleadoAPIView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        serializer = EmpleadoSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'id': user.id,
                'username': user.username,
                'tipo_empleado': user.tipo_empleado
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class ClienteRegistroView(generics.CreateAPIView):
    queryset = Cliente.objects.all()
    serializer_class = ClienteRegistroSerializer
    permission_classes = [AllowAny] 

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response({
            'status': 'success',
            'message': 'Cliente registrado exitosamente',
            'data': serializer.data
        }, status=status.HTTP_201_CREATED, headers=headers)

class ClienteLoginView(generics.GenericAPIView):
    serializer_class = ClienteLoginSerializer
    permission_classes = [AllowAny] 

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)

class ProductoAPIView(APIView):
    permission_classes = [IsAdminOrMeseroOrReadOnly]

    def get(self, request, pk=None):
        if pk:
            producto = get_object_or_404(Producto, pk=pk)
            serializer = ProductoSerializer(producto)
            return Response(serializer.data)
        
        productos = Producto.objects.all()
        serializer = ProductoSerializer(productos, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ProductoSerializer(data=request.data)
        if serializer.is_valid():
            try:
                producto = serializer.save()
                return Response(ProductoSerializer(producto).data, status=status.HTTP_201_CREATED)
            except ValidationError as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        producto = get_object_or_404(Producto, pk=pk)
        serializer = ProductoSerializer(producto, data=request.data)
        if serializer.is_valid():
            try:
                producto = serializer.save()
                return Response(ProductoSerializer(producto).data)
            except ValidationError as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        producto = get_object_or_404(Producto, pk=pk)
        
        if 'estado' in request.data and request.data['estado'] == 'toggle':
            nuevo_estado = 'FUERA_STOCK' if producto.estado == 'DISPONIBLE' else 'DISPONIBLE'
            producto.estado = nuevo_estado
            producto.save()
            return Response({
                'status': 'success',
                'message': f'Estado cambiado a {nuevo_estado}',
                'nuevo_estado': producto.get_estado_display(),
                'producto_id': producto.id
            })
        
        serializer = ProductoSerializer(producto, data=request.data, partial=True)
        if serializer.is_valid():
            try:
                producto = serializer.save()
                return Response(ProductoSerializer(producto).data)
            except ValidationError as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        producto = get_object_or_404(Producto, pk=pk)
        producto.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class PromocionAPIView(generics.ListCreateAPIView):
    queryset = Promocion.objects.all()
    serializer_class = PromocionSerializer
    permission_classes = [IsAdminOrMeseroOrReadOnly]

    def create(self, request, *args, **kwargs):
        if not request.user.is_admin():
            return Response(
                {"detail": "Solo administradores pueden crear promociones"},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().create(request, *args, **kwargs)

class PromocionDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Promocion.objects.all()
    serializer_class = PromocionSerializer
    permission_classes = [IsAdminOrMeseroOrReadOnly]

    def perform_update(self, serializer):
        if self.request.user.is_admin():
            serializer.save()
        else:
            raise PermissionDenied("Solo los administradores pueden editar promociones")

    def perform_destroy(self, instance):
        if self.request.user.is_admin():
            instance.delete()
        else:
            raise PermissionDenied("Solo los administradores pueden eliminar promociones")