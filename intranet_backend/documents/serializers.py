from rest_framework import serializers
from .models import Document, DocumentVersion


class DocumentVersionSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.username', read_only=True)

    class Meta:
        model = DocumentVersion
        fields = [
            'id', 'document', 'file', 'version_number',
            'uploaded_by', 'uploaded_by_name', 'comment', 'created_at',
        ]
        read_only_fields = ['id', 'document', 'version_number', 'uploaded_by', 'created_at']


class UploadVersionSerializer(serializers.Serializer):
    """Input serializer for uploading a new document version."""
    file = serializers.FileField()
    comment = serializers.CharField(required=False, default='', allow_blank=True)


class DocumentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.username', read_only=True)

    class Meta:
        model = Document
        fields = [
            'id', 'title', 'file', 'author', 'author_name',
            'department', 'current_version', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'author', 'current_version', 'created_at', 'updated_at']

    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['author'] = request.user
        return super().create(validated_data)
