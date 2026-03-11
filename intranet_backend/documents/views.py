from rest_framework import viewsets, filters
from .models import Document
from .serializers import DocumentSerializer
from .permissions import IsAssignedToDepartment
from audit.models import AuditLog

class DocumentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing document instances.
    Enforces department-based permission logic so users only see and interact
    with documents assigned to their department.
    """
    serializer_class = DocumentSerializer
    permission_classes = [IsAssignedToDepartment] 
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title']
    ordering_fields = ['created_at', 'title']

    def get_queryset(self):
        user = self.request.user
        base_queryset = Document.objects.all().select_related('department', 'author')

        if user.is_superuser or user.role == 'admin':
            return base_queryset

        # Users can only see documents assigned to their department
        if hasattr(user, 'department') and user.department:
            return base_queryset.filter(department=user.department)

        return base_queryset.none()

    def _log_action(self, action, obj):
        AuditLog.objects.create(
            user=self.request.user,
            action=action,
            object_type='Document',
            object_id=obj.id,
            metadata={'title': obj.title, 'department_id': obj.department_id if obj.department else None}
        )

    def perform_create(self, serializer):
        obj = serializer.save(author=self.request.user)
        self._log_action('CREATE', obj)

    def perform_update(self, serializer):
        obj = serializer.save()
        self._log_action('UPDATE', obj)

    def perform_destroy(self, instance):
        self._log_action('DELETE', instance)
        instance.delete()
