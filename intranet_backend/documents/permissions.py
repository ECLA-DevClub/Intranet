from rest_framework import permissions

class IsDocumentDepartmentAllowed(permissions.BasePermission):
    """
    Custom permission to only allow users of a specific department to access a document.
    The author of the document always has access.
    """

    def has_object_permission(self, request, view, obj):
        # Authors can always access their own documents
        if obj.author == request.user:
            return True
        
        # Superusers can always access everything
        if request.user.is_superuser or request.user.role == 'admin':
            return True

        # Check if the user's department is in the allowed_departments list
        if request.user.department and request.user.department in obj.allowed_departments.all():
            return True

        return False
