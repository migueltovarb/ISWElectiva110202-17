---

# 🍽️ App Restaurante

Sistema de gestión y pedidos para restaurantes.

---

## 📌 Descripción general

**App Restaurante** es un sistema web diseñado para la **gestión integral de pedidos en un restaurante**, dirigido tanto a **clientes** como a **personal interno** (administradores y meseros).

El sistema permite la visualización del menú y promociones, la realización de pedidos personalizados, el seguimiento de pedidos en tiempo real y la administración del inventario y promociones desde un panel centralizado.

La aplicación utiliza una **arquitectura desacoplada**, separando frontend, backend y base de datos, lo que garantiza **escalabilidad, seguridad y facilidad de mantenimiento**.

---

## 🧱 Arquitectura del sistema

* 🎨 **Frontend:** Next.js
* ⚙️ **Backend:** Python – Django / Django REST Framework
* 🗄️ **Base de datos:** PostgreSQL
* 🐳 **Contenedores:** Docker

---

## 👥 Tipos de usuario

* 👑 **Administrador**
* 🍽️ **Mesero**
* 👤 **Cliente**

Cada tipo de usuario cuenta con permisos y vistas específicas dentro del sistema.

---

## 📖 Historias de usuario

El sistema fue desarrollado a partir de **36 historias de usuario**, que cubren los principales flujos del negocio, entre ellos:

* 🔐 Autenticación de clientes y personal
* 🛒 Gestión de pedidos y pagos
* ⏱️ Seguimiento de pedidos en tiempo real
* 📦 Gestión de productos, inventario y promociones
* 🔔 Notificaciones y administración

El detalle completo de las historias de usuario se encuentra documentado en la **Wiki del repositorio**.

---

## ⚙️ Instalación local

### 🔧 Requisitos previos

* Docker
* Docker Compose
* Node.js (v18 o superior recomendado)
* Python 3.10 o superior
* Git

---

### 🐳 Clonar el repositorio

```bash
git clone https://github.com/Valery-Rosero/ISWElectiva110202-17.git
cd ISWElectiva110202-17
```

---

### 🗄️ Configuración del backend (Django)

1. Acceder a la carpeta del backend:

```bash
cd AppRestaurante
```

2. Crear el archivo `.env` con las variables necesarias:

```env
DEBUG=True
SECRET_KEY=your_secret_key
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=db
DB_PORT=5432
```

3. Levantar los servicios con Docker:

```bash
docker-compose up --build
```

4. Ejecutar las migraciones:

```bash
docker-compose exec backend python manage.py migrate
```

5. (Opcional) Crear un superusuario:

```bash
docker-compose exec backend python manage.py createsuperuser
```

Backend disponible en:

```
http://localhost:8000
```

---

### 🌐 Configuración del frontend (Next.js)

1. Acceder a la carpeta del frontend:

```bash
cd AppRestauranteFront
```

2. Instalar las dependencias:

```bash
npm install
```

3. Crear el archivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

4. Iniciar el servidor de desarrollo:

```bash
npm run dev
```

Frontend disponible en:

```
http://localhost:3000
```

---

## 🧪 Tecnologías utilizadas

* 🐍 Python
* 🧩 Django / Django REST Framework
* ⚛️ Next.js
* 🐘 PostgreSQL
* 🐳 Docker
* 📜 JavaScript
* 🎨 CSS / HTML

---


