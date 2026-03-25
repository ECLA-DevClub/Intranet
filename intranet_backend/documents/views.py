from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import Document, DocumentVersion
from .serializers import DocumentSerializer, DocumentVersionSerializer, UploadVersionSerializer
from .permissions import IsAssignedToDepartment, IsDocumentParticipant
from audit.models import AuditLog


class DocumentViewSet(viewsets.ModelViewSet):
    """
    CRUD for documents with department-based access.
    Extra actions: upload_version, versions.
    """
    serializer_class = DocumentSerializer
    
    def get_permissions(self):
        if self.action in ("list", "create"):
            return [IsAuthenticated()]
        return [IsDocumentParticipant()]

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title']
    ordering_fields = ['created_at', 'title']

    def get_queryset(self):
        user = self.request.user
        base_qs = Document.objects.all().select_related('department', 'author')

        if user.is_superuser or user.role == 'admin':
            return base_qs

        # Allow access if:
        # 1. User is the author
        # 2. Document is in user's department
        filters = Q(author=user)
        
        if hasattr(user, 'department') and user.department:
            filters |= Q(department=user.department)

        return base_qs.filter(filters).distinct()

    # ── Audit helper ──────────────────────────────────────

    def _log(self, action_type, obj, metadata=None):
        AuditLog.objects.create(
            user=self.request.user,
            action=action_type,
            object_type='Document',
            object_id=obj.id,
            metadata=metadata or {},
        )

    # ── Standard CRUD hooks ───────────────────────────────

    def perform_create(self, serializer):
        obj = serializer.save(author=self.request.user)
        # Create the initial version record
        DocumentVersion.objects.create(
            document=obj,
            file=obj.file,
            version_number=1,
            uploaded_by=self.request.user,
            comment='Initial version',
        )
        self._log('CREATE', obj, {'title': obj.title, 'department_id': obj.department_id})

    def perform_update(self, serializer):
        obj = serializer.save()
        self._log('UPDATE', obj, {'title': obj.title, 'department_id': obj.department_id})

    def perform_destroy(self, instance):
        self._log('DELETE', instance, {'title': instance.title})
        instance.delete()

    # ── Versioning actions ────────────────────────────────

    @action(detail=True, methods=['post'], url_path='upload-version')
    def upload_version(self, request, pk=None):
        """Upload a new version of an existing document."""
        document = self.get_object()
        serializer = UploadVersionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_version_number = document.current_version + 1
        version = DocumentVersion.objects.create(
            document=document,
            file=serializer.validated_data['file'],
            version_number=new_version_number,
            uploaded_by=request.user,
            comment=serializer.validated_data.get('comment', ''),
        )

        # Update document's current version and file reference
        document.current_version = new_version_number
        document.file = version.file
        document.save(update_fields=['current_version', 'file', 'updated_at'])

        self._log('UPDATE', document, {
            'action': 'new_version',
            'version_number': new_version_number,
        })

        return Response(
            DocumentVersionSerializer(version).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=['get'], url_path='versions')
    def versions(self, request, pk=None):
        """List all versions of a document."""
        document = self.get_object()
        versions = document.versions.all()
        serializer = DocumentVersionSerializer(versions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
