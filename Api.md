<<<<<<< HEAD
# API Documentation — Intranet Platform

> **Base URL (dev):** `http://localhost:8000`
> **Swagger UI:** `http://localhost:8000/api/docs/`
> **ReDoc:** `http://localhost:8000/api/redoc/`

Все API эндпоинты (кроме логина и рефреша) требуют заголовка `Authorization: Bearer <access_token>`.
=======
# 📘 Intranet API — Полная документация для Frontend-разработчика

> **Base URL:** `http://localhost:8000`
> **Формат данных:** JSON (кроме загрузки файлов — `multipart/form-data`)
> **Аутентификация:** JWT (Bearer Token)

---

## Содержание

1. [Аутентификация (JWT)](#1-аутентификация-jwt)
2. [Пользователи (Users)](#2-пользователи-users)
3. [Департаменты (Departments)](#3-департаменты-departments)
4. [Сотрудники (Employees)](#4-сотрудники-employees)
5. [Тикеты (Tickets)](#5-тикеты-tickets)
6. [Документы (Documents)](#6-документы-documents)
7. [Аудит-логи (Audit Logs)](#7-аудит-логи-audit-logs)
8. [Роли и права доступа](#8-роли-и-права-доступа)
9. [Общие паттерны: фильтрация, поиск, сортировка](#9-общие-паттерны)
10. [Коды ошибок](#10-коды-ошибок)
>>>>>>> 86b35fa71a295cbd9e98e4b1ab0e2b19db253e74

---

## 1. Аутентификация (JWT)

<<<<<<< HEAD
| Метод | Эндпоинт | Доступ |
|-------|----------|--------|
| POST | `/api/auth/login/` | 🔓 Публичный |
| POST | `/api/auth/refresh/` | 🔓 Публичный |
| POST | `/api/auth/register/` | 🔒 Admin |
| GET / PUT | `/api/auth/profile/` | 🔒 Авторизованный (свой профиль) |
| GET | `/api/auth/users/` | 🔒 Admin |

**POST** `http://localhost:8000/api/auth/login/` — Получить Access и Refresh токены.
Payload: `{"username": "...", "password": "..."}`

**POST** `http://localhost:8000/api/auth/refresh/` — Обновить Access токен.
Payload: `{"refresh": "..."}`

**POST** `http://localhost:8000/api/auth/register/` — Создать нового пользователя (Admin only).
Payload: `{"username": "...", "email": "...", "password": "...", "role": "employee", "department": 1}`

**GET** `http://localhost:8000/api/auth/profile/` — Получить данные текущего пользователя.

Структура ответа:
=======
Все эндпоинты (кроме логина) требуют заголовка:
```
Authorization: Bearer <access_token>
```

JWT-токен содержит в payload дополнительные поля: `role` и `username`.

| Параметр | Значение |
|---|---|
| Access token lifetime | **30 минут** |
| Refresh token lifetime | **1 день** |
| Ротация refresh-токенов | ✅ Да (старый refresh блокируется после обновления) |

---

### `POST /api/auth/login/`
Получить пару Access + Refresh токенов.

**Доступ:** публичный (без токена)

**Request Body:**
```json
{
  "username": "kairat",
  "password": "securePass123"
}
```

**Response `200 OK`:**
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR..."
}
```

> [!TIP]
> Decoded access-токен содержит `role` и `username` в payload — можно использовать на фронте для быстрого определения роли без дополнительного запроса.

---

### `POST /api/auth/refresh/`
Обновить Access-токен с помощью Refresh-токена.

**Доступ:** публичный

**Request Body:**
```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR..."
}
```

**Response `200 OK`:**
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR..."
}
```

> [!IMPORTANT]
> После refresh старый refresh-токен становится невалидным (ротация включена). Всегда сохраняйте новый refresh-токен из ответа.

---

### `POST /api/auth/register/`
Создать нового пользователя.

**Доступ:** 🔒 только `admin`

**Request Body:**
```json
{
  "username": "newuser",
  "email": "new@example.com",
  "password": "SecurePass123!",
  "role": "employee",
  "department": 2
}
```

| Поле | Тип | Обязательное | Описание |
|---|---|---|---|
| `username` | string | ✅ | Уникальное имя пользователя |
| `email` | string | ✅ | Email |
| `password` | string | ✅ | Пароль (валидация Django: мин. 8 символов, не слишком простой) |
| `role` | string | нет | `"admin"` \| `"manager"` \| `"employee"` (по умолчанию `"employee"`) |
| `department` | integer | нет | ID департамента |

**Response `201 Created`:**
```json
{
  "id": 10,
  "username": "newuser",
  "email": "new@example.com",
  "role": "employee",
  "department": 2,
  "date_joined": "2026-03-23T15:14:56Z"
}
```

---

### `GET /api/auth/profile/`
Получить профиль текущего пользователя.

**Доступ:** любой авторизованный пользователь

**Response `200 OK`:**
>>>>>>> 86b35fa71a295cbd9e98e4b1ab0e2b19db253e74
```json
{
  "id": 1,
  "username": "kairat",
  "email": "kairat@example.com",
  "role": "admin",
<<<<<<< HEAD
  "department": 2
}
```

**GET** `http://localhost:8000/api/auth/users/` — Список всех пользователей (Admin only).

---

## 2. Departments (Департаменты)

| Метод | Эндпоинт | Доступ |
|-------|----------|--------|
| GET | `/api/departments/` | 🔒 Любой авторизованный |
| POST | `/api/departments/` | 🔒 Admin / Manager |
| GET | `/api/departments/{id}/` | 🔒 Любой авторизованный |
| PUT / PATCH | `/api/departments/{id}/` | 🔒 Admin / Manager |
| DELETE | `/api/departments/{id}/` | 🔒 Admin / Manager |

**GET** `http://localhost:8000/api/departments/` — Список всех департаментов (name, description).

---

## 3. Employees (Сотрудники)

| Метод | Эндпоинт | Доступ |
|-------|----------|--------|
| GET | `/api/employees/` | 🔒 Любой авторизованный |
| POST | `/api/employees/` | 🔒 Любой авторизованный |
| GET | `/api/employees/{id}/` | 🔒 Любой авторизованный |
| PUT / PATCH | `/api/employees/{id}/` | 🔒 Любой авторизованный |
| DELETE | `/api/employees/{id}/` | 🔒 Любой авторизованный |

**GET** `http://localhost:8000/api/employees/` — Список сотрудников. Фильтрация: `?department=HR`.

---

## 4. Tickets (Билеты)

| Метод | Эндпоинт | Доступ |
|-------|----------|--------|
| GET | `/api/tickets/` | 🔒 По департаменту (Admin — все) |
| POST | `/api/tickets/` | 🔒 По департаменту (Admin — все) |
| GET | `/api/tickets/{id}/` | 🔒 По департаменту (Admin — все) |
| PATCH | `/api/tickets/{id}/` | 🔒 По департаменту (Admin — все) |
| DELETE | `/api/tickets/{id}/` | 🔒 По департаменту (Admin — все) |
| POST | `/api/tickets/{id}/change-status/` | 🔒 Assignee или Admin |
| POST | `/api/tickets/{id}/assign/` | 🔒 По департаменту (Admin — все) |

Модель: `title`, `description`, `status`, `department`, `assignee`, `created_by`.
Статусы: `open`, `in_progress`, `closed`. Переходы: `open → in_progress → closed`.

**GET** `http://localhost:8000/api/tickets/` — Список билетов. Поиск: `?search=`, сортировка: `?ordering=created_at`.

**POST** `http://localhost:8000/api/tickets/` — Создать билет.
Payload: `{"title": "...", "description": "...", "department": 1}`

**POST** `http://localhost:8000/api/tickets/{id}/change-status/` — Сменить статус (только assignee или Admin).
Payload: `{"status": "in_progress"}` или `{"status": "closed"}`

**POST** `http://localhost:8000/api/tickets/{id}/assign/` — Назначить исполнителя.
Payload: `{"assignee": 5}`

---

## 5. Documents (Документы)

| Метод | Эндпоинт | Доступ |
|-------|----------|--------|
| GET | `/api/documents/` | 🔒 По департаменту (Admin — все) |
| POST | `/api/documents/` | 🔒 По департаменту (Admin — все) |
| GET | `/api/documents/{id}/` | 🔒 По департаменту (Admin — все) |
| PATCH | `/api/documents/{id}/` | 🔒 По департаменту (Admin — все) |
| DELETE | `/api/documents/{id}/` | 🔒 По департаменту (Admin — все) |
| POST | `/api/documents/{id}/upload-version/` | 🔒 По департаменту (Admin — все) |
| GET | `/api/documents/{id}/versions/` | 🔒 По департаменту (Admin — все) |

**POST** `http://localhost:8000/api/documents/` — Загрузить документ (FormData: `title`, `department`, `file`).

**POST** `http://localhost:8000/api/documents/{id}/upload-version/` — Загрузить новую версию.
Payload (FormData): `file` (обязательно), `comment` (опционально).

**GET** `http://localhost:8000/api/documents/{id}/versions/` — История всех версий.

---

## 6. AuditLogs (Логи)

| Метод | Эндпоинт | Доступ |
|-------|----------|--------|
| GET | `/api/auditlogs/` | 🔒 Admin only |
| GET | `/api/auditlogs/{id}/` | 🔒 Admin only |

Логи создаются автоматически при: создании/обновлении/удалении билетов и документов, смене статуса, назначении сотрудника, загрузке новой версии.

**GET** `http://localhost:8000/api/auditlogs/`

Пример ответа:
```json
[
  {
    "user": 1,
    "username": "admin",
    "action": "STATUS_CHANGE",
    "object_type": "Ticket",
    "object_id": 14,
    "timestamp": "...",
    "metadata": {"old_status": "open", "new_status": "in_progress"}
  }
]
```
=======
  "department": 2,
  "date_joined": "2026-01-15T10:30:00Z"
}
```

---

### `PUT /api/auth/profile/`
Обновить профиль текущего пользователя.

**Доступ:** любой авторизованный пользователь

**Request Body:**
```json
{
  "username": "kairat",
  "email": "newemail@example.com",
  "department": 3
}
```

> [!NOTE]
> Поля `id`, `role`, `date_joined` — **read-only** и не могут быть изменены через этот эндпоинт. Роль меняет только админ.

---

### `GET /api/auth/users/`
Получить список всех пользователей.

**Доступ:** 🔒 только `admin`

**Response `200 OK`:**
```json
[
  {
    "id": 1,
    "username": "kairat",
    "email": "kairat@example.com",
    "role": "admin",
    "department": 2,
    "date_joined": "2026-01-15T10:30:00Z"
  },
  {
    "id": 2,
    "username": "aliya",
    "email": "aliya@example.com",
    "role": "employee",
    "department": 3,
    "date_joined": "2026-02-01T09:00:00Z"
  }
]
```

---

## 2. Пользователи (Users) — Модель

Кастомная модель пользователя на базе `AbstractUser`.

| Поле | Тип | Описание |
|---|---|---|
| `id` | integer | PK, auto |
| `username` | string | Уникальное имя |
| `email` | string | Email |
| `role` | string | `"admin"` \| `"manager"` \| `"employee"` |
| `department` | integer \| null | FK → Department. Может быть `null` |
| `date_joined` | datetime | Дата регистрации |

---

## 3. Департаменты (Departments)

**Базовый URL:** `/api/departments/`

### Модель

| Поле | Тип | Описание |
|---|---|---|
| `id` | integer |PK, auto |
| `name` | string | Уникальное название (макс. 255 символов) |
| `description` | string | Описание (может быть пустым) |
| `created_at` | datetime | Дата создания (read-only) |
| `updated_at` | datetime | Дата обновления (read-only) |

### Права доступа

| Действие | Кто может |
|---|---|
| `GET` (list / retrieve) | Любой авторизованный |
| `POST`, `PUT`, `PATCH`, `DELETE` | 🔒 `admin` или `manager` |

---

### `GET /api/departments/`
Список всех департаментов.

**Query-параметры:**

| Параметр | Описание |
|---|---|
| `?search=IT` | Поиск по `name` |
| `?ordering=name` | Сортировка по `name` или `created_at`. Префикс `-` для обратного порядка |

**Response `200 OK`:**
```json
[
  {
    "id": 1,
    "name": "Engineering",
    "description": "Отдел разработки",
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-03-10T12:00:00Z"
  }
]
```

---

### `POST /api/departments/`
Создать департамент.

**Request Body:**
```json
{
  "name": "Marketing",
  "description": "Отдел маркетинга"
}
```

---

### `GET /api/departments/{id}/`
Получить конкретный департамент.

---

### `PATCH /api/departments/{id}/`
Частично обновить департамент.

---

### `PUT /api/departments/{id}/`
Полностью обновить департамент.

---

### `DELETE /api/departments/{id}/`
Удалить департамент.

> [!CAUTION]
> Удаление департамента каскадно удалит все связанные тикеты и документы! Пользователи, привязанные к департаменту, получат `department = null`.

---

## 4. Сотрудники (Employees)

**Базовый URL:** `/api/employees/`

> [!NOTE]
> Это **отдельная** модель от User. Работает как «телефонный справочник» / карточки сотрудников. Не связана FK с моделью User.

### Модель

| Поле | Тип | Описание |
|---|---|---|
| `id` | integer | PK, auto |
| `name` | string | ФИО |
| `email` | string | Уникальный email |
| `position` | string | Должность |
| `department` | string | Название департамента (текст, **не FK**) |
| `role` | string | Роль (текст, **не enum**) |

### Права доступа

| Действие | Кто может |
|---|---|
| Весь CRUD | Любой авторизованный пользователь |

---

### `GET /api/employees/`
Список сотрудников.

**Фильтрация:**

| Параметр | Описание |
|---|---|
| `?department=HR` | Фильтр по текстовому полю `department` (точное совпадение) |

**Response `200 OK`:**
```json
[
  {
    "id": 1,
    "name": "Кайрат Нурланов",
    "email": "kairat@example.com",
    "position": "Senior Developer",
    "department": "Engineering",
    "role": "Team Lead"
  }
]
```

---

### `POST /api/employees/`
Создать карточку сотрудника.

**Request Body:**
```json
{
  "name": "Алия Сериковна",
  "email": "aliya@example.com",
  "position": "HR Manager",
  "department": "HR",
  "role": "Manager"
}
```

---

### `GET /api/employees/{id}/`
Детальная информация по сотруднику.

### `PATCH /api/employees/{id}/`
Частичное обновление.

### `PUT /api/employees/{id}/`
Полное обновление.

### `DELETE /api/employees/{id}/`
Удаление карточки.

---

## 5. Тикеты (Tickets)

**Базовый URL:** `/api/tickets/`

### Модель

| Поле | Тип | Описание |
|---|---|---|
| `id` | integer | PK, auto |
| `title` | string | Заголовок (макс. 255) |
| `description` | string | Описание |
| `status` | string | `"open"` \| `"in_progress"` \| `"closed"` |
| `department` | integer | FK → Department |
| `assignee` | integer \| null | FK → User. Исполнитель |
| `assignee_name` | string \| null | Имя исполнителя (read-only) |
| `created_by` | integer | FK → User. Автор (автоматически = текущий пользователь) |
| `creator_name` | string | Имя автора (read-only) |
| `created_at` | datetime | Дата создания (read-only) |
| `updated_at` | datetime | Дата обновления (read-only) |

### Права доступа

| Правило | Описание |
|---|---|
| **Видимость** | Пользователь видит только тикеты **своего департамента**. Admin видит **все** |
| **CRUD** | Доступен пользователям своего департамента |
| **change-status** | Только `assignee` тикета или `admin` |
| **assign** | Любой с доступом к тикету (по департаменту) |

### Workflow статусов

```
open → in_progress → closed
```

> [!IMPORTANT]
> Переходы **строго последовательные**. Нельзя перейти из `open` сразу в `closed`, и нельзя вернуть статус назад. `closed` — конечный статус.

---

### `GET /api/tickets/`
Список тикетов (фильтруется по департаменту пользователя).

**Query-параметры:**

| Параметр | Описание |
|---|---|
| `?search=баг` | Поиск по `title` и `description` |
| `?ordering=created_at` | Сортировка: `created_at`, `title`, `status`. Префикс `-` для DESC |

**Response `200 OK`:**
```json
[
  {
    "id": 14,
    "title": "Исправить баг в форме логина",
    "description": "Форма не сбрасывается после ошибки",
    "status": "open",
    "department": 2,
    "assignee": null,
    "assignee_name": null,
    "created_by": 1,
    "creator_name": "kairat",
    "created_at": "2026-03-20T10:30:00Z",
    "updated_at": "2026-03-20T10:30:00Z"
  }
]
```

---

### `POST /api/tickets/`
Создать тикет.

**Request Body:**
```json
{
  "title": "Добавить тёмную тему",
  "description": "Пользователи просят тёмную тему для дашборда",
  "department": 2
}
```

> [!NOTE]
> - `created_by` устанавливается **автоматически** из токена
> - `status` устанавливается как `"open"` автоматически
> - `assignee` не нужно указывать при создании

**Response `201 Created`:**
```json
{
  "id": 15,
  "title": "Добавить тёмную тему",
  "description": "Пользователи просят тёмную тему для дашборда",
  "status": "open",
  "department": 2,
  "assignee": null,
  "assignee_name": null,
  "created_by": 1,
  "creator_name": "kairat",
  "created_at": "2026-03-23T12:00:00Z",
  "updated_at": "2026-03-23T12:00:00Z"
}
```

---

### `GET /api/tickets/{id}/`
Получить конкретный тикет.

---

### `PATCH /api/tickets/{id}/`
Обновить данные тикета.

> [!WARNING]
> Поля `status`, `created_by`, `created_at`, `updated_at` — **read-only** и через PATCH не изменяются. Для смены статуса используйте `/change-status/`, для assignee — `/assign/`.

**Request Body (пример):**
```json
{
  "title": "Обновлённый заголовок",
  "description": "Дополненное описание"
}
```

---

### `DELETE /api/tickets/{id}/`
Удалить тикет.

---

### `POST /api/tickets/{id}/change-status/`
Изменить статус тикета.

**Доступ:** 🔒 только `assignee` тикета или `admin`

**Request Body:**
```json
{
  "status": "in_progress"
}
```

| Текущий статус | Допустимый новый |
|---|---|
| `open` | `in_progress` |
| `in_progress` | `closed` |
| `closed` | ❌ ничего |

**Response `200 OK`:** обновлённый объект тикета.

**Response `400 Bad Request`** (при недопустимом переходе):
```json
{
  "status": ["Invalid transition: 'Open' → 'Closed'."]
}
```

---

### `POST /api/tickets/{id}/assign/`
Назначить исполнителя на тикет.

**Доступ:** любой пользователь с доступом к тикету (по департаменту)

**Request Body:**
```json
{
  "assignee": 5
}
```

| Поле | Тип | Описание |
|---|---|---|
| `assignee` | integer | ID **активного** пользователя |

**Response `200 OK`:** обновлённый объект тикета.

---

## 6. Документы (Documents)

**Базовый URL:** `/api/documents/`

### Модель Document

| Поле | Тип | Описание |
|---|---|---|
| `id` | integer | PK, auto |
| `title` | string | Название (макс. 255) |
| `file` | string (URL) | Ссылка на текущий файл |
| `author` | integer | FK → User (автоматически = текущий пользователь) |
| `author_name` | string | Имя автора (read-only) |
| `department` | integer | FK → Department |
| `current_version` | integer | Номер текущей версии (read-only) |
| `created_at` | datetime | (read-only) |
| `updated_at` | datetime | (read-only) |

### Модель DocumentVersion

| Поле | Тип | Описание |
|---|---|---|
| `id` | integer | PK, auto |
| `document` | integer | FK → Document |
| `file` | string (URL) | Ссылка на файл этой версии |
| `version_number` | integer | Номер версии |
| `uploaded_by` | integer | FK → User |
| `uploaded_by_name` | string | Имя загрузившего (read-only) |
| `comment` | string | Комментарий к версии |
| `created_at` | datetime | (read-only) |

### Права доступа

| Правило | Описание |
|---|---|
| **Видимость** | Только документы **своего департамента**. Admin видит **все** |
| **CRUD** | Пользователи своего департамента |

---

### `GET /api/documents/`
Список документов.

**Query-параметры:**

| Параметр | Описание |
|---|---|
| `?search=отчёт` | Поиск по `title` |
| `?ordering=created_at` | Сортировка: `created_at`, `title`. Префикс `-` для DESC |

**Response `200 OK`:**
```json
[
  {
    "id": 3,
    "title": "Q1 Отчёт",
    "file": "/media/documents/report_q1.pdf",
    "author": 1,
    "author_name": "kairat",
    "department": 2,
    "current_version": 3,
    "created_at": "2026-02-01T09:00:00Z",
    "updated_at": "2026-03-15T14:30:00Z"
  }
]
```

---

### `POST /api/documents/`
Загрузить новый документ.

> [!IMPORTANT]
> Используйте `Content-Type: multipart/form-data` (не JSON!).

**FormData:**

| Поле | Тип | Обязательное | Описание |
|---|---|---|---|
| `title` | string | ✅ | Название документа |
| `department` | integer | ✅ | ID департамента |
| `file` | File | ✅ | Файл (макс. **10 MB**) |

**Допустимые расширения файлов:** `csv`, `docx`, `key`, `odt`, `pdf`, `pptx`, `rtf`, `txt`, `xlsx`, `zip`

```javascript
// Пример на JS (fetch)
const formData = new FormData();
formData.append('title', 'Q1 Отчёт');
formData.append('department', 2);
formData.append('file', fileInput.files[0]);

const response = await fetch('/api/documents/', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    // НЕ указывайте Content-Type — браузер сам поставит с boundary
  },
  body: formData,
});
```

**Response `201 Created`:**
```json
{
  "id": 4,
  "title": "Q1 Отчёт",
  "file": "/media/documents/report_q1.pdf",
  "author": 1,
  "author_name": "kairat",
  "department": 2,
  "current_version": 1,
  "created_at": "2026-03-23T12:00:00Z",
  "updated_at": "2026-03-23T12:00:00Z"
}
```

> [!NOTE]
> При создании документа автоматически создаётся `DocumentVersion` с `version_number: 1` и комментарием `"Initial version"`.

---

### `GET /api/documents/{id}/`
Получить конкретный документ.

---

### `PATCH /api/documents/{id}/`
Обновить **только название** документа.

**Request Body:**
```json
{
  "title": "Обновлённое название"
}
```

> [!WARNING]
> Для обновления **файла** используйте `/upload-version/`. PATCH обновляет только метаданные (title).

---

### `DELETE /api/documents/{id}/`
Удалить документ **вместе со всеми версиями**.

---

### `POST /api/documents/{id}/upload-version/`
Загрузить новую версию файла для существующего документа.

> [!IMPORTANT]
> Используйте `Content-Type: multipart/form-data`

**FormData:**

| Поле | Тип | Обязательное | Описание |
|---|---|---|---|
| `file` | File | ✅ | Новый файл |
| `comment` | string | нет | Описание изменений |

**Response `201 Created`:**
```json
{
  "id": 7,
  "document": 3,
  "file": "/media/document_versions/report_q1_v4.pdf",
  "version_number": 4,
  "uploaded_by": 1,
  "uploaded_by_name": "kairat",
  "comment": "Добавлены данные за март",
  "created_at": "2026-03-23T14:00:00Z"
}
```

> [!NOTE]
> При загрузке новой версии: `current_version` документа инкрементируется, а `file` документа обновляется на новый файл.

---

### `GET /api/documents/{id}/versions/`
Получить историю всех версий документа.

**Response `200 OK`:**
```json
[
  {
    "id": 7,
    "document": 3,
    "file": "/media/document_versions/report_q1_v4.pdf",
    "version_number": 4,
    "uploaded_by": 1,
    "uploaded_by_name": "kairat",
    "comment": "Добавлены данные за март",
    "created_at": "2026-03-23T14:00:00Z"
  },
  {
    "id": 5,
    "document": 3,
    "file": "/media/document_versions/report_q1_v3.pdf",
    "version_number": 3,
    "uploaded_by": 2,
    "uploaded_by_name": "aliya",
    "comment": "Исправлены опечатки",
    "created_at": "2026-03-10T09:00:00Z"
  }
]
```

> [!TIP]
> Версии отсортированы по убыванию `version_number` — первая в массиве всегда самая свежая.

---

## 7. Аудит-логи (Audit Logs)

**Базовый URL:** `/api/audit/`

**Доступ:** 🔒 только `admin` или `superuser`

### Модель

| Поле | Тип | Описание |
|---|---|---|
| `id` | integer | PK, auto |
| `user` | integer | FK → User (кто совершил действие) |
| `username` | string | Имя пользователя (read-only) |
| `action` | string | Тип действия (см. таблицу ниже) |
| `object_type` | string | `"Ticket"` или `"Document"` |
| `object_id` | integer | ID объекта |
| `timestamp` | datetime | Время действия |
| `metadata` | object | Дополнительные данные (зависят от типа действия) |

### Типы действий (`action`)

| Значение | Описание | Пример metadata |
|---|---|---|
| `CREATE` | Создание объекта | `{"title": "...", "department_id": 2}` |
| `UPDATE` | Обновление объекта | `{"title": "...", "department_id": 2}` |
| `DELETE` | Удаление объекта | `{"title": "..."}` |
| `STATUS_CHANGE` | Смена статуса тикета | `{"old_status": "open", "new_status": "in_progress"}` |
| `ASSIGN` | Назначение исполнителя | `{"old_assignee_id": null, "new_assignee_id": 5}` |

> [!NOTE]
> Логи создаются автоматически бэкендом. Загрузка новой версии документа записывается как `UPDATE` с `metadata.action: "new_version"`.

---

### `GET /api/audit/`
Список всех аудит-логов (от новых к старым).

**Response `200 OK`:**
```json
[
  {
    "id": 42,
    "user": 1,
    "username": "kairat",
    "action": "STATUS_CHANGE",
    "object_type": "Ticket",
    "object_id": 14,
    "timestamp": "2026-03-23T15:00:00Z",
    "metadata": {
      "old_status": "open",
      "new_status": "in_progress"
    }
  }
]
```

---

### `GET /api/audit/{id}/`
Получить конкретный лог-запись.

---

## 8. Роли и права доступа

### Роли пользователей

| Роль | Значение в API | Описание |
|---|---|---|
| Администратор | `"admin"` | Полный доступ ко всему |
| Менеджер | `"manager"` | Управление департаментами, доступ к своему отделу |
| Сотрудник | `"employee"` | Базовый доступ к своему отделу |

### Матрица доступа

| Ресурс / Действие | `employee` | `manager` | `admin` |
|---|---|---|---|
| **Auth: login/refresh** | ✅ | ✅ | ✅ |
| **Auth: register** | ❌ | ❌ | ✅ |
| **Auth: profile (GET/PUT)** | ✅ свой | ✅ свой | ✅ свой |
| **Auth: users list** | ❌ | ❌ | ✅ |
| **Departments: list/get** | ✅ | ✅ | ✅ |
| **Departments: create/update/delete** | ❌ | ✅ | ✅ |
| **Employees: CRUD** | ✅ | ✅ | ✅ |
| **Tickets: list/get** | ✅ свой dept | ✅ свой dept | ✅ все |
| **Tickets: create/update/delete** | ✅ свой dept | ✅ свой dept | ✅ все |
| **Tickets: change-status** | ✅ если assignee | ✅ если assignee | ✅ |
| **Tickets: assign** | ✅ свой dept | ✅ свой dept | ✅ |
| **Documents: list/get** | ✅ свой dept | ✅ свой dept | ✅ все |
| **Documents: create/update/delete** | ✅ свой dept | ✅ свой dept | ✅ все |
| **Documents: upload-version** | ✅ свой dept | ✅ свой dept | ✅ все |
| **Documents: versions** | ✅ свой dept | ✅ свой dept | ✅ все |
| **Audit logs** | ❌ | ❌ | ✅ |

---

## 9. Общие паттерны

### Поиск (`search`)

```
GET /api/tickets/?search=баг
GET /api/documents/?search=отчёт
GET /api/departments/?search=IT
```

Поиск — нечувствительный к регистру, работает по полям:
- **Tickets:** `title`, `description`
- **Documents:** `title`
- **Departments:** `name`

### Сортировка (`ordering`)

```
GET /api/tickets/?ordering=created_at       # по возрастанию
GET /api/tickets/?ordering=-created_at      # по убыванию
GET /api/departments/?ordering=name
```

| Ресурс | Доступные поля сортировки |
|---|---|
| Tickets | `created_at`, `title`, `status` |
| Documents | `created_at`, `title` |
| Departments | `name`, `created_at` |

### Фильтрация

```
GET /api/employees/?department=HR
```

| Ресурс | Доступные фильтры |
|---|---|
| Employees | `department` (точное совпадение текста) |

---

## 10. Коды ошибок

| HTTP код | Описание | Когда |
|---|---|---|
| `200` | Успех | GET, PATCH, PUT, custom actions |
| `201` | Создано | POST |
| `204` | Удалено | DELETE |
| `400` | Ошибка валидации | Невалидные данные, недопустимый переход статуса |
| `401` | Не авторизован | Отсутствует или невалидный токен |
| `403` | Доступ запрещён | Недостаточно прав (роль/департамент) |
| `404` | Не найдено | Объект не существует или нет доступа |
| `405` | Метод не разрешён | Неподдерживаемый HTTP-метод |

### Формат ошибок валидации (`400`)

```json
{
  "field_name": ["Сообщение об ошибке."],
  "non_field_errors": ["Общая ошибка."]
}
```

### Формат ошибки авторизации (`401`)

```json
{
  "detail": "Given token not valid for any token type",
  "code": "token_not_valid",
  "messages": [...]
}
```

### Формат ошибки доступа (`403`)

```json
{
  "detail": "Only admins can perform this action."
}
```

---

## Приложение: Карта всех эндпоинтов

| Метод | Путь | Описание |
|---|---|---|
| `POST` | `/api/auth/login/` | Получить JWT-токены |
| `POST` | `/api/auth/refresh/` | Обновить access-токен |
| `POST` | `/api/auth/register/` | Создать пользователя (admin) |
| `GET` | `/api/auth/profile/` | Профиль текущего пользователя |
| `PUT` | `/api/auth/profile/` | Обновить профиль |
| `GET` | `/api/auth/users/` | Список всех пользователей (admin) |
| `GET` | `/api/departments/` | Список департаментов |
| `POST` | `/api/departments/` | Создать департамент |
| `GET` | `/api/departments/{id}/` | Получить департамент |
| `PATCH` | `/api/departments/{id}/` | Обновить департамент |
| `DELETE` | `/api/departments/{id}/` | Удалить департамент |
| `GET` | `/api/employees/` | Список сотрудников |
| `POST` | `/api/employees/` | Создать сотрудника |
| `GET` | `/api/employees/{id}/` | Получить сотрудника |
| `PATCH` | `/api/employees/{id}/` | Обновить сотрудника |
| `DELETE` | `/api/employees/{id}/` | Удалить сотрудника |
| `GET` | `/api/tickets/` | Список тикетов |
| `POST` | `/api/tickets/` | Создать тикет |
| `GET` | `/api/tickets/{id}/` | Получить тикет |
| `PATCH` | `/api/tickets/{id}/` | Обновить тикет |
| `DELETE` | `/api/tickets/{id}/` | Удалить тикет |
| `POST` | `/api/tickets/{id}/change-status/` | Сменить статус |
| `POST` | `/api/tickets/{id}/assign/` | Назначить исполнителя |
| `GET` | `/api/documents/` | Список документов |
| `POST` | `/api/documents/` | Загрузить документ |
| `GET` | `/api/documents/{id}/` | Получить документ |
| `PATCH` | `/api/documents/{id}/` | Обновить название |
| `DELETE` | `/api/documents/{id}/` | Удалить документ |
| `POST` | `/api/documents/{id}/upload-version/` | Загрузить новую версию |
| `GET` | `/api/documents/{id}/versions/` | История версий |
| `GET` | `/api/audit/` | Список аудит-логов (admin) |
| `GET` | `/api/audit/{id}/` | Получить лог-запись (admin) |
>>>>>>> 86b35fa71a295cbd9e98e4b1ab0e2b19db253e74
