from django.contrib import admin
from .models import Empleado, Producto
from .models import Promocion
from django.utils.html import format_html

@admin.register(Empleado)
class EmpleadoAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'tipo_empleado')
    search_fields = ('username', 'email')

@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'categoria', 'precio', 'estado', 'imagen_preview')
    readonly_fields = ('imagen_preview',)
    
    def imagen_preview(self, obj):
        if obj.imagen:
            return format_html('<img src="{}" width="50" />', obj.imagen.url)
        return "Sin imagen"
    imagen_preview.short_description = 'Vista previa'

@admin.register(Promocion)
class PromocionAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'descuento', 'fecha_inicio', 'fecha_fin', 'estado', 'esta_activa')
    list_filter = ('estado', 'fecha_inicio', 'fecha_fin')
    search_fields = ('nombre', 'descripcion')
    filter_horizontal = ('productos',)