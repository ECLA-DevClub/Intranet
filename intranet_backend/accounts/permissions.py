from rest_framework import permissions

from accounts.models import User


class IsAdmin(permissions.BasePermission):
    """Allow access only to users with Admin role."""

    message = "Only admins can perform this action."

    def has_permission(self, request, view) -> bool:
        return (
            request.user
            and request.user.is_authenticated
            and (request.user.is_superuser or request.user.role == User.Role.ADMIN)
        )


class IsManagerOrAdmin(permissions.BasePermission):
    """Allow access to users with Admin or Manager role."""

    message = "Only admins and managers can perform this action."

    def has_permission(self, request, view) -> bool:
        return (
            request.user
            and request.user.is_authenticated
            and (
                request.user.is_superuser
                or request.user.role in (User.Role.ADMIN, User.Role.MANAGER)
            )
        )
