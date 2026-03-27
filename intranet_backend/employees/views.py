from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied, ValidationError
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth import get_user_model
from .models import Employee
from .serializers import EmployeeSerializer
from departments.models import Department
from accounts.permissions import IsManagerOrAdmin

User = get_user_model()

class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['department']

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [IsAuthenticated()]
        return [IsManagerOrAdmin()]

    def perform_create(self, serializer):
        requested_role = str(serializer.validated_data.get('role', 'employee')).lower()

        # Managers may create only employees; admins can create any role.
        if self.request.user.role == User.Role.MANAGER and requested_role != User.Role.EMPLOYEE:
            raise PermissionDenied("Managers can create only employees.")

        login_username = str(serializer.validated_data.get('username') or serializer.validated_data.get('email') or '').strip()
        if not login_username:
            raise ValidationError("Username or email is required.")

        if User.objects.filter(username=login_username).exists():
            raise ValidationError("This login is already taken.")

        # Extract password if present, otherwise use default
        password = serializer.validated_data.pop('password', None)
        employee = serializer.save(username=login_username)
        
        # Attempts to create a corresponding User for login
        email = employee.email
        if email:
            username = employee.username or email
            
            # Map role string to User.Role
            role_map = {
                'admin': User.Role.ADMIN,
                'manager': User.Role.MANAGER,
                'employee': User.Role.EMPLOYEE
            }
            user_role = role_map.get(str(employee.role).lower(), User.Role.EMPLOYEE)
            
            # Find department (by name since Employee stores name string)
            # Find department (by name since Employee stores name string)
            dept_obj = Department.objects.filter(name=employee.department).first()
            if not dept_obj and employee.department:
                 # Optional: Create department if it doesn't exist or just assign first one
                 pass
            
            # Create the user with provided or default password
            final_password = password if password else "password123"
            
            User.objects.create_user(
                username=username,
                email=email,
                password=final_password, 
                role=user_role,
                department=dept_obj,
                first_name=employee.name.split(' ')[0] if employee.name else '',
                last_name=' '.join(employee.name.split(' ')[1:]) if employee.name else ''
            )

    def perform_update(self, serializer):
        current_employee = serializer.instance
        requested_role = str(serializer.validated_data.get('role', current_employee.role)).lower()

        if self.request.user.role == User.Role.MANAGER and requested_role != User.Role.EMPLOYEE:
            raise PermissionDenied("Managers can assign only employee role.")

        if self.request.user.role == User.Role.ADMIN:
            allowed = {User.Role.ADMIN, User.Role.MANAGER, User.Role.EMPLOYEE}
        else:
            allowed = {User.Role.EMPLOYEE}

        if requested_role not in allowed:
            raise ValidationError("Invalid target role.")

        employee = serializer.save(role=requested_role)

        login_username = employee.username or employee.email
        linked_user = User.objects.filter(username=login_username).first()
        if linked_user:
            linked_user.role = requested_role
            linked_user.department = Department.objects.filter(name=employee.department).first()
            linked_user.save(update_fields=['role', 'department'])

    def perform_destroy(self, instance):
        login_username = instance.username or instance.email
        if login_username:
            User.objects.filter(username=login_username).delete()
        instance.delete()

