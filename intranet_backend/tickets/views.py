from rest_framework import viewsets, filters
from .models import Ticket
from .serializers import TicketSerializer
from documents.permissions import IsAssignedToDepartment

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
