from django.db import models
from django.conf import settings
from wagtail.snippets.models import register_snippet
from wagtail.admin.panels import FieldPanel


@register_snippet
class Ticket(models.Model):
    class Status(models.TextChoices):
        OPEN = 'open', 'Open'
        IN_PROGRESS = 'in_progress', 'In Progress'
        CLOSED = 'closed', 'Closed'

    # Allowed status transitions: current_status -> set of valid next statuses
    TRANSITION_MAP = {
        Status.OPEN: {Status.IN_PROGRESS},
        Status.IN_PROGRESS: {Status.CLOSED},
        Status.CLOSED: set(),  # terminal state
    }

    title = models.CharField(max_length=255)
    description = models.TextField()
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.OPEN,
        db_index=True,
    )
    department = models.ForeignKey(
        'departments.Department',
        on_delete=models.CASCADE,
        related_name='tickets',
    )
    assignee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_tickets',
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_tickets',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    def can_transition_to(self, new_status: str) -> bool:
        """Check if the status transition is valid according to TRANSITION_MAP."""
        allowed = self.TRANSITION_MAP.get(self.status, set())
        return new_status in allowed

    panels = [
        FieldPanel('title'),
        FieldPanel('description'),
        FieldPanel('status'),
        FieldPanel('department'),
        FieldPanel('assignee'),
        FieldPanel('created_by'),
    ]
