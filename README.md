# 📚 Documentación PoliChan - Red Social

## 📋 Tabla de Contenidos

- [Estructura del Proyecto](#estructura-del-proyecto)
- [Arquitectura](#arquitectura)
- [Páginas Principales](#páginas-principales)
- [Componentes](#componentes)
- [Rutas](#rutas)
- [Autenticación](#autenticación)
- [Temas (Dark/Light Mode)](#temas)
- [Guía de Desarrollo](#guía-de-desarrollo)

---

## 🏗️ Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── auth/           # Componentes de autenticación
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── layout/         # Componentes de diseño
│   │   ├── Layout.tsx           # Layout principal con sidebar
│   │   ├── ProtectedLayout.tsx  # Layout para rutas protegidas
│   │   ├── ProtectedRoute.tsx   # Guard para rutas autenticadas
│   │   └── PublicRoute.tsx      # Guard para rutas públicas
│   ├── ui/             # Componentes de shadcn/ui
│   │   ├── avatar.tsx
│   │   ├── button.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── sidebar.tsx
│   │   └── ...
│   ├── AppSidebar.tsx  # Sidebar de navegación
│   ├── NavMain.tsx     # Menú de navegación principal
│   ├── NavUser.tsx     # Dropdown del usuario
│   └── ThemeProvider.tsx
│
├── contexts/           # Contextos de React
│   ├── AuthContext.ts  # Contexto de autenticación
│   ├── AuthProvider.tsx
│   └── ThemeContext.ts
│
├── hooks/              # Custom hooks
│   ├── use-auth.ts     # Hook de autenticación
│   ├── use-mobile.ts   # Detección de móvil
│   ├── use-sidebar.ts  # Control del sidebar
│   └── use-theme.ts    # Control de tema
│
├── lib/                # Utilidades
│   ├── api.ts          # Configuración de axios
│   └── utils.ts        # Utilidades generales
│
├── pages/              # Páginas de la aplicación
│   ├── FeedPage.tsx    # Feed principal
│   ├── HomePage.tsx    # Página de inicio (landing)
│   ├── LoginPage.tsx   # Página de login
│   ├── PostPage.tsx    # Vista individual de post
│   ├── ProfilePage.tsx # Perfil de usuario
│   └── RegisterPage.tsx
│
├── repositories/       # Capa de datos
│   ├── auth.repository.ts       # Repositorio de autenticación real
│   └── auth.repository.mock.ts  # Repositorio mock para testing
│
├── services/           # Lógica de negocio
│   └── auth.service.ts
│
├── types/              # Definiciones de TypeScript
│   └── auth.types.ts
│
├── App.tsx            # Configuración de rutas
└── main.tsx           # Punto de entrada
```

---

## 🏛️ Arquitectura

### Patrón Repository

El proyecto usa el patrón Repository para separar la lógica de datos:

```
UI Components → Services → Repositories → API
```

**Ventajas:**

- ✅ Fácil de testear (mock repositories)
- ✅ Separación de responsabilidades
- ✅ Fácil cambio de fuente de datos

### Flujo de Autenticación

```
1. Usuario ingresa credenciales
2. LoginForm → useAuth hook
3. useAuth → authService.login()
4. authService → authRepository.login()
5. authRepository → API (axios)
6. Respuesta → Actualiza AuthContext
7. Redirección a /feed
```

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
- Header con botón de toggle y título dinámico
- Contenido centrado con margen máximo de `max-w-4xl`
- Responsive

**Títulos de página:**

```typescript
const pageTitles = {
  '/feed': 'Feed',
  '/profile': 'Profile',
}
```

#### `ProtectedLayout.tsx`

Wrapper para rutas protegidas que usa `<Outlet />` de React Router.

**Funcionalidad:**

- Verifica si el usuario está autenticado
- Muestra loading mientras verifica
- Redirecciona a `/login` si no está autenticado
- Envuelve el contenido con `Layout`

#### `ProtectedRoute.tsx`

Componente de protección de rutas (no se usa actualmente, se prefiere ProtectedLayout).

#### `PublicRoute.tsx`

Redirecciona a `/feed` si el usuario ya está autenticado.

### Sidebar Components

#### `AppSidebar.tsx`

Sidebar principal de navegación.

**Items de navegación:**

```typescript
const navItems = [
  { title: 'Feed', url: '/feed', icon: Home },
  { title: 'Profile', url: '/profile', icon: User },
]
```

**Características:**

- Logo de PoliChan (GalleryVerticalEnd icon)
- Se oculta el texto cuando está colapsado
- Marca la página activa
- Contiene `NavMain` y `NavUser`

#### `NavMain.tsx`

Renderiza los items de navegación del sidebar.

#### `NavUser.tsx`

Dropdown del usuario en el footer del sidebar.

**Opciones:**

- Ver perfil
- Cerrar sesión

### Auth Components

#### `LoginForm.tsx`

Formulario reutilizable de login.

**Props:**

```typescript
interface LoginFormProps {
  onSubmit: (credentials: LoginCredentials) => Promise<void>
  onNavigateToRegister: () => void
}
```

#### `RegisterForm.tsx`

Formulario reutilizable de registro.

**Props:**

```typescript
interface RegisterFormProps {
  onSubmit: (credentials: RegisterCredentials) => Promise<void>
  onNavigateToLogin: () => void
}
```

---

## 🛣️ Rutas

### Rutas Públicas

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

El estado se maneja en `AuthProvider.tsx`:

```typescript
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}
```

### Hook useAuth

```typescript
import { useAuth } from '@/hooks/use-auth'

function MyComponent() {
  const { user, login, logout, register, isAuthenticated, isLoading } =
    useAuth()

  // Usar las funciones...
}
```

### Funciones Disponibles

#### `login(credentials: LoginCredentials)`

Inicia sesión con email y contraseña.

```typescript
await login({ email: 'user@example.com', password: 'password' })
```

#### `register(credentials: RegisterCredentials)`

Registra un nuevo usuario.

```typescript
await register({
  email: 'user@example.com',
  password: 'password',
  name: 'Usuario',
  confirmPassword: 'password',
})
```

#### `logout()`

Cierra la sesión del usuario.

```typescript
await logout()
```

### Autenticación Mock

El proyecto usa `auth.repository.mock.ts` por defecto para desarrollo.

**Usuarios de prueba:**

```typescript
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
```

### Cambiar a API Real

En `auth.service.ts`, cambia:

```typescript
// Mock (desarrollo)
import { mockAuthRepository as authRepository } from '@/repositories/auth.repository.mock'

// Real (producción)
import { authRepository } from '@/repositories/auth.repository'
```

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
