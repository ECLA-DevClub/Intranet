from django.db import models
from django.conf import settings

class Ticket(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    department = models.ForeignKey('departments.Department', on_delete=models.CASCADE, related_name='tickets')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tickets')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title
