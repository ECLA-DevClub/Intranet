# Audit API

This module captures and serves read-only `AuditLog` events tracking interactions within the `documents` and `tickets` modules. It strongly enforces an `Admin` only capability model, preventing average employees from surveying platform activity.

## Feature Implementation

The tracking system triggers log creation without using Django signals. Since signals lose the HTTP request (and therefore the `User`), we specifically bound the logic onto standard ViewSets `perform_{method}()` injections across both related apps.

- **Trigger Actions:** `CREATE`, `UPDATE`, `DELETE` are bound to `perform_create`, `perform_update`, and `perform_destroy` methods in `DocumentViewSet` and `TicketViewSet`. 
- **User Reference:** Tracks exactly which user originated the API call.
- **Reference Pointers:** Provides object ID, class ('Document' or 'Ticket'), action, timestamp, and a metadata JSON blob containing specifics like 'title' and 'department_id'.

## Setup Instructions

1. Include the `audit` app in `INSTALLED_APPS`.
2. Ensure database migrations applied correctly using `manage.py migrate`.

## API Endpoint Details

Only `superuser` or Custom Users with `role='admin'` can interact with `/api/audit/`. Non-admins receive `403 Forbidden` statuses instantly.

### List Logs
- **Endpoint**: `GET /api/audit/`
- **Output Structure**: Order of return is descending by `-timestamp` (newest first).
- **Example Response Payload**:
  ```json
  [
    {
      "id": 14,
      "user": 5,
      "username": "jane_eng",
      "action": "UPDATE",
      "object_type": "Ticket",
      "object_id": 1,
      "timestamp": "2026-03-11T13:45:00.000000Z",
      "metadata": {
        "title": "Server Issue",
        "department_id": 2
      }
    }
  ]
  ```

### Retrieve Specific Log
- **Endpoint**: `GET /api/audit/{id}/`
- **Description**: Returns 200 payload detail for a single log instance. Admins cannot delete or modify logs.
