from rest_framework import serializers
from .models import Employee
from django.contrib.auth import get_user_model

User = get_user_model()

class EmployeeSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    user_id = serializers.SerializerMethodField(read_only=True)

    def get_user_id(self, obj):
        lookup_username = obj.username or obj.email
        user = User.objects.filter(username=lookup_username).only('id').first()
        return user.id if user else None

    class Meta:
        model = Employee
        fields = ['id', 'name', 'email', 'username', 'position', 'department', 'role', 'password', 'user_id']
