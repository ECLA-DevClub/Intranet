from django.db import models

class Employee(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    position = models.CharField(max_length=255)
    department = models.CharField(max_length=255)
    role = models.CharField(max_length=255)

    class Meta:
        ordering = ['id']

    def __str__(self):
        return f"{self.name} ({self.position})"
