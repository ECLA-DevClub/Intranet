from rest_framework import permissions


class IsTicketOwner(permissions.BasePermission):
    """
    Allow access to ticket creator.
    """

    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser or request.user.role == 'admin':
            return True
        return obj.created_by == request.user


class IsTicketParticipant(permissions.BasePermission):
    """
    Allow access to ticket creator, assignee, or department member.
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.is_superuser or user.role == 'admin':
            return True
        
        # Check if user is creator
        if obj.created_by == user:
            return True
            
        # Check if user is assignee
        if obj.assignee == user:
            return True
            
        # Check if user is in the ticket's department
        if hasattr(user, 'department') and hasattr(obj, 'department') and user.department == obj.department:
            return True
            
        return False


class IsTicketAssignee(permissions.BasePermission):
    """
    Only the ticket assignee (or admin/superuser) can perform the action.
    Used for status-change endpoint.
    """

    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser or request.user.role == 'admin':
            return True
        return obj.assignee == request.user
