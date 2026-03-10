# Employee Management API

This module provides a REST API for managing `Employee` records within the Intranet backend.

## Setup Instructions

1. Ensure the `employees` app is included in `INSTALLED_APPS` in `intranet_backend/settings.py`.
2. Run database migrations:
   ```bash
   python manage.py makemigrations employees
   python manage.py migrate
   ```
3. Start the development server:
   ```bash
   python manage.py runserver
   ```

## API Endpoints

All endpoints are prefixed with `/api/employees/` and generally require authentication (depending on the global REST_FRAMEWORK settings).

### 1. List All Employees
- **Endpoint**: `GET /api/employees/`
- **Description**: Returns a list of all employees.
- **Filtering**: You can filter by department using the `department` query parameter.
  - Example: `GET /api/employees/?department=IT`
- **Example Response**:
  ```json
  [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "position": "Backend Developer",
      "department": "IT",
      "role": "Staff"
    }
  ]
  ```

### 2. Create an Employee
- **Endpoint**: `POST /api/employees/`
- **Description**: Creates a new employee record.
- **Example Request**:
  ```json
  {
    "name": "Jane Smith",
    "email": "jane@example.com",
    "position": "Product Manager",
    "department": "Product",
    "role": "Manager"
  }
  ```
- **Example Response**: Returns the created object with `201 Created` status code.

### 3. Retrieve an Employee
- **Endpoint**: `GET /api/employees/{id}/`
- **Description**: Returns the details of a specific employee.

### 4. Update an Employee
- **Endpoint**: `PUT /api/employees/{id}/` (Full Update) or `PATCH /api/employees/{id}/` (Partial Update)
- **Description**: Updates an existing employee record.
- **Example Request (PATCH)**:
  ```json
  {
    "position": "Senior Developer"
  }
  ```
- **Example Response**: Returns the updated employee object.

### 5. Delete an Employee
- **Endpoint**: `DELETE /api/employees/{id}/`
- **Description**: Deletes an employee record. 
- **Example Response**: Returns `204 No Content` on success.
