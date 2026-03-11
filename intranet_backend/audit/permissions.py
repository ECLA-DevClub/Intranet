from rest_framework import permissions

class IsCustomAdminUser(permissions.BasePermission):
    """
    Allows access only to authenticated admin users.
    Checks the custom 'role' field on our User model or standard is_superuser.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            (request.user.is_superuser or request.user.role == 'admin')
        )
