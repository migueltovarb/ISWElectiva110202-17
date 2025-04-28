from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator

class Empleado(AbstractUser):
    TIPO_EMPLEADO_CHOICES = [
        ('ADM', 'Administrador'),
        ('MES', 'Mesero'),
    ]
    tipo_empleado = models.CharField(max_length=3, choices=TIPO_EMPLEADO_CHOICES, default='MES')
    telefono = models.CharField(max_length=15, blank=True)

    def __str__(self):
        return f"{self.username} ({self.get_tipo_empleado_display()})"
    
    def is_admin(self):
        return self.tipo_empleado == 'ADM'

class Producto(models.Model):
    CATEGORIA_CHOICES = [
        ('PLATO_PRINCIPAL', 'Plato Principal'),
        ('ENTRADA', 'Entrada'),
        ('BEBIDA', 'Bebida'),
        ('ADICION', 'Adición'),
        ('POSTRE', 'Postre'),
    ]
    
    ESTADO_CHOICES = [
        ('DISPONIBLE', 'Disponible'),
        ('FUERA_STOCK', 'Fuera de Stock'),
    ]

    categoria = models.CharField(max_length=20, choices=CATEGORIA_CHOICES)
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField()
    precio = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0.01)])
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='DISPONIBLE')

    def __str__(self):
        return self.nombre
    
class Promocion(models.Model):
    ESTADO_CHOICES = [
        ('ACTIVA', 'Activa'),
        ('INACTIVA', 'Inactiva'),
    ]
    
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField()
    descuento = models.DecimalField(max_digits=5, decimal_places=2, validators=[MinValueValidator(0.01)])
    productos = models.ManyToManyField(Producto, related_name='promociones')
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='ACTIVA')
    imagen = models.ImageField(upload_to='promociones/', null=True, blank=True)

    def __str__(self):
        return self.nombre

    def esta_activa(self):
        from django.utils import timezone
        hoy = timezone.now().date()
        return self.estado == 'ACTIVA' and self.fecha_inicio <= hoy <= self.fecha_fin