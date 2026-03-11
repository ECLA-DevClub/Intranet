# Tickets and Department Access API

This module provides a REST API for managing `Ticket` records within the Intranet backend, heavily strictly enforcing department-based access parity with the `documents` module.

## Department-Based Access Implementation

The unified access control logic for both tickets and documents guarantees that records securely reside inside departmental boundaries:

1. **Shared Permissions (`IsAssignedToDepartment`):** Both `TicketViewSet` and `DocumentViewSet` utilize a single custom permission scheme, ensuring an interacting user must have `request.user.department == object.department`.
2. **Strict ViewSet Isolation:** The `.get_queryset()` in both ViewSets blocks users from listing or searching items owned by a different department. 
3. **Cross-Department Denial:** Any attempt to perform a `GET`, `PATCH`, `PUT`, or `DELETE` on a record owned by foreign departments will predictably yield a `404 Not Found` (if trying through standard list routes) or `403 Forbidden` behavior.

## Setup Instructions

1. Include the `tickets` app in `INSTALLED_APPS` alongside `documents`.
2. Run database migrations:
   ```bash
   python manage.py makemigrations 
   python manage.py migrate
   ```
3. Start the server via `python manage.py runserver`

## Ticket API Endpoints

All endpoints are prefixed with `/api/tickets/` and require standard authentication.

### 1. List Available Tickets
- **Endpoint**: `GET /api/tickets/`
- **Description**: Returns tickets assigned to the employee's specific department.
- **Example Response**:
  ```json
  [
    {
      "id": 1,
      "title": "Server outage",
      "description": "The staging server is throwing 502s.",
      "department": 1,
      "created_by": 12,
      "creator_name": "jane_eng"
    }
  ]
  ```

### 2. Create a Ticket
- **Endpoint**: `POST /api/tickets/`
- **Description**: Submits a new ticket directly to a department. 
- **Example Request Payload**:
  ```json
  {
    "title": "Printer Jam - Floor 2",
    "description": "It's asking for PC LOAD LETTER.",
    "department": 2
  }
  ```
- **Example Response**: Returns the created object `201 Created`. The `created_by` relationship is tied exactly to the user executing the request.

### 3. Maintain existing Tickets
- **Endpoint**: `PATCH /api/tickets/{id}/`, `DELETE /api/tickets/{id}/`
- **Description**: Employees interact directly with tickets sharing their `user.department`. Users attached to other departments interacting with this `id` will face denial/not-found statuses.
