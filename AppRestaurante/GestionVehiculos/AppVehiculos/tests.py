import os
from decimal import Decimal
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

from .models import Producto, Promocion, Cliente
from .serializers import CustomTokenObtainPairSerializer, ClienteRegistroSerializer

User = get_user_model()

# MODELOS
class EmpleadoModelTests(TestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username='admin',
            email='admin@test.com',
            password='adminpass',
            tipo_empleado='ADM'
        )
        self.mesero = User.objects.create_user(
            username='mesero',
            email='mesero@test.com',
            password='meseropass',
            tipo_empleado='MES'
        )

    def test_empleado_roles_y_str(self):
        self.assertTrue(self.admin.is_admin())
        self.assertFalse(self.mesero.is_admin())
        self.assertEqual(str(self.admin), 'admin (Administrador)')
        self.assertEqual(str(self.mesero), 'mesero (Mesero)')


class ProductoModelTests(TestCase):
    def test_producto_fields(self):
        p = Producto.objects.create(
            nombre='Hamburguesa',
            categoria='PLATO_PRINCIPAL',
            descripcion='Deliciosa',
            precio=10.99,
            estado='DISPONIBLE'
        )
        self.assertEqual(p.get_categoria_display(), 'Plato Principal')
        self.assertEqual(p.precio, Decimal('10.99'))
        self.assertEqual(p.estado, 'DISPONIBLE')


class PromocionModelTests(TestCase):
    def setUp(self):
        self.prod = Producto.objects.create(
            nombre='X',
            categoria='BEBIDA',
            precio=5
        )

    def test_promocion_activa_e_inactiva(self):
        activa = Promocion.objects.create(
            nombre='Activa',
            descripcion='Promo',
            descuento=10.00,
            fecha_inicio=timezone.now().date(),
            fecha_fin=timezone.now().date() + timezone.timedelta(days=5),
            estado='ACTIVA'
        )
        activa.productos.add(self.prod)
        self.assertTrue(activa.esta_activa())
        self.assertEqual(activa.productos.count(), 1)

        inactiva = Promocion.objects.create(
            nombre='Inactiva',
            descripcion='Promo',
            descuento=15.00,
            fecha_inicio=timezone.now().date() - timezone.timedelta(days=10),
            fecha_fin=timezone.now().date() - timezone.timedelta(days=5),
            estado='ACTIVA'
        )
        self.assertFalse(inactiva.esta_activa())


class ClienteModelTests(TestCase):
    def test_cliente_password_and_str(self):
        cliente = Cliente.objects.create(usuario='cliente', email='x@x.com')
        cliente.set_password('secure')
        cliente.save()
        self.assertTrue(cliente.check_password('secure'))
        self.assertEqual(str(cliente), 'cliente')


# SERIALIZERS
class SerializerTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass',
            tipo_empleado='ADM'
        )

    def test_token_serializer_fields(self):
        serializer = CustomTokenObtainPairSerializer(data={
            'username': 'testuser',
            'password': 'testpass'
        })
        self.assertTrue(serializer.is_valid())
        data = serializer.validate(serializer.initial_data)
        self.assertIn('access', data)
        self.assertEqual(data['username'], 'testuser')
        self.assertEqual(data['tipo_empleado'], 'ADM')

    def test_cliente_registro_serializer(self):
        serializer = ClienteRegistroSerializer(data={
            'usuario': 'nuevo',
            'email': 'nuevo@test.com',
            'password': 'pass123'
        })
        self.assertTrue(serializer.is_valid())
        cliente = serializer.save()
        self.assertEqual(cliente.usuario, 'nuevo')
        self.assertTrue(cliente.check_password('pass123'))


# API
class APITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(
            username='admin',
            email='admin@test.com',
            password='adminpass',
            tipo_empleado='ADM'
        )
        self.mesero = User.objects.create_user(
            username='mesero',
            email='mesero@test.com',
            password='meseropass',
            tipo_empleado='MES'
        )
        self.cliente = Cliente.objects.create(usuario='cliente', email='cliente@test.com')
        self.cliente.set_password('clientepass')
        self.cliente.save()

        self.producto = Producto.objects.create(
            nombre='Producto API',
            categoria='PLATO_PRINCIPAL',
            precio=12.50
        )

    def get_token(self, user):
        return str(RefreshToken.for_user(user).access_token)

    def test_login_y_registro(self):
        # Empleado
        response = self.client.post('/api/token/', {
            'username': 'admin', 'password': 'adminpass'
        })
        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)

        # Cliente
        response = self.client.post('/api/clientes/login/', {
            'usuario': 'cliente', 'password': 'clientepass'
        })
        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)

        # Registro cliente
        response = self.client.post('/api/clientes/registro/', {
            'usuario': 'nuevo',
            'email': 'nuevo@x.com',
            'password': 'pass321'
        })
        self.assertEqual(response.status_code, 201)
        self.assertTrue(Cliente.objects.filter(usuario='nuevo').exists())

    def test_producto_listado_y_creacion(self):
        # Sin login
        response = self.client.get('/api/productos/')
        self.assertEqual(response.status_code, 200)

        # Mesero no autorizado para crear
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.get_token(self.mesero)}')
        response = self.client.post('/api/productos/', {
            'nombre': 'No permitido',
            'categoria': 'BEBIDA',
            'precio': 5.99
        })
        self.assertEqual(response.status_code, 403)

        # Admin autorizado para crear
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.get_token(self.admin)}')
        response = self.client.post('/api/productos/', {
            'nombre': 'Permitido',
            'categoria': 'BEBIDA',
            'precio': 6.99
        })
        self.assertEqual(response.status_code, 201)
        self.assertTrue(Producto.objects.filter(nombre='Permitido').exists())


# ADMIN
class AdminTests(TestCase):
    def setUp(self):
        self.superuser = User.objects.create_superuser(
            username='superadmin',
            email='super@test.com',
            password='superpass',
            tipo_empleado='ADM'
        )
        self.client.force_login(self.superuser)
        Producto.objects.create(nombre='Admin Producto', categoria='POSTRE', precio=8.99)

    def test_admin_producto_list_view(self):
        response = self.client.get('/admin/restaurante/producto/')
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Admin Producto')