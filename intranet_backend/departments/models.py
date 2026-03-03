from django.db import models


class Department(models.Model):
    """Company department (e.g. Engineering, HR, Marketing)."""

    name = models.CharField(
        max_length=255,
        unique=True,
        db_index=True,
        help_text="Unique department name.",
    )
    description = models.TextField(
        blank=True,
        default="",
        help_text="Optional department description.",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "Department"
        verbose_name_plural = "Departments"

    def __str__(self) -> str:
        return self.name
