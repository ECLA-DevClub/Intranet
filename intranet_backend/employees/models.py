from django.db import models
from wagtail.snippets.models import register_snippet
from wagtail.admin.panels import FieldPanel

@register_snippet
class Employee(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True, null=True, blank=True)
    position = models.CharField(max_length=255)
    department = models.CharField(max_length=255)
    role = models.CharField(max_length=255)

    class Meta:
        ordering = ['id']

    def __str__(self):
        return f"{self.name} ({self.position})"

    panels = [
        FieldPanel('name'),
        FieldPanel('email'),
        FieldPanel('username'),
        FieldPanel('position'),
        FieldPanel('department'),
        FieldPanel('role'),
    ]
