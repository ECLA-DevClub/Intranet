# Document Management API

This module provides a REST API for managing `Document` records within the Intranet backend, strictly enforcing department-based access.

## Department-Based Access Implementation

The access control logic is built primarily through two components:
1. **User Model Update:** The `User` model now has a `department` ForeignKey mapping them to a specific department.
2. **Document Model:** The `Document` model has a `allowed_departments` ManyToMany field, defining which departments can view/download/interact with the file.
3. **Permissions Class (`IsDocumentDepartmentAllowed`):** A custom Rest Framework permission class ensures that a user can only access a document if they are the original author, an admin, or if their `User.department` matches one of the document's `allowed_departments`. Additionally, `DocumentViewSet.get_queryset` automatically filters the list view so users only see authorized documents.

## Setup Instructions

1. Ensure the `documents` app is included in `INSTALLED_APPS` in `intranet_backend/settings.py`.
2. Run database migrations:
   ```bash
   python manage.py makemigrations accounts documents
   python manage.py migrate
   ```
3. Start the development server:
   ```bash
   python manage.py runserver
   ```

## API Endpoints

All endpoints are prefixed with `/api/documents/` and generally require authentication.

### 1. List All Accessible Documents
- **Endpoint**: `GET /api/documents/`
- **Description**: Returns a list of documents the current user has permission to see.

### 2. Upload a Document
- **Endpoint**: `POST /api/documents/`
- **Description**: Creates a new document record. Requires a multipart form payload.
- **Example Request Payload (Multipart Form Data)**:
  - `title`: `Q3 Financial Report`
  - `file`: `<binary file data>`
  - `allowed_departments`: `[1, 2]` (List of department IDs)
- **Example Response**: Returns the created object with `201 Created` status code. The `author` field is automatically set to the requesting user.

### 3. Retrieve a Specific Document
- **Endpoint**: `GET /api/documents/{id}/`
- **Description**: Returns the details of a specific document, provided the user has access. Will 404/403 if unauthorized.

### 4. Update a Document
- **Endpoint**: `PATCH /api/documents/{id}/` (Partial Update)
- **Description**: Updates an existing document record. Usually performed by the author.
- **Example Request (JSON)**:
  ```json
  {
    "title": "Q3 Financial Report - Finalized"
  }
  ```
- **Example Response**: Returns the updated document object.

### 5. Delete a Document
- **Endpoint**: `DELETE /api/documents/{id}/`
- **Description**: Deletes a document record.
- **Example Response**: Returns `204 No Content` on success.
