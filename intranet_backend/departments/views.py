from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated

from accounts.permissions import IsAdmin
from departments.models import Department
from departments.serializers import DepartmentSerializer


@extend_schema_view(
    list=extend_schema(
        tags=["Departments"],
        description="**Access:** Any authenticated user.\n\nList all departments.",
    ),
    create=extend_schema(
        tags=["Departments"],
        description="**Access:** Admin or Manager.\n\nCreate a new department.",
    ),
    retrieve=extend_schema(
        tags=["Departments"],
        description="**Access:** Any authenticated user.\n\nRetrieve department details.",
    ),
    update=extend_schema(
        tags=["Departments"],
        description="**Access:** Admin or Manager.\n\nFully update a department.",
    ),
    partial_update=extend_schema(
        tags=["Departments"],
        description="**Access:** Admin or Manager.\n\nPartially update a department.",
    ),
    destroy=extend_schema(
        tags=["Departments"],
        description="**Access:** Admin or Manager.\n\nDelete a department.",
    ),
)
class DepartmentViewSet(viewsets.ModelViewSet):
    """CRUD ViewSet for Department with role-based permissions."""

    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name"]
    ordering_fields = ["name", "created_at"]
    ordering = ["name"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [IsAuthenticated()]
        return [IsAdmin()]
