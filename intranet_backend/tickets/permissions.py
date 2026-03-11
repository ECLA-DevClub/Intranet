from rest_framework import permissions


class IsTicketAssignee(permissions.BasePermission):
    """
    Only the ticket assignee (or admin/superuser) can perform the action.
    Used for status-change endpoint.
    """

    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser or request.user.role == 'admin':
            return True
        return obj.assignee == request.user
