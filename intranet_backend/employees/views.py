from rest_framework import viewsets
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth import get_user_model
from .models import Employee
from .serializers import EmployeeSerializer
from departments.models import Department

User = get_user_model()

class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['department']

    def perform_create(self, serializer):
        # Extract password if present, otherwise use default
        password = serializer.validated_data.pop('password', None)
        employee = serializer.save()
        
        # Attempts to create a corresponding User for login
        email = employee.email
        if email and not User.objects.filter(username=email).exists():
            # Use email as username to allow login with email
            username = email
            
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

    def perform_destroy(self, instance):
        email = instance.email
        if email:
            User.objects.filter(email=email).delete()
        instance.delete()

