# 📚 PoliChan - Red Social Universitaria

## 📋 Tabla de Contenidos

- [Descripción](#descripción)
- [Características](#características)
- [Tecnologías](#tecnologías)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Arquitectura](#arquitectura)
- [Páginas](#páginas)
- [Componentes Principales](#componentes-principales)
- [Hooks Personalizados](#hooks-personalizados)
- [Rutas](#rutas)
- [Guía de Instalación](#guía-de-instalación)
- [Guía de Desarrollo](#guía-de-desarrollo)

---

## 📖 Descripción

PoliChan es una red social universitaria construida con React, TypeScript y Vite. Permite a los usuarios compartir publicaciones, comentar, dar me gusta y gestionar su perfil. El proyecto implementa autenticación, temas claro/oscuro, y una arquitectura escalable con el patrón Repository.

---

## ✨ Características

- ✅ **Autenticación completa** (Login/Registro)
- ✅ **Feed de publicaciones** con interacciones en tiempo real
- ✅ **Sistema de comentarios** en modal
- ✅ **Me gusta** en publicaciones y comentarios
- ✅ **Perfil de usuario** con lista de publicaciones
- ✅ **Tema claro/oscuro** con persistencia
- ✅ **Diseño responsive** con sidebar colapsable
- ✅ **Spinners de carga** en todas las acciones asíncronas
- ✅ **UI moderna** con shadcn/ui y Lucide Icons
- ✅ **Arquitectura limpia** con patrón Repository

---

## 🛠️ Tecnologías

- **React 19.1.1** - Framework de UI
- **TypeScript 5.9.3** - Tipado estático
- **Vite 7.1.7** - Build tool
- **React Router 7.9.5** - Enrutamiento
- **Tailwind CSS 4.1.16** - Estilos
- **shadcn/ui** - Componentes UI
- **Lucide React** - Iconos
- **Axios** - Cliente HTTP
- **ESLint** - Linter

---

## 🏗️ Estructura del Proyecto

```
src/
├── components/
│   ├── auth/                    # Componentes de autenticación
│   │   ├── LoginForm.tsx        # Formulario de inicio de sesión
│   │   └── RegisterForm.tsx     # Formulario de registro
│   ├── layout/                  # Componentes de layout
│   │   ├── Layout.tsx           # Layout principal con sidebar
│   │   ├── ProtectedLayout.tsx  # Wrapper para rutas protegidas
│   │   ├── ProtectedRoute.tsx   # Guard de autenticación
│   │   └── PublicRoute.tsx      # Guard para rutas públicas
│   ├── posts/                   # Componentes de publicaciones
│   │   ├── PostCard.tsx         # Tarjeta de publicación
│   │   ├── PostSubmissionForm.tsx # Formulario de nueva publicación
│   │   └── UserPostsList.tsx    # Lista de publicaciones de usuario
│   ├── sidebar/                 # Componentes del sidebar
│   │   ├── AppSidebar.tsx       # Sidebar principal
│   │   ├── NavMain.tsx          # Navegación principal
│   │   └── NavUser.tsx          # Menú de usuario
│   ├── ui/                      # Componentes shadcn/ui
│   │   ├── avatar.tsx
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── sidebar.tsx
│   │   ├── spinner.tsx
│   │   └── ...
│   └── ModalPost.tsx            # Modal de detalles de publicación
│
├── contexts/                    # Contextos de React
│   ├── AuthContext.ts           # Contexto de autenticación
│   ├── AuthProvider.tsx         # Proveedor de autenticación
│   ├── ThemeContext.ts          # Contexto de tema
│   └── ThemeProvider.tsx        # Proveedor de tema
│
├── hooks/                       # Hooks personalizados
│   ├── use-auth.ts              # Hook de autenticación
│   ├── use-mobile.ts            # Detección de dispositivo móvil
│   ├── use-posts.ts             # Hooks de publicaciones (usePosts, usePost, useUserPosts)
│   ├── use-sidebar.ts           # Control del sidebar
│   └── use-theme.ts             # Control del tema
│
├── lib/                         # Utilidades
│   ├── api.ts                   # Configuración de Axios
│   └── utils.ts                 # Funciones auxiliares
│
├── pages/                       # Páginas de la aplicación
│   ├── FeedPage.tsx             # Feed principal
│   ├── LoginPage.tsx            # Página de inicio de sesión
│   ├── ProfilePage.tsx          # Perfil de usuario
│   └── RegisterPage.tsx         # Página de registro
│
├── repositories/                # Capa de acceso a datos
│   ├── auth.repository.ts       # Repositorio de autenticación (API real)
│   ├── auth.repository.mock.ts  # Mock de autenticación
│   ├── post.repository.ts       # Repositorio de publicaciones (API real)
│   └── post.repository.mock.ts  # Mock de publicaciones
│
├── services/                    # Lógica de negocio
│   ├── auth.service.ts          # Servicio de autenticación
│   └── post.service.ts          # Servicio de publicaciones
│
├── types/                       # Definiciones TypeScript
│   ├── auth.types.ts            # Tipos de autenticación
│   └── post.types.ts            # Tipos de publicaciones
│
├── App.tsx                      # Configuración de rutas
├── main.tsx                     # Punto de entrada
└── index.css                    # Estilos globales
```

---

## 🏛️ Arquitectura

### Patrón Repository

El proyecto implementa el patrón Repository para separar la lógica de acceso a datos:

```
UI Components → Hooks → Services → Repositories → API
```

**Ventajas:**

- ✅ Fácil de testear (implementaciones mock)
- ✅ Separación de responsabilidades
- ✅ Cambio sencillo entre fuentes de datos (mock/API real)
- ✅ Lógica de negocio centralizada

### Flujo de Autenticación

```
1. Usuario ingresa credenciales
2. LoginForm → useAuth hook
3. useAuth → authService.login()
4. authService → authRepository.login()
5. authRepository → API (axios)
6. Respuesta → Actualiza AuthContext
7. Usuario almacenado en localStorage
8. Redirección a /feed
```

### Flujo de Publicaciones

```
1. Componente llama a custom hook (usePosts/usePost/useUserPosts)
2. Hook maneja estado (loading, error, data)
3. Hook llama a postService
4. postService → postRepository
5. postRepository → Mock o API
6. Respuesta actualiza el estado del hook
7. Componente re-renderiza automáticamente
```

---

## 📄 Páginas

### 🔑 LoginPage (`/` y `/login`)

**Descripción:** Página de inicio de sesión, también es la ruta por defecto.

**Características:**

- Formulario con username y contraseña
- Validación de campos
- Spinner de carga durante autenticación
- Link para navegar a registro
- Redirección automática a `/feed` si ya está autenticado
- Redirección a `/feed` tras login exitoso

**Usuarios de prueba:**

- Admin: `admin` / `password123`
- Usuario: `user` / `password123`

### 📝 RegisterPage (`/register`)

**Descripción:** Página de registro de nuevos usuarios.

**Características:**

- Campos: Nombre, Apellido, Username (con prefijo @), Contraseña, Confirmar contraseña
- Validación de campos requeridos
- Validación de coincidencia de contraseñas
- Spinner de carga durante registro
- Link para navegar a login
- Componentes shadcn/ui con InputGroup
- Redirección a `/feed` tras registro exitoso

### 📰 FeedPage (`/feed`)

**Ruta protegida** - Requiere autenticación

**Descripción:** Feed principal de publicaciones de todos los usuarios.

**Características:**

- Formulario para crear nuevas publicaciones (280 caracteres máx)
- Contador de caracteres
- Validación de contenido
- Lista de publicaciones ordenadas por fecha
- Interacciones:
  - ❤️ Me gusta en publicaciones
  - 💬 Ver detalles y comentarios (abre modal)
  - 🔄 Compartir
- Avatar con gradiente de fondo
- Timestamp relativo (ej: "hace 2 horas")
- Estado de carga con skeleton
- Modal de detalles al hacer clic en una publicación

### 👤 ProfilePage (`/profile`)

**Ruta protegida** - Requiere autenticación

**Descripción:** Perfil del usuario autenticado.

**Características:**

- **Header del perfil:**
  - Banner con gradiente
  - Avatar grande con gradiente de fondo
  - Nombre completo y @username
  - Botón "Editar Perfil" (con modal de edición)
  - Contador de publicaciones
- **Sección About:**
  - Información del usuario
  - Nombre y username
- **Lista de publicaciones del usuario:**
  - Todas las publicaciones del usuario
  - Click en publicación abre modal de detalles
  - Estados de carga
  - Mensaje cuando no hay publicaciones

### Modal de Publicación (ModalPost)

**Descripción:** Modal que muestra los detalles completos de una publicación.

**Características:**

- Información completa de la publicación
- Avatar y nombre del autor
- Contenido completo
- Botones de interacción (me gusta, comentar, compartir)
- **Sección de comentarios:**
  - Lista de comentarios existentes
  - Formulario para agregar nuevos comentarios
  - Me gusta en comentarios individuales
  - Spinner durante envío de comentario
- Estados de carga con skeleton
- Cierre al hacer clic fuera o en botón de cerrar

---

3. useAuth → authService.login()
4. authService → authRepository.login()
5. authRepository → API (axios)
6. Respuesta → Actualiza AuthContext
7. Redirección a /feed

````

---

## 📄 Páginas Principales

### 🏠 HomePage (`/`)

- Página de bienvenida (landing page)
- Accesible sin autenticación
- Debe tener información sobre la app y botones para login/registro

### 🔑 LoginPage (`/login`)

- Formulario de inicio de sesión
- Validación de credenciales
- Redirección a `/feed` después del login exitoso
- **Usuarios de prueba:**
  - `admin@polichan.com` / `password123`
  - `user@polichan.com` / `password123`

### 📝 RegisterPage (`/register`)

- Formulario de registro
- Validación de email y contraseña
- Confirmación de contraseña
- Redirección a `/feed` después del registro

### 📰 FeedPage (`/feed`)

- **Ruta protegida** (requiere autenticación)
- Feed principal de posts
- Formulario para crear nuevos posts
- Lista de posts con:
  - Avatar del usuario
  - Contenido del post
  - Botones: Comentarios, Likes, Compartir
  - Timestamp

### 📝 PostPage (`/post/:id`)

- **Ruta protegida**
- Vista detallada de un post individual
- Parámetro: `id` del post
- Sección de comentarios:
  - Formulario para agregar comentarios
  - Lista de comentarios existentes
  - Respuestas a comentarios

### 👤 ProfilePage (`/profile`)

- **Ruta protegida**
- Perfil del usuario autenticado
- Información:
  - Imagen de portada
  - Avatar
  - Nombre y email
  - Estadísticas: Posts, Followers, Following
  - Sección "About" con detalles
  - Lista de posts del usuario
- Botón "Edit Profile" (funcionalidad pendiente)

---

## 🧩 Componentes

### Layout Components

#### `Layout.tsx`

Layout principal para páginas protegidas.

**Características:**

- Sidebar colapsable
---

## 🧩 Componentes Principales

### Layout Components

#### `Layout.tsx`

Layout principal que envuelve todas las páginas protegidas.

**Características:**

- Sidebar colapsable integrado
- Header responsive con botón de toggle
- Área de contenido centrada
- Gestión automática de estado del sidebar
- Títulos dinámicos según la ruta

#### `ProtectedLayout.tsx`

Wrapper para rutas protegidas usando `<Outlet />` de React Router.

**Funcionalidad:**

- Verifica autenticación del usuario
- Muestra loading durante la verificación
- Redirecciona a `/login` si no está autenticado
- Renderiza `Layout` con el contenido protegido

#### `PublicRoute.tsx`

Guard para rutas públicas que redirecciona usuarios autenticados.

**Funcionalidad:**

- Detecta si el usuario ya está autenticado
- Redirecciona a `/feed` si está autenticado
- Permite acceso si no está autenticado

### Sidebar Components

#### `AppSidebar.tsx`

Sidebar de navegación principal de la aplicación.

**Navegación:**

```typescript
const navItems = [
  { title: 'Feed', url: '/feed', icon: Home },
  { title: 'Perfil', url: '/profile', icon: User },
]
````

**Características:**

- Logo de PoliChan con icono
- Navegación con íconos de Lucide
- Resalta la ruta activa
- Modo colapsado que oculta texto
- Componentes `NavMain` y `NavUser`

#### `NavMain.tsx`

Renderiza los elementos de navegación del sidebar.

**Props:**

```typescript
interface NavMainProps {
  items: Array<{
    title: string
    url: string
    icon: LucideIcon
    isActive?: boolean
  }>
}
```

#### `NavUser.tsx`

Menú desplegable del usuario en el footer del sidebar.

**Opciones:**

- 👤 Ver perfil
- 🌙/☀️ Cambiar tema
- 🚪 Cerrar sesión

**Características:**

- Avatar con gradiente de fondo
- Muestra nombre y @username
- Dropdown con opciones

### Auth Components

#### `LoginForm.tsx`

Formulario de inicio de sesión con componentes shadcn/ui.

**Props:**

```typescript
interface LoginFormProps {
  onSubmit: (credentials: LoginCredentials) => Promise<void>
  onNavigateToRegister: () => void
}
```

**Características:**

- Campos: Username, Contraseña
- Validación de campos requeridos
- Manejo de errores
- Spinner durante carga
- Link a registro

#### `RegisterForm.tsx`

Formulario de registro con diseño en grid.

**Props:**

```typescript
interface RegisterFormProps {
  onSubmit: (credentials: RegisterCredentials) => Promise<void>
  onNavigateToLogin: () => void
}
```

**Características:**

- Campos en grid: Nombre y Apellido en una fila
- Username con prefijo @ usando InputGroup
- Validación de contraseñas
- Spinner durante carga
- Placeholders en español

### Post Components

#### `PostCard.tsx`

Tarjeta de publicación para el feed.

**Props:**

```typescript
interface PostCardProps {
  post: Post
  onLike: (postId: string) => void
  onClick: (postId: string) => void
}
```

**Características:**

- Avatar del autor con gradiente
- Contenido de la publicación
- Botones de interacción (me gusta, comentarios, compartir)
- Timestamp relativo
- Click para abrir modal de detalles

#### `PostSubmissionForm.tsx`

Formulario para crear nuevas publicaciones.

**Props:**

```typescript
interface PostSubmissionFormProps {
  onSubmit: (content: string) => Promise<void>
  onPostCreated: () => void
}
```

**Características:**

- Textarea con límite de 280 caracteres
- Contador de caracteres con alerta
- Validación de contenido
- Rate limiting (3 segundos entre posts)
- Spinner durante envío
- Manejo de errores

#### `UserPostsList.tsx`

Lista de publicaciones de un usuario específico.

**Props:**

```typescript
interface UserPostsListProps {
  posts: Post[]
  isLoading: boolean
  onPostClick: (postId: string) => void
}
```

**Características:**

- Skeleton loading
- Lista con scroll
- Click para abrir modal
- Mensaje cuando no hay publicaciones

#### `ModalPost.tsx`

Modal de detalles completos de una publicación.

**Props:**

```typescript
interface ModalPostProps {
  isOpen: boolean
  onClose: () => void
  postId: string
}
```

**Características:**

- Carga automática de la publicación y comentarios
- Skeleton durante carga
- Sección de comentarios con scroll
- Formulario para agregar comentarios
- Interacciones (me gusta en post y comentarios)
- Actualización optimista del UI

---

## 🎣 Hooks Personalizados

### `use-auth.ts`

Hook para gestionar la autenticación.

**Uso:**

```typescript
const { user, login, register, logout, isLoading } = useAuth()
```

**Funciones:**

- `login(credentials)` - Iniciar sesión
- `register(credentials)` - Registrar usuario
- `logout()` - Cerrar sesión
- `user` - Objeto del usuario autenticado
- `isLoading` - Estado de carga

### `use-posts.ts`

Hooks para gestionar publicaciones.

#### `usePosts()`

Hook para obtener todas las publicaciones del feed.

**Uso:**

```typescript
const { posts, isLoading, error, toggleLike, createPost, refetch } = usePosts()
```

**Funciones:**

- `posts` - Array de todas las publicaciones
- `isLoading` - Estado de carga
- `error` - Mensaje de error si existe
- `toggleLike(postId)` - Dar/quitar me gusta
- `createPost(content)` - Crear nueva publicación
- `refetch()` - Recargar publicaciones

#### `usePost(postId)`

Hook para obtener una publicación específica con sus comentarios.

**Uso:**

```typescript
const {
  postData,
  isLoading,
  error,
  toggleLike,
  toggleCommentLike,
  createComment,
  refetch,
} = usePost(postId)
```

**Funciones:**

- `postData` - Objeto `{ post, comments }`
- `toggleLike()` - Me gusta en la publicación
- `toggleCommentLike(commentId)` - Me gusta en comentario
- `createComment(content)` - Agregar comentario
- `refetch()` - Recargar datos

#### `useUserPosts(userId)`

Hook para obtener las publicaciones de un usuario.

**Uso:**

```typescript
const { posts, isLoading, error, refetch } = useUserPosts(userId)
```

### `use-theme.ts`

Hook para gestionar el tema claro/oscuro.

**Uso:**

```typescript
const { theme, setTheme } = useTheme()
```

**Valores de theme:**

- `"light"` - Tema claro
- `"dark"` - Tema oscuro
- `"system"` - Según sistema operativo

### `use-sidebar.ts`

Hook para controlar el estado del sidebar.

**Uso:**

```typescript
const {
  open,
  setOpen,
  openMobile,
  setOpenMobile,
  isMobile,
  state,
  toggleSidebar,
} = useSidebar()
```

### `use-mobile.ts`

Hook para detectar si el dispositivo es móvil.

**Uso:**

```typescript
const isMobile = useMobile()
```

---

## 🛣️ Rutas

### Configuración en `App.tsx`

```tsx
<Routes>
  {/* Rutas públicas */}
  <Route
    path="/"
    element={
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    }
  />
  <Route
    path="/login"
    element={
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    }
  />
  <Route
    path="/register"
    element={
      <PublicRoute>
        <RegisterPage />
      </PublicRoute>
    }
  />

  {/* Rutas protegidas */}
  <Route element={<ProtectedLayout />}>
    <Route path="/feed" element={<FeedPage />} />
    <Route path="/profile" element={<ProfilePage />} />
  </Route>

  {/* Ruta por defecto */}
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

### Tabla de Rutas

#### Rutas Públicas

| Ruta        | Componente   | Descripción            | Protección |
| ----------- | ------------ | ---------------------- | ---------- |
| `/`         | LoginPage    | Página de inicio       | Pública    |
| `/login`    | LoginPage    | Inicio de sesión       | Pública    |
| `/register` | RegisterPage | Registro de usuarios   | Pública    |
| `*`         | Navigate     | Redirección a `/login` | -          |

#### Rutas Protegidas

| Ruta       | Componente  | Descripción       | Requiere Auth |
| ---------- | ----------- | ----------------- | ------------- |
| `/feed`    | FeedPage    | Feed principal    | ✅            |
| `/profile` | ProfilePage | Perfil de usuario | ✅            |

**Nota:** La ruta `/post/:id` fue eliminada. Los detalles de las publicaciones ahora se muestran en un modal.

---

| Ruta        | Componente   | Descripción      |
| ----------- | ------------ | ---------------- |
| `/`         | HomePage     | Landing page     |
| `/login`    | LoginPage    | Inicio de sesión |
| `/register` | RegisterPage | Registro         |

### Rutas Protegidas

| Ruta        | Componente  | Descripción              |
| ----------- | ----------- | ------------------------ |
| `/feed`     | FeedPage    | Feed principal           |
| `/post/:id` | PostPage    | Vista de post individual |
| `/profile`  | ProfilePage | Perfil del usuario       |

### Configuración en `App.tsx`

```tsx
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route
    path="/login"
    element={
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    }
  />
  <Route
    path="/register"
    element={
      <PublicRoute>
        <RegisterPage />
      </PublicRoute>
    }
  />

  <Route element={<ProtectedLayout />}>
    <Route path="/feed" element={<FeedPage />} />
    <Route path="/post/:id" element={<PostPage />} />
    <Route path="/profile" element={<ProfilePage />} />
  </Route>

  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

---

## 🔐 Autenticación

### Estado de Autenticación

El estado se gestiona en `AuthProvider.tsx` usando Context API:

```typescript
interface AuthContextType {
  user: User | null
  login: (credentials: LoginCredentials) => Promise<void>
  register: (credentials: RegisterCredentials) => Promise<void>
  logout: () => void
  isLoading: boolean
}
```

### Persistencia

- El usuario se almacena en `localStorage`
- La sesión persiste entre recargas de página
- Se elimina al cerrar sesión

### Flujo de Login

1. Usuario ingresa username y contraseña
2. `LoginForm` llama a `useAuth().login()`
3. `authService.login()` valida credenciales
4. Si es exitoso, actualiza `AuthContext`
5. Usuario se guarda en `localStorage`
6. postService actualiza el ID del usuario actual
7. Redirección a `/feed`

### Flujo de Registro

1. Usuario completa el formulario
2. Validación de campos (contraseñas coinciden)
3. `RegisterForm` llama a `useAuth().register()`
4. Se crea el usuario
5. Login automático
6. Redirección a `/feed`

### Protección de Rutas

```tsx
// Ruta protegida - requiere autenticación
<Route element={<ProtectedLayout />}>
  <Route path="/feed" element={<FeedPage />} />
</Route>

// Ruta pública - redirecciona si está autenticado
<Route
  path="/login"
  element={
    <PublicRoute>
      <LoginPage />
    </PublicRoute>
  }
/>
```

### Usuarios de Prueba (Mock)

```typescript
// Admin
userName: 'admin'
password: 'password123'

// Usuario Regular
userName: 'user'
password: 'password123'
```

---

## 🎨 Temas (Dark/Light Mode)

### ThemeProvider

El tema se gestiona con `ThemeProvider.tsx` usando Context API.

**Valores disponibles:**

- `"light"` - Tema claro
- `"dark"` - Tema oscuro
- `"system"` - Según preferencia del sistema operativo

### Persistencia

- Se almacena en `localStorage` como `"vite-ui-theme"`
- Persiste entre sesiones
- Se aplica automáticamente al cargar la app

### Uso

```typescript
import { useTheme } from '@/hooks/use-theme'

function MyComponent() {
  const { theme, setTheme } = useTheme()

  return <button onClick={() => setTheme('dark')}>Cambiar a tema oscuro</button>
}
```

### Toggle en NavUser

El componente `NavUser` incluye un botón para alternar entre temas:

```tsx
<DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
  {theme === 'dark' ? <Sun /> : <Moon />}
  {theme === 'dark' ? 'Tema claro' : 'Tema oscuro'}
</DropdownMenuItem>
```

---

## 💾 Servicios y Repositorios

### Capa de Servicios

Los servicios contienen la lógica de negocio:

#### `authService`

```typescript
class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse>
  async register(credentials: RegisterCredentials): Promise<AuthResponse>
  async logout(): Promise<void>
  async getCurrentUser(): Promise<User>
}
```

#### `postService`

```typescript
class PostService {
  setCurrentUserId(userId: string | null): void
  async getAllPosts(): Promise<Post[]>
  async getPostById(postId: string): Promise<PostWithComments>
  async getPostsByUserId(userId: string): Promise<Post[]>
  async createPost(data: CreatePostData): Promise<Post>
  async createComment(data: CreateCommentData): Promise<Comment>
  async toggleLike(postId: string): Promise<Post>
  async toggleCommentLike(commentId: string): Promise<Comment>
  formatTimeAgo(date: Date): string
}
```

### Capa de Repositorios

Los repositorios gestionan el acceso a datos.

**Implementaciones:**

- `*.repository.ts` - Implementación real con API
- `*.repository.mock.ts` - Implementación mock para desarrollo

**Cambiar entre mock y real:**

```typescript
// En service file
import { mockPostRepository as postRepository } from '@/repositories/post.repository.mock'
// O
import { postRepository } from '@/repositories/post.repository'
```

---

## 📦 Tipos TypeScript

### auth.types.ts

```typescript
interface User {
  id: string
  name: string
  username: string
  avatar?: string
}

interface LoginCredentials {
  userName: string
  password: string
}

interface RegisterCredentials {
  firstName: string
  lastName: string
  userName: string
  password: string
}

interface AuthResponse {
  user: User
  token: string
}
```

### post.types.ts

```typescript
interface Post {
  id: string
  authorId: string
  authorName: string
  authorUsername: string
  authorAvatar?: string
  content: string
  createdAt: Date
  likesCount: number
  commentsCount: number
  likedByCurrentUser?: boolean
}

interface Comment {
  id: string
  postId: string
  authorId: string
  authorName: string
  authorUsername: string
  authorAvatar?: string
  content: string
  createdAt: Date
  likesCount: number
  likedByCurrentUser?: boolean
}

interface PostWithComments {
  post: Post
  comments: Comment[]
}

interface CreatePostData {
  content: string
}

interface CreateCommentData {
  postId: string
  content: string
}
```

---

## 📚 Guía de Instalación

### Prerequisitos

- Node.js 18+ instalado
- npm o yarn
- Git

### Pasos de Instalación

1. **Clonar el repositorio**

```bash
git clone https://github.com/mateo-385/PoliChan-frontend.git
cd PoliChan-frontend
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Ejecutar en modo desarrollo**

```bash
npm run dev
```

4. **Abrir en el navegador**

```
http://localhost:5173
```

### Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo

# Producción
npm run build        # Construye para producción
npm run preview      # Preview del build de producción

# Linting
npm run lint         # Ejecuta ESLint
```

---

## 🚀 Guía de Desarrollo

### Agregar una Nueva Página

1. **Crear el componente de página**

```tsx
// src/pages/NewPage.tsx
export function NewPage() {
  return (
    <div className="p-6">
      <h1>Nueva Página</h1>
    </div>
  )
}
```

2. **Agregar ruta en App.tsx**

```tsx
import { NewPage } from '@/pages/NewPage'

;<Route element={<ProtectedLayout />}>
  <Route path="/new" element={<NewPage />} />
</Route>
```

3. **Agregar al sidebar (opcional)**

```tsx
// src/components/sidebar/AppSidebar.tsx
const navItems = [
  // ... items existentes
  {
    title: 'Nueva Página',
    url: '/new',
    icon: IconName,
  },
]
```

### Crear un Hook Personalizado

```tsx
// src/hooks/use-something.ts
import { useState, useEffect } from 'react'

export function useSomething() {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Lógica del hook
  }, [])

  return { data, isLoading }
}
```

### Agregar un Servicio

1. **Crear tipos**

```tsx
// src/types/something.types.ts
export interface Something {
  id: string
  name: string
}
```

2. **Crear repositorio mock**

```tsx
// src/repositories/something.repository.mock.ts
export class MockSomethingRepository {
  async getAll(): Promise<Something[]> {
    // Implementación mock
  }
}

export const mockSomethingRepository = new MockSomethingRepository()
```

3. **Crear servicio**

```tsx
// src/services/something.service.ts
import { mockSomethingRepository as repo } from '@/repositories/something.repository.mock'

class SomethingService {
  async getAll() {
    return await repo.getAll()
  }
}

export const somethingService = new SomethingService()
```

### Usar Componentes shadcn/ui

```bash
# Agregar un nuevo componente
npx shadcn@latest add [component-name]

# Ejemplos
npx shadcn@latest add button
npx shadcn@latest add dialog
npx shadcn@latest add input
```

### Convenciones de Código

#### Nomenclatura

- **Componentes:** PascalCase (`LoginForm.tsx`)
- **Hooks:** camelCase con prefijo `use` (`use-auth.ts`)
- **Servicios:** camelCase con sufijo `Service` (`authService`)
- **Tipos:** PascalCase para interfaces (`User`, `Post`)
- **Archivos:** kebab-case (`auth.types.ts`)

#### Estructura de Componentes

```tsx
import { useState } from 'react'
import { ExternalLibrary } from 'library'
import { LocalComponent } from '@/components/local'
import { useCustomHook } from '@/hooks/use-custom'
import type { CustomType } from '@/types/custom.types'

interface ComponentProps {
  prop1: string
  prop2?: number
}

export function Component({ prop1, prop2 }: ComponentProps) {
  // Hooks
  const [state, setState] = useState()
  const custom = useCustomHook()

  // Funciones
  const handleAction = () => {
    // ...
  }

  // Render
  return <div>{/* ... */}</div>
}
```

#### Importaciones

Orden de importaciones:

1. React y hooks de React
2. Librerías externas
3. Componentes locales (`@/components`)
4. Hooks personalizados (`@/hooks`)
5. Contextos (`@/contexts`)
6. Servicios (`@/services`)
7. Tipos (`@/types`)
8. Utilidades (`@/lib`)

#### Estilos

- Usar Tailwind CSS classes
- Preferir `className` sobre estilos inline
- Usar variables CSS para temas
- Componentes shadcn/ui para consistencia

### Buenas Prácticas

✅ **Hacer:**

- Usar TypeScript estricto
- Separar lógica en hooks personalizados
- Mantener componentes pequeños y reutilizables
- Usar el patrón Repository para datos
- Manejar estados de carga y error
- Agregar spinners en acciones asíncronas
- Usar componentes shadcn/ui para UI consistente

❌ **Evitar:**

- Lógica de negocio en componentes
- Llamadas directas a API desde componentes
- Componentes muy grandes (> 300 líneas)
- Estado global innecesario
- Estilos inline cuando se puede usar Tailwind

---

## 🔄 Flujos Principales

### Crear una Publicación

```
1. Usuario escribe en PostSubmissionForm
2. Valida contenido (1-280 caracteres)
3. Click en "Publicar"
4. Muestra spinner
5. Llama a createPost del hook usePosts
6. Hook → postService.createPost()
7. postService → postRepository.createPost()
8. Repository agrega a mock o llama API
9. Actualiza estado del hook
10. Refresca lista de publicaciones
11. Limpia el formulario
```

### Ver Detalles de Publicación

```
1. Usuario hace click en PostCard
2. Se abre ModalPost con postId
3. Modal llama a usePost(postId)
4. Muestra skeleton mientras carga
5. Hook carga post y comentarios
6. Renderiza contenido completo
7. Usuario puede:
   - Dar me gusta
   - Ver/agregar comentarios
   - Dar me gusta a comentarios
```

### Agregar Comentario

```
1. Usuario escribe en textarea del modal
2. Click en "Comentar"
3. Muestra spinner en botón
4. Llama a createComment del hook usePost
5. Hook → postService.createComment()
6. Actualiza solo la sección de comentarios
7. Limpia el textarea
8. Incrementa contador de comentarios
```

---

## 📝 Notas Adicionales

### Cambios Recientes

- ✅ Eliminada la página `/post/:id` (ahora usa modal)
- ✅ Agregados spinners a todos los botones con loading
- ✅ Implementados hooks personalizados para publicaciones
- ✅ Sin campo email (solo username)
- ✅ Gradientes en avatares
- ✅ InputGroup con prefijo @ en username

### Próximas Mejoras

- [ ] Conectar con API backend real
- [ ] Implementar sistema de followers
- [ ] Agregar función de búsqueda
- [ ] Notificaciones en tiempo real
- [ ] Subida de imágenes en publicaciones
- [ ] Editar/eliminar publicaciones propias
- [ ] Sistema de menciones (@usuario)
- [ ] Hashtags (#tema)

---

## 🤝 Contribución

Si deseas contribuir al proyecto:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'feat: add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Commits Convencionales

Usa el formato de [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: nueva característica
fix: corrección de bug
docs: cambios en documentación
style: cambios de formato (no afectan el código)
refactor: refactorización de código
test: agregar o modificar tests
chore: tareas de mantenimiento
```

---

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

---

## 👤 Autor

**Mateo Cuella**

- GitHub: [@mateo-385](https://github.com/mateo-385)
- Proyecto: PoliChan Frontend

---

## 🙏 Agradecimientos

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)
- [React Router](https://reactrouter.com/)

---

**¡Gracias por usar PoliChan! 🎉**

{
email: 'admin@polichan.com',
password: 'password123',
name: 'Admin User'
}

{
email: 'user@polichan.com',
password: 'password123',
name: 'Regular User'
}

````

### Cambiar a API Real

En `auth.service.ts`, cambia:

```typescript
// Mock (desarrollo)
import { mockAuthRepository as authRepository } from '@/repositories/auth.repository.mock'

// Real (producción)
import { authRepository } from '@/repositories/auth.repository'
````

---

## 🎨 Temas

### Dark/Light Mode

El proyecto usa `ThemeProvider` con soporte para:

- `dark` - Modo oscuro
- `light` - Modo claro
- `system` - Sigue el tema del sistema

### Usar el Theme Hook

```typescript
import { useTheme } from '@/hooks/use-theme'

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()

  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Toggle Theme
    </button>
  )
}
```

### Clases Theme-Aware

Usar tokens de diseño en lugar de colores hardcodeados:

```typescript
// ❌ Incorrecto
className = 'bg-gray-900 text-white'

// ✅ Correcto
className = 'bg-background text-foreground'
className = 'bg-card text-card-foreground'
className = 'bg-primary text-primary-foreground'
```

### Variables CSS Disponibles

```css
--background
--foreground
--card
--card-foreground
--primary
--primary-foreground
--muted
--muted-foreground
--accent
--accent-foreground
--border
```

---

## 🛠️ Guía de Desarrollo

### Instalar Dependencias

```bash
npm install
```

### Ejecutar en Desarrollo

```bash
npm run dev
```

### Build para Producción

```bash
npm run build
```

### Convenciones de Código

#### Nombres de Archivos

- **Componentes:** PascalCase (`AppSidebar.tsx`)
- **Hooks:** kebab-case con prefijo `use-` (`use-auth.ts`)
- **Páginas:** PascalCase con sufijo `Page` (`FeedPage.tsx`)
- **Tipos:** kebab-case con sufijo `.types` (`auth.types.ts`)

#### Importaciones

Usar alias `@/` para imports absolutos:

```typescript
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
```

### Agregar una Nueva Página

1. **Crear el componente de página:**

```bash
# En src/pages/
touch NewPage.tsx
```

2. **Definir el componente:**

```typescript
export function NewPage() {
  return (
    <div className="p-6 space-y-6">
      <h1>Nueva Página</h1>
    </div>
  )
}
```

3. **Agregar la ruta en `App.tsx`:**

```typescript
import { NewPage } from '@/pages/NewPage'

// Dentro de <ProtectedLayout> si es protegida
;<Route path="/new" element={<NewPage />} />
```

4. **Actualizar sidebar en `AppSidebar.tsx`:**

```typescript
const navItems = [
  // ... items existentes
  {
    title: 'Nueva Página',
    url: '/new',
    icon: YourIcon,
  },
]
```

5. **Actualizar títulos en `Layout.tsx`:**

```typescript
const pageTitles = {
  // ... títulos existentes
  '/new': 'Nueva Página',
}
```

### Agregar un Nuevo Componente shadcn/ui

```bash
npx shadcn@latest add [component-name]
```

Ejemplo:

```bash
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add form
```

### Estructura de un Componente

```typescript
import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface MyComponentProps {
  title: string
  onAction?: () => void
}

export function MyComponent({ title, onAction }: MyComponentProps) {
  const [state, setState] = useState('')

  return (
    <div className="p-4 bg-card rounded-lg">
      <h2 className="text-xl font-bold">{title}</h2>
      <Button onClick={onAction}>Action</Button>
    </div>
  )
}
```

---

## 📝 Tareas Pendientes (TODO)

### Backend Integration

- [ ] Conectar con API real
- [ ] Manejo de tokens JWT (si se requiere)
- [ ] Refresh token logic
- [ ] Error handling global

### Features

- [ ] Funcionalidad de crear posts
- [ ] Sistema de comentarios
- [ ] Sistema de likes
- [ ] Editar perfil
- [ ] Subir imágenes
- [ ] Notificaciones
- [ ] Búsqueda de usuarios
- [ ] Seguir/Dejar de seguir
- [ ] Feed infinito (infinite scroll)

### UI/UX

- [ ] Animaciones de transición
- [ ] Loading skeletons
- [ ] Toast notifications
- [ ] Error boundaries
- [ ] Form validation mejorada
- [ ] Responsive design refinado

### Testing

- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests

---

## 🐛 Debugging

### Consola del Navegador

Los logs útiles aparecen en la consola:

- Estados de autenticación
- Errores de API
- Navegación de rutas

### React DevTools

Instalar React Developer Tools para:

- Inspeccionar componentes
- Ver estado de contextos
- Profiling de performance

### Problemas Comunes

#### "Cannot find module '@/hooks/use-auth'"

- Asegúrate de que el archivo existe en `src/hooks/use-auth.ts`
- Verifica que `tsconfig.json` tiene el alias configurado

#### Sidebar no mantiene estado al navegar

- El `SidebarProvider` debe estar en `ProtectedLayout`, no en las páginas individuales

#### Temas no funcionan

- Verifica que `ThemeProvider` envuelve la app en `main.tsx`
- Chequea que las clases usan tokens de diseño (`bg-background`, etc.)

---

## 📚 Recursos

### Documentación

- [React Router](https://reactrouter.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [Axios](https://axios-http.com/)

### Patrones Recomendados

- [React Patterns](https://reactpatterns.com/)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)

---

## 👥 Equipo

- **Desarrollador Principal:** [Tu nombre]
- **Partner:** [Nombre de tu partner]

---

## 📄 Licencia

[Definir licencia del proyecto]

---

**Última actualización:** Noviembre 3, 2025
