from rest_framework import viewsets, filters
from .models import Ticket
from .serializers import TicketSerializer
from documents.permissions import IsAssignedToDepartment
from audit.models import AuditLog

class TicketViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing ticket instances.
    Enforces department-based permission logic so users only see and interact
    with tickets assigned to their department.
    """
    serializer_class = TicketSerializer
    # Reuse the same shared permission class from documents
    permission_classes = [IsAssignedToDepartment] 
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'title']

    def get_queryset(self):
        user = self.request.user
        base_queryset = Ticket.objects.all().select_related('department', 'created_by')

        if user.is_superuser or user.role == 'admin':
            return base_queryset

        # Users can only see tickets assigned to their department
        if hasattr(user, 'department') and user.department:
            return base_queryset.filter(department=user.department)

        return base_queryset.none()

    def _log_action(self, action, obj):
        AuditLog.objects.create(
            user=self.request.user,
            action=action,
            object_type='Ticket',
            object_id=obj.id,
            metadata={'title': obj.title, 'department_id': obj.department_id if obj.department else None}
        )

    def perform_create(self, serializer):
        obj = serializer.save()
        self._log_action('CREATE', obj)

    def perform_update(self, serializer):
        obj = serializer.save()
        self._log_action('UPDATE', obj)

    def perform_destroy(self, instance):
        self._log_action('DELETE', instance)
        instance.delete()
