🍽️ App Restaurante

Sistema de Gestión y Pedidos para Restaurantes

📌 Descripción general

Este proyecto corresponde al desarrollo de un sistema web para la gestión integral de pedidos en un restaurante, orientado tanto a clientes como a personal interno (administradores y meseros).

El sistema permite la visualización del menú y promociones, la realización y seguimiento de pedidos en tiempo real, la gestión de inventario y promociones, así como la administración completa del restaurante desde un panel centralizado.

La aplicación fue desarrollada con una arquitectura desacoplada, separando frontend, backend y base de datos para garantizar escalabilidad, seguridad y facilidad de mantenimiento.

🧱 Arquitectura del sistema

Frontend: Next.js

Backend: Python – Django / Django REST Framework

Base de datos: PostgreSQL

Contenedores: Docker

👥 Tipos de usuario

Administrador

Mesero

Cliente

Cada rol cuenta con permisos y vistas específicas dentro del sistema.

📖 Historias de usuario

El sistema fue diseñado a partir de 36 historias de usuario, cubriendo los principales flujos del negocio:

Autenticación de clientes y personal

Gestión de pedidos y pagos

Seguimiento en tiempo real

Gestión de productos, inventario y promociones

Notificaciones y administración

El detalle completo de las historias de usuario se encuentra documentado en la Wiki del repositorio.

⚙️ Instalación local
🔧 Requisitos previos

Docker

Docker Compose

Node.js (v18 o superior recomendado)

Python 3.10+

Git

🐳 Clonar el repositorio
git clone https://github.com/Valery-Rosero/ISWElectiva110202-17.git
cd ISWElectiva110202-17

🗄️ Configuración del backend (Django)

Acceder a la carpeta del backend:

cd AppRestaurante


Crear el archivo .env con las variables necesarias:

DEBUG=True
SECRET_KEY=your_secret_key
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=db
DB_PORT=5432


Levantar los servicios con Docker:

docker-compose up --build


Ejecutar las migraciones:

docker-compose exec backend python manage.py migrate


(Opcional) Crear un superusuario:

docker-compose exec backend python manage.py createsuperuser


Backend disponible en:

http://localhost:8000

🌐 Configuración del frontend (Next.js)

Acceder a la carpeta del frontend:

cd AppRestauranteFront


Instalar dependencias:

npm install


Crear el archivo .env.local:

NEXT_PUBLIC_API_URL=http://localhost:8000


Iniciar el servidor de desarrollo:

npm run dev


Frontend disponible en:

http://localhost:3000

🧪 Tecnologías utilizadas
Tecnología	Uso
Python	Backend
Django / DRF	API REST
Next.js	Frontend
PostgreSQL	Base de datos
Docker	Contenedores
JavaScript	Lógica frontend
CSS / HTML	Interfaz
