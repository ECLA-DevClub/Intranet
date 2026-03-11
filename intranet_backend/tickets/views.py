from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from documents.permissions import IsAssignedToDepartment
from .permissions import IsTicketAssignee
from .models import Ticket
from .serializers import TicketSerializer, StatusChangeSerializer, AssignTicketSerializer
from audit.models import AuditLog


class TicketViewSet(viewsets.ModelViewSet):
    """
    CRUD for tickets with department-based access.
    Extra actions: change_status, assign.
    """
    serializer_class = TicketSerializer
    permission_classes = [IsAssignedToDepartment]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'title', 'status']

    def get_queryset(self):
        user = self.request.user
        base_qs = Ticket.objects.all().select_related('department', 'created_by', 'assignee')

        if user.is_superuser or user.role == 'admin':
            return base_qs

        if hasattr(user, 'department') and user.department:
            return base_qs.filter(department=user.department)

        return base_qs.none()

    # ── Audit helpers ─────────────────────────────────────

    def _log(self, action_type, obj, metadata=None):
        AuditLog.objects.create(
            user=self.request.user,
            action=action_type,
            object_type='Ticket',
            object_id=obj.id,
            metadata=metadata or {},
        )

    # ── Standard CRUD hooks ───────────────────────────────

    def perform_create(self, serializer):
        obj = serializer.save()
        self._log('CREATE', obj, {'title': obj.title, 'department_id': obj.department_id})

    def perform_update(self, serializer):
        obj = serializer.save()
        self._log('UPDATE', obj, {'title': obj.title, 'department_id': obj.department_id})

    def perform_destroy(self, instance):
        self._log('DELETE', instance, {'title': instance.title})
        instance.delete()

    # ── Custom actions ────────────────────────────────────

    @action(detail=True, methods=['post'], url_path='change-status',
            permission_classes=[IsTicketAssignee])
    def change_status(self, request, pk=None):
        """Change ticket status with transition validation. Only assignee or admin."""
        ticket = self.get_object()
        serializer = StatusChangeSerializer(data=request.data, context={'ticket': ticket})
        serializer.is_valid(raise_exception=True)

        old_status = ticket.status
        new_status = serializer.validated_data['status']
        ticket.status = new_status
        ticket.save(update_fields=['status', 'updated_at'])

        self._log('STATUS_CHANGE', ticket, {
            'old_status': old_status,
            'new_status': new_status,
        })

        return Response(TicketSerializer(ticket).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='assign')
    def assign(self, request, pk=None):
        """Assign ticket to an employee."""
        ticket = self.get_object()
        serializer = AssignTicketSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        old_assignee_id = ticket.assignee_id
        ticket.assignee = serializer.validated_data['assignee']
        ticket.save(update_fields=['assignee', 'updated_at'])

        self._log('ASSIGN', ticket, {
            'old_assignee_id': old_assignee_id,
            'new_assignee_id': ticket.assignee_id,
        })

        return Response(TicketSerializer(ticket).data, status=status.HTTP_200_OK)
