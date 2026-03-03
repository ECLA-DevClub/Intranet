from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated

from accounts.permissions import IsManagerOrAdmin
from departments.models import Department
from departments.serializers import DepartmentSerializer


class DepartmentViewSet(viewsets.ModelViewSet):
    """
    CRUD ViewSet for Department with role-based permissions.

    list:   GET    /api/departments/        — any authenticated
    create: POST   /api/departments/        — Admin / Manager
    read:   GET    /api/departments/{id}/   — any authenticated
    update: PUT    /api/departments/{id}/   — Admin / Manager
    patch:  PATCH  /api/departments/{id}/   — Admin / Manager
    delete: DELETE /api/departments/{id}/   — Admin / Manager
    """

    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name"]
    ordering_fields = ["name", "created_at"]
    ordering = ["name"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [IsAuthenticated()]
        return [IsManagerOrAdmin()]
