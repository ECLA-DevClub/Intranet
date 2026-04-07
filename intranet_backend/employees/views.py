from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import viewsets
from django_filters.rest_framework import DjangoFilterBackend
from .models import Employee
from .serializers import EmployeeSerializer


@extend_schema_view(
    list=extend_schema(
        tags=["Employees"],
        description="**Access:** Any authenticated user.\n\nList all employees. Supports filtering by `?department=`.",
    ),
    create=extend_schema(
        tags=["Employees"],
        description="**Access:** Any authenticated user.\n\nCreate an employee profile.",
    ),
    retrieve=extend_schema(
        tags=["Employees"],
        description="**Access:** Any authenticated user.\n\nRetrieve employee details.",
    ),
    update=extend_schema(
        tags=["Employees"],
        description="**Access:** Any authenticated user.\n\nFully update an employee profile.",
    ),
    partial_update=extend_schema(
        tags=["Employees"],
        description="**Access:** Any authenticated user.\n\nPartially update an employee profile.",
    ),
    destroy=extend_schema(
        tags=["Employees"],
        description="**Access:** Any authenticated user.\n\nDelete an employee profile.",
    ),
)
class EmployeeViewSet(viewsets.ModelViewSet):
    """CRUD for employee profiles with department filtering."""

    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['department']
