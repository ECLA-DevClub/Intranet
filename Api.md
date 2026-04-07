# API Documentation — Intranet Platform

> **Base URL (dev):** `http://localhost:8000`
> **Swagger UI:** `http://localhost:8000/api/docs/`
> **ReDoc:** `http://localhost:8000/api/redoc/`

Все API эндпоинты (кроме логина и рефреша) требуют заголовка `Authorization: Bearer <access_token>`.

---

## 1. Аутентификация (JWT)

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
```json
{
  "id": 1,
  "username": "kairat",
  "email": "kairat@example.com",
  "role": "admin",
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