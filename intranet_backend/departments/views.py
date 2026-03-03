from rest_framework import viewsets, filters

from departments.models import Department
from departments.serializers import DepartmentSerializer


class DepartmentViewSet(viewsets.ModelViewSet):
    """
    CRUD ViewSet for Department.

    list:   GET    /api/departments/
    create: POST   /api/departments/
    read:   GET    /api/departments/{id}/
    update: PUT    /api/departments/{id}/
    patch:  PATCH  /api/departments/{id}/
    delete: DELETE /api/departments/{id}/
    """

    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name"]
    ordering_fields = ["name", "created_at"]
    ordering = ["name"]
