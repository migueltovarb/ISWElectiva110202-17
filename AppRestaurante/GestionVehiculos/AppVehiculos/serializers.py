from rest_framework import serializers
from .models import Empleado, Producto, Promocion, Cliente
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from decimal import Decimal
from django.core.validators import MinValueValidator

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
    imagen_url = serializers.SerializerMethodField()
    precio = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]  # Usa Decimal
    )
    class Meta:
        model = Producto
        fields = '__all__'
    
    def get_imagen_url(self, obj):
        if obj.imagen and hasattr(obj.imagen, 'url'):
            return obj.imagen.url
        return None

    def validate_imagen(self, value):
        if value:
            # Verificar el tipo de archivo
            valid_extensions = ['jpg', 'jpeg', 'png']
            extension = value.name.split('.')[-1].lower()
            if extension not in valid_extensions:
                raise serializers.ValidationError("Solo se permiten imágenes JPG, JPEG o PNG.")
        return value

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

class ClienteRegistroSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = Cliente
        fields = ['usuario', 'email', 'password']
    
    def create(self, validated_data):
        cliente = Cliente.objects.create(
            usuario=validated_data['usuario'],
            email=validated_data['email']
        )
        cliente.set_password(validated_data['password'])
        cliente.save()
        return cliente

class ClienteLoginSerializer(serializers.Serializer):
    usuario = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        usuario = attrs.get('usuario')
        password = attrs.get('password')
        
        try:
            cliente = Cliente.objects.get(usuario=usuario)
        except Cliente.DoesNotExist:
            raise serializers.ValidationError("Credenciales inválidas")
        
        if not cliente.check_password(password):
            raise serializers.ValidationError("Credenciales inválidas")
        
        # Actualizar último login
        cliente.ultimo_login = timezone.now()
        cliente.save()
        
        # Generar tokens JWT
        refresh = RefreshToken.for_user(cliente)
        
        return {
            'usuario': cliente.usuario,
            'email': cliente.email,
            'access': str(refresh.access_token),
            'refresh': str(refresh)
        }