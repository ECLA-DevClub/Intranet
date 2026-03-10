from rest_framework import viewsets, filters
from django.db.models import Q
from .models import Document
from .serializers import DocumentSerializer
from .permissions import IsDocumentDepartmentAllowed

class DocumentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing document instances.
    Enforces department-based permission logic so users only see and interact
    with documents allowed for their department or authored by themselves.
    """
    serializer_class = DocumentSerializer
    permission_classes = [IsDocumentDepartmentAllowed] # Assume IsAuthenticated is globally set
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title']
    ordering_fields = ['created_at', 'title']

    def get_queryset(self):
        user = self.request.user
        base_queryset = Document.objects.all().prefetch_related('allowed_departments')

        if user.is_superuser or user.role == 'admin':
            return base_queryset

        # Users can see documents they authored OR documents that allow their department
        q_filter = Q(author=user)
        if hasattr(user, 'department') and user.department:
            q_filter |= Q(allowed_departments=user.department)

        return base_queryset.filter(q_filter).distinct()
