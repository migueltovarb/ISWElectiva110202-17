from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator
from imagekit.models import ProcessedImageField
from imagekit.processors import ResizeToFill
from django.core.exceptions import ValidationError
import os
from PIL import Image


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
    
class Cliente(models.Model):
    usuario = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)  # Se almacenará hasheada
    fecha_registro = models.DateTimeField(auto_now_add=True)
    ultimo_login = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.usuario

    def set_password(self, raw_password):
        from django.contrib.auth.hashers import make_password
        self.password = make_password(raw_password)

    def check_password(self, raw_password):
        from django.contrib.auth.hashers import check_password
        return check_password(raw_password, self.password)
    
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
    precio = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        validators=[MinValueValidator(0.01)]
    )
    estado = models.CharField(
        max_length=20, 
        choices=ESTADO_CHOICES, 
        default='DISPONIBLE'
    )
    imagen = ProcessedImageField(
        upload_to='productos/',
        processors=[ResizeToFill(500, 500)],  
        format='JPEG',
        options={'quality': 80},
        blank=True,
        null=True,
        help_text="La imagen debe ser cuadrada. Se redimensionará automáticamente si no lo es."
    )

    def clean(self):
        """Validación adicional para asegurar imagen cuadrada"""
        super().clean()
        if self.imagen:
            try:
                img = Image.open(self.imagen)
                if img.width != img.height:
                    raise ValidationError(
                        {'imagen': 'La imagen debe tener relación de aspecto 1:1 (cuadrada)'}
                    )
            except Exception as e:
                raise ValidationError(
                    {'imagen': f'Error al procesar la imagen: {str(e)}'}
                )

    def save(self, *args, **kwargs):
        """Forzar procesamiento de imagen antes de guardar"""
        self.full_clean()  
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        """Eliminar archivo de imagen al borrar el producto"""
        if self.imagen:
            if os.path.isfile(self.imagen.path):
                os.remove(self.imagen.path)
        super().delete(*args, **kwargs)

    def __str__(self):
        return f"{self.nombre} ({self.get_categoria_display()})"

    class Meta:
        verbose_name = "Producto"
        verbose_name_plural = "Productos"
        ordering = ['categoria', 'nombre']
    
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