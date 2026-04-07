from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from documents.permissions import IsAssignedToDepartment
from accounts.permissions import IsManagerOrAdmin
from .permissions import IsTicketAssignee, IsTicketParticipant, IsTicketOwner
from .models import Ticket
from .serializers import TicketSerializer, StatusChangeSerializer, AssignTicketSerializer
from audit.models import AuditLog


@extend_schema_view(
    list=extend_schema(
        tags=["Tickets"],
        description="**Access:** Department-scoped (Admin sees all).\n\nList tickets. Supports `?search=` and `?ordering=created_at`.",
    ),
    create=extend_schema(
        tags=["Tickets"],
        description="**Access:** Department-scoped (Admin sees all).\n\nCreate a new ticket.",
    ),
    retrieve=extend_schema(
        tags=["Tickets"],
        description="**Access:** Department-scoped (Admin sees all).\n\nRetrieve ticket details.",
    ),
    update=extend_schema(
        tags=["Tickets"],
        description="**Access:** Department-scoped (Admin sees all).\n\nFully update a ticket (except status and assignee).",
    ),
    partial_update=extend_schema(
        tags=["Tickets"],
        description="**Access:** Department-scoped (Admin sees all).\n\nPartially update a ticket (except status and assignee).",
    ),
    destroy=extend_schema(
        tags=["Tickets"],
        description="**Access:** Department-scoped (Admin sees all).\n\nDelete a ticket.",
    ),
)
class TicketViewSet(viewsets.ModelViewSet):
    """CRUD for tickets with department-based access and custom status/assign actions."""

    serializer_class = TicketSerializer
    
    def get_permissions(self):
        # Any authenticated user may list/retrieve/create tickets available in queryset.
        if self.action in ("list", "retrieve", "create"):
            return [IsAuthenticated()]

        if self.action in ("update", "partial_update", "destroy"):
            return [IsTicketOwner()]
            
        # Assign is restricted to manager/admin and department scope.
        if self.action == "assign":
            return [IsManagerOrAdmin(), IsAssignedToDepartment()]
            
        # Status changes are allowed for assignee, manager, and admin.
        if self.action == "change_status":
            return [IsTicketAssignee()]

        return [IsTicketParticipant()]

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'title', 'status']

    def get_queryset(self):
        user = self.request.user
        base_qs = Ticket.objects.all().select_related('department', 'created_by', 'assignee')

        if user.is_superuser or user.role == 'admin':
            return base_qs

        # Allow access to tickets:
        # 1. In the user's department
        # 2. Created by the user
        # 3. Assigned to the user
        filters = Q(created_by=user) | Q(assignee=user)

        if hasattr(user, 'department') and user.department:
            filters |= Q(department=user.department)

        return base_qs.filter(filters).distinct()

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

    @extend_schema(
        tags=["Tickets"],
        description="**Access:** Assignee or Admin only.\n\nChange ticket status. Transitions: open → in_progress → closed.",
        request=StatusChangeSerializer,
        responses={200: TicketSerializer},
    )
    @action(detail=True, methods=['post'], url_path='change-status',
            permission_classes=[IsTicketAssignee])
    def change_status(self, request, pk=None):
        """Change ticket status with transition validation."""
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

    @extend_schema(
        tags=["Tickets"],
        description="**Access:** Department-scoped (Admin sees all).\n\nAssign ticket to an employee by user ID.",
        request=AssignTicketSerializer,
        responses={200: TicketSerializer},
    )
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
