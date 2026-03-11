from rest_framework import serializers
from .models import Ticket

class TicketSerializer(serializers.ModelSerializer):
    creator_name = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = Ticket
        fields = ['id', 'title', 'description', 'department', 'created_by', 'creator_name', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

    def create(self, validated_data):
        # Ensure the creator is set to the current user during creation
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['created_by'] = request.user
        return super().create(validated_data)
