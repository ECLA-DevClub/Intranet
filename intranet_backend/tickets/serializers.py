from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Ticket

User = get_user_model()


class TicketSerializer(serializers.ModelSerializer):
    creator_name = serializers.CharField(source='created_by.username', read_only=True)
    assignee_name = serializers.CharField(source='assignee.username', read_only=True, default=None)

    class Meta:
        model = Ticket
        fields = [
            'id', 'title', 'description', 'status',
            'department', 'assignee', 'assignee_name',
            'created_by', 'creator_name',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'status', 'created_by', 'created_at', 'updated_at']

    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['created_by'] = request.user
        return super().create(validated_data)


class StatusChangeSerializer(serializers.Serializer):
    """Validates ticket status transitions."""
    status = serializers.ChoiceField(choices=Ticket.Status.choices)

    def validate_status(self, value):
        ticket = self.context['ticket']
        if not ticket.can_transition_to(value):
            raise serializers.ValidationError(
                f"Invalid transition: '{ticket.get_status_display()}' → "
                f"'{dict(Ticket.Status.choices).get(value, value)}'."
            )
        return value


class AssignTicketSerializer(serializers.Serializer):
    """Validates ticket assignment."""
    assignee = serializers.PrimaryKeyRelatedField(queryset=User.objects.filter(is_active=True))
