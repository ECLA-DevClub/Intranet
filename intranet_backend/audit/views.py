from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import viewsets, mixins
from .models import AuditLog
from .serializers import AuditLogSerializer
from .permissions import IsCustomAdminUser


@extend_schema_view(
    list=extend_schema(
        tags=["Audit Logs"],
        description="**Access:** Admin only.\n\nList all audit log entries. Logs are automatically created for ticket/document CRUD, status changes, assignments, and version uploads.",
    ),
    retrieve=extend_schema(
        tags=["Audit Logs"],
        description="**Access:** Admin only.\n\nRetrieve a single audit log entry.",
    ),
)
class AuditLogViewSet(mixins.RetrieveModelMixin, mixins.ListModelMixin, viewsets.GenericViewSet):
    """Read-only ViewSet for audit logs. Admin access only."""

    queryset = AuditLog.objects.all().select_related('user')
    serializer_class = AuditLogSerializer
    permission_classes = [IsCustomAdminUser]
