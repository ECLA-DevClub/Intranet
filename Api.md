Аутентификация (JWT)
Все API эндпоинты (кроме получения токенов) требуют заголовка Authorization: Bearer <access_token>.

Эндпоинты:
POST /api/auth/token/ — Получить Access и Refresh токены (передавать username и password).
POST /api/auth/token/refresh/ — Обновить Access токен (передавать refresh).
GET /api/auth/me/ — Получить данные текущего пользователя.
Структура ответа /api/auth/me/:

json
{
  "id": 1,
  "username": "kairat",
  "email": "kairat@example.com",
  "role": "admin",             // "admin" | "manager" | "employee"
  "department": 2              // ID департамента пользователя
}
3. Tickets (Билеты)
Модель: title, description, 
status
, 
department
, 
assignee
, created_by. Статусы: 
open
, 
in_progress
, 
closed
. Переходы статусов строгие: open → in_progress → closed.

Базовый доступ: Пользователь видит/может редактировать только билеты своего департамента (Admin видит все).

Эндпоинты:
GET /api/tickets/ — Список билетов (работает поиск ?search= и сортировка ?ordering=created_at).
POST /api/tickets/ — Создать билет.
Payload: {"title": "...", "description": "...", "department": 1}.
GET /api/tickets/{id}/ — Получить конкретный билет.
PATCH /api/tickets/{id}/ — Обновить данные (кроме статуса и assignee).
DELETE /api/tickets/{id}/ — Удалить билет.
Кастомные действия:
POST /api/tickets/{id}/change-status/
Меняет статус. ВАЖНО: выполнить это может только текущий 
assignee
 билета (или Admin).
Payload: {"status": "in_progress"} или {"status": "closed"}.
POST /api/tickets/{id}/assign/
Назначает билету исполнителя (по id юзера).
Payload: {"assignee": 5}.
4. Documents (Документы и их версии)
Модель: title, 
file
, current_version, 
department
, author. Каждое обновление файла не перезаписывает старый, а создает новую 
DocumentVersion
 в истории.

Базовый доступ: Только документы своего департамента (Admin видит все).

Эндпоинты:
GET /api/documents/ — Список документов.
POST /api/documents/ — Загрузить новый документ.
Payload (FormData): title, 
department
, 
file
. (Текущая версия автоматически = 1).
GET /api/documents/{id}/ — Подробности документа.
PATCH /api/documents/{id}/ — Обновить название (не файл).
DELETE /api/documents/{id}/ — Удалить документ целиком со всеми версиями.
Кастомные действия (Версионирование):
POST /api/documents/{id}/upload-version/
Обновить файл документа. Создаст версию current_version + 1.
Payload (FormData): 
file
 (обязательно), comment (опционально, короткое описание изменения).
GET /api/documents/{id}/versions/
Получить историю всех версий конкретного документа.
5. AuditLogs (Логи системы)
Доступ: Только пользователи с ролью Admin. Логи автоматически записываются при: создании, обновлении, удалении билетов/документов, изменении статуса билета, назначении сотрудника и загрузке новой версии документа.

Эндпоинт:
GET /api/auditlogs/
Возвращает список логов
Пример ответа: [{"user": 1, "username": "admin", "action": "STATUS_CHANGE", "object_type": "Ticket", "object_id": 14, "timestamp": "...", "metadata": {"old_status": "open", "new_status": "in_progress"}}]
6. Employees (Сотрудники)
(Примечание: это отдельная модель от User, служит скорее как телефонный справочник/карточки сотрудников).

Эндпоинт:
GET /api/employees/ — Список сотрудников.
Доступна фильтрация: /api/employees/?department=HR.
POST /api/employees/ — Создать профиль.
GET /api/employees/{id}/ — Детальная информация.
PATCH /api/employees/{id}/ — Редактирование.
DELETE /api/employees/{id}/ — Удаление.
7. Departments (Департаменты)
Эндпоинт:
GET /api/departments/ — Список всех департаментов (name, description).
Полный CRUD: POST, PATCH, GET {id}, DELETE.