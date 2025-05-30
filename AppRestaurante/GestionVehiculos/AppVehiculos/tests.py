from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from django.contrib.auth.models import User
from .models import Empleado, Producto, Promocion
from django.utils import timezone
from datetime import timedelta

class EmpleadoTests(APITestCase):
    def setUp(self):
        # Crear un administrador para pruebas
        self.admin = Empleado.objects.create_user(
            username='admin',
            password='admin123',
            tipo_empleado='ADM',
            email='admin@test.com'
        )
        
        self.mesero = Empleado.objects.create_user(
            username='mesero',
            password='mesero123',
            tipo_empleado='MES',
            email='mesero@test.com'
        )
        
        self.admin_client = APIClient()
        self.admin_client.force_authenticate(user=self.admin)
        
        self.mesero_client = APIClient()
        self.mesero_client.force_authenticate(user=self.mesero)
        
        self.anon_client = APIClient()

    def test_login(self):
        url = reverse('token_obtain_pair')
        data = {'username': 'admin', 'password': 'admin123'}
        response = self.anon_client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['username'], 'admin')
        self.assertEqual(response.data['tipo_empleado'], 'ADM')
        self.assertTrue(response.data['is_admin'])

    def test_crear_empleado_como_admin(self):
        url = reverse('empleado-list')
        data = {
            'username': 'nuevo',
            'email': 'nuevo@test.com',
            'tipo_empleado': 'MES',
            'password': 'nuevo123'
        }
        response = self.admin_client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Empleado.objects.count(), 3)
        self.assertEqual(response.data['username'], 'nuevo')
        self.assertEqual(response.data['tipo_empleado'], 'MES')

    def test_crear_empleado_como_mesero_debe_fallar(self):
        url = reverse('empleado-list')
        data = {
            'username': 'nuevo',
            'email': 'nuevo@test.com',
            'tipo_empleado': 'MES',
            'password': 'nuevo123'
        }
        response = self.mesero_client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Empleado.objects.count(), 2)

class ProductoTests(APITestCase):
    def setUp(self):
        self.admin = Empleado.objects.create_user(
            username='admin',
            password='admin123',
            tipo_empleado='ADM',
            email='admin@test.com'
        )
        self.mesero = Empleado.objects.create_user(
            username='mesero',
            password='mesero123',
            tipo_empleado='MES',
            email='mesero@test.com'
        )
        
        self.producto1 = Producto.objects.create(
            nombre='Producto 1',
            categoria='PLATO_PRINCIPAL',
            descripcion='Descripción 1',
            precio=10.99,
            estado='DISPONIBLE'
        )
        self.producto2 = Producto.objects.create(
            nombre='Producto 2',
            categoria='BEBIDA',
            descripcion='Descripción 2',
            precio=5.99,
            estado='FUERA_STOCK'
        )
        
        self.admin_client = APIClient()
        self.admin_client.force_authenticate(user=self.admin)
        self.mesero_client = APIClient()
        self.mesero_client.force_authenticate(user=self.mesero)
        self.anon_client = APIClient()

    def test_listar_productos(self):
        url = reverse('producto-list')
        response = self.anon_client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(response.data[0]['nombre'], 'Producto 1')
        self.assertEqual(response.data[1]['nombre'], 'Producto 2')

    def test_obtener_producto_especifico(self):
        url = reverse('producto-detail', args=[self.producto1.id])
        response = self.anon_client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['nombre'], 'Producto 1')
        self.assertEqual(response.data['precio'], '10.99')

    def test_crear_producto_como_admin(self):
        url = reverse('producto-list')
        data = {
            'nombre': 'Nuevo Producto',
            'categoria': 'ENTRADA',
            'descripcion': 'Nueva descripción',
            'precio': 7.50,
            'estado': 'DISPONIBLE'
        }
        response = self.admin_client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Producto.objects.count(), 3)
        self.assertEqual(response.data['nombre'], 'Nuevo Producto')

    def test_crear_producto_como_mesero_debe_fallar(self):
        url = reverse('producto-list')
        data = {
            'nombre': 'Nuevo Producto',
            'categoria': 'ENTRADA',
            'descripcion': 'Nueva descripción',
            'precio': 7.50,
            'estado': 'DISPONIBLE'
        }
        response = self.mesero_client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Producto.objects.count(), 2)

    def test_actualizar_producto_como_admin(self):
        url = reverse('producto-detail', args=[self.producto1.id])
        data = {
            'nombre': 'Producto Actualizado',
            'categoria': 'PLATO_PRINCIPAL',
            'descripcion': 'Descripción actualizada',
            'precio': 12.99,
            'estado': 'DISPONIBLE'
        }
        response = self.admin_client.put(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.producto1.refresh_from_db()
        self.assertEqual(self.producto1.nombre, 'Producto Actualizado')
        self.assertEqual(float(self.producto1.precio), 12.99)

    def test_actualizacion_parcial_producto(self):
        url = reverse('producto-detail', args=[self.producto1.id])
        data = {'precio': 15.99}
        response = self.admin_client.patch(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.producto1.refresh_from_db()
        self.assertEqual(float(self.producto1.precio), 15.99)

    def test_toggle_estado_producto(self):
        url = reverse('producto-detail', args=[self.producto1.id])
        data = {'estado': 'toggle'}
        response = self.admin_client.patch(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.producto1.refresh_from_db()
        self.assertEqual(self.producto1.estado, 'FUERA_STOCK')
        
        # Toggle again
        response = self.admin_client.patch(url, data, format='json')
        self.producto1.refresh_from_db()
        self.assertEqual(self.producto1.estado, 'DISPONIBLE')

    def test_eliminar_producto_como_admin(self):
        url = reverse('producto-detail', args=[self.producto1.id])
        response = self.admin_client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Producto.objects.count(), 1)

    def test_eliminar_producto_como_mesero_debe_fallar(self):
        url = reverse('producto-detail', args=[self.producto1.id])
        response = self.mesero_client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Producto.objects.count(), 2)


class PromocionTests(APITestCase):
    def setUp(self):
        self.admin = Empleado.objects.create_user(
            username='admin',
            password='admin123',
            tipo_empleado='ADM',
            email='admin@test.com'
        )
        self.mesero = Empleado.objects.create_user(
            username='mesero',
            password='mesero123',
            tipo_empleado='MES',
            email='mesero@test.com'
        )
        
        self.producto1 = Producto.objects.create(
            nombre='Producto 1',
            categoria='PLATO_PRINCIPAL',
            descripcion='Descripción 1',
            precio=10.99,
            estado='DISPONIBLE'
        )
        self.producto2 = Producto.objects.create(
            nombre='Producto 2',
            categoria='BEBIDA',
            descripcion='Descripción 2',
            precio=5.99,
            estado='DISPONIBLE'
        )
        
        self.promocion = Promocion.objects.create(
            nombre='Promoción Test',
            descripcion='Descripción promoción',
            descuento=10.00,
            fecha_inicio=timezone.now().date(),
            fecha_fin=timezone.now().date() + timedelta(days=7),
            estado='ACTIVA'
        )
        self.promocion.productos.add(self.producto1)
        
        self.admin_client = APIClient()
        self.admin_client.force_authenticate(user=self.admin)
        self.mesero_client = APIClient()
        self.mesero_client.force_authenticate(user=self.mesero)
        self.anon_client = APIClient()

    def test_listar_promociones(self):
        url = reverse('promocion-list')
        response = self.anon_client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['nombre'], 'Promoción Test')

    def test_obtener_promocion_especifica(self):
        url = reverse('promocion-detail', args=[self.promocion.id])
        response = self.anon_client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['nombre'], 'Promoción Test')
        self.assertEqual(len(response.data['productos']), 1)

    def test_crear_promocion_como_admin(self):
        url = reverse('promocion-list')
        data = {
            'nombre': 'Nueva Promoción',
            'descripcion': 'Descripción nueva',
            'descuento': 15.00,
            'productos': [self.producto1.id, self.producto2.id],
            'fecha_inicio': timezone.now().date().isoformat(),
            'fecha_fin': (timezone.now().date() + timedelta(days=14)).isoformat(),
            'estado': 'ACTIVA'
        }
        response = self.admin_client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Promocion.objects.count(), 2)
        self.assertEqual(response.data['nombre'], 'Nueva Promoción')
        self.assertEqual(len(response.data['productos']), 2)

    def test_crear_promocion_como_mesero_debe_fallar(self):
        url = reverse('promocion-list')
        data = {
            'nombre': 'Nueva Promoción',
            'descripcion': 'Descripción nueva',
            'descuento': 15.00,
            'productos': [self.producto1.id, self.producto2.id],
            'fecha_inicio': timezone.now().date().isoformat(),
            'fecha_fin': (timezone.now().date() + timedelta(days=14)).isoformat(),
            'estado': 'ACTIVA'
        }
        response = self.mesero_client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Promocion.objects.count(), 1)

    def test_actualizar_promocion_como_admin(self):
        url = reverse('promocion-detail', args=[self.promocion.id])
        data = {
            'nombre': 'Promoción Actualizada',
            'descripcion': 'Descripción actualizada',
            'descuento': 20.00,
            'productos': [self.producto2.id],
            'fecha_inicio': timezone.now().date().isoformat(),
            'fecha_fin': (timezone.now().date() + timedelta(days=14)).isoformat(),
            'estado': 'ACTIVA'
        }
        response = self.admin_client.put(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.promocion.refresh_from_db()
        self.assertEqual(self.promocion.nombre, 'Promoción Actualizada')
        self.assertEqual(float(self.promocion.descuento), 20.00)
        self.assertEqual(self.promocion.productos.count(), 1)

    def test_actualizar_promocion_como_mesero_debe_fallar(self):
        url = reverse('promocion-detail', args=[self.promocion.id])
        data = {
            'nombre': 'Promoción Actualizada',
            'descripcion': 'Descripción actualizada',
            'descuento': 20.00,
            'productos': [self.producto2.id],
            'fecha_inicio': timezone.now().date().isoformat(),
            'fecha_fin': (timezone.now().date() + timedelta(days=14)).isoformat(),
            'estado': 'ACTIVA'
        }
        response = self.mesero_client.put(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.promocion.refresh_from_db()
        self.assertEqual(self.promocion.nombre, 'Promoción Test')  # No cambió

    def test_eliminar_promocion_como_admin(self):
        url = reverse('promocion-detail', args=[self.promocion.id])
        response = self.admin_client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Promocion.objects.count(), 0)

    def test_eliminar_promocion_como_mesero_debe_fallar(self):
        url = reverse('promocion-detail', args=[self.promocion.id])
        response = self.mesero_client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Promocion.objects.count(), 1)

    def test_esta_activa_method(self):
        # Promoción activa
        self.assertTrue(self.promocion.esta_activa())
        
        # Promoción inactiva por estado
        self.promocion.estado = 'INACTIVA'
        self.promocion.save()
        self.assertFalse(self.promocion.esta_activa())
        self.promocion.estado = 'ACTIVA'
        self.promocion.save()
        
        # Promoción inactiva por fecha
        self.promocion.fecha_inicio = timezone.now().date() + timedelta(days=1)
        self.promocion.save()
        self.assertFalse(self.promocion.esta_activa())
        
        self.promocion.fecha_inicio = timezone.now().date()
        self.promocion.fecha_fin = timezone.now().date() - timedelta(days=1)
        self.promocion.save()
        self.assertFalse(self.promocion.esta_activa())