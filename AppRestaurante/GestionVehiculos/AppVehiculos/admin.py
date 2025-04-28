from django.contrib import admin
from .models import Empleado, Producto
from .models import Promocion

@admin.register(Empleado)
class EmpleadoAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'tipo_empleado')
    search_fields = ('username', 'email')

@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'categoria', 'precio', 'estado')
    list_filter = ('categoria', 'estado')
    search_fields = ('nombre', 'descripcion')

# Añade esto al final de admin.py
@admin.register(Promocion)
class PromocionAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'descuento', 'fecha_inicio', 'fecha_fin', 'estado', 'esta_activa')
    list_filter = ('estado', 'fecha_inicio', 'fecha_fin')
    search_fields = ('nombre', 'descripcion')
    filter_horizontal = ('productos',)