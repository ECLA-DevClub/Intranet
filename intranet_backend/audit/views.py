from rest_framework import viewsets, mixins
from .models import AuditLog
from .serializers import AuditLogSerializer
from .permissions import IsCustomAdminUser

class AuditLogViewSet(mixins.RetrieveModelMixin, mixins.ListModelMixin, viewsets.GenericViewSet):
    """
    A simple ViewSet for viewing audit logs.
    Only accessible by Admins.
    """
    queryset = AuditLog.objects.all().select_related('user')
    serializer_class = AuditLogSerializer
    permission_classes = [IsCustomAdminUser]
