from rest_framework import permissions

class IsAssignedToDepartment(permissions.BasePermission):
    """
    Custom permission to only allow users to access items (documents/tickets)
    if they belong to the same department as the item.
    Admins can always access everything.
    """

    def has_object_permission(self, request, view, obj):
        # Superusers or admins can always access everything
        if request.user.is_superuser or request.user.role == 'admin':
            return True

        # Check if the user's department matches the item's department
        if hasattr(obj, 'department') and hasattr(request.user, 'department'):
            if request.user.department == obj.department:
                return True

        return False
