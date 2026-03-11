from rest_framework import serializers
from .models import Document

class DocumentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.username', read_only=True)

    class Meta:
        model = Document
        fields = ['id', 'title', 'file', 'author', 'author_name', 'department', 'created_at', 'updated_at']
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']

    def create(self, validated_data):
        # Ensure the author is set to the current user during creation
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['author'] = request.user
        return super().create(validated_data)
