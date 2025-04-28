from rest_framework import serializers
from .models import Empleado, Producto, Promocion
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['tipo_empleado'] = user.tipo_empleado
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data.update({
            'user_id': self.user.id,
            'username': self.user.username,
            'tipo_empleado': self.user.tipo_empleado,
            'is_admin': self.user.is_admin(),
        })
        return data

class EmpleadoSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Empleado
        fields = ['id', 'username', 'email', 'tipo_empleado', 'password']

    def create(self, validated_data):
        return Empleado.objects.create_user(**validated_data)

class ProductoSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.CharField(source='get_categoria_display', read_only=True)
    estado_nombre = serializers.CharField(source='get_estado_display', read_only=True)

    class Meta:
        model = Producto
        fields = '__all__'

# Añade esto al final de serializers.py
class PromocionSerializer(serializers.ModelSerializer):
    productos = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Producto.objects.all(),
        required=True  # Asegura que el campo sea obligatorio
    )

    class Meta:
        model = Promocion
        fields = ['id', 'nombre', 'descripcion', 'descuento', 'productos', 'fecha_inicio', 'fecha_fin', 'estado']