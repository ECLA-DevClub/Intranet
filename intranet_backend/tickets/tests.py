from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from departments.models import Department
from audit.models import AuditLog
from .models import Ticket

User = get_user_model()


class TicketModelTests(TestCase):
    """Unit tests for the Ticket model logic."""

    def setUp(self):
        self.dept = Department.objects.create(name='Engineering')
        self.user = User.objects.create_user(
            username='engineer', email='eng@test.com',
            password='testpass123', department=self.dept,
        )

    def test_default_status_is_open(self):
        ticket = Ticket.objects.create(
            title='Test', description='Desc',
            created_by=self.user, department=self.dept,
        )
        self.assertEqual(ticket.status, Ticket.Status.OPEN)

    def test_can_transition_open_to_in_progress(self):
        ticket = Ticket(status=Ticket.Status.OPEN)
        self.assertTrue(ticket.can_transition_to(Ticket.Status.IN_PROGRESS))

    def test_can_transition_in_progress_to_closed(self):
        ticket = Ticket(status=Ticket.Status.IN_PROGRESS)
        self.assertTrue(ticket.can_transition_to(Ticket.Status.CLOSED))

    def test_cannot_transition_open_to_closed(self):
        ticket = Ticket(status=Ticket.Status.OPEN)
        self.assertFalse(ticket.can_transition_to(Ticket.Status.CLOSED))

    def test_cannot_transition_closed_to_open(self):
        ticket = Ticket(status=Ticket.Status.CLOSED)
        self.assertFalse(ticket.can_transition_to(Ticket.Status.OPEN))

    def test_cannot_transition_closed_to_in_progress(self):
        ticket = Ticket(status=Ticket.Status.CLOSED)
        self.assertFalse(ticket.can_transition_to(Ticket.Status.IN_PROGRESS))

    def test_str_representation(self):
        ticket = Ticket(title='My Ticket')
        self.assertEqual(str(ticket), 'My Ticket')


class TicketAPITests(APITestCase):
    """Integration tests for the Ticket API endpoints."""

    def setUp(self):
        self.dept = Department.objects.create(name='Engineering')
        self.other_dept = Department.objects.create(name='HR')

        self.creator = User.objects.create_user(
            username='creator', email='creator@test.com',
            password='testpass123', department=self.dept,
        )
        self.assignee = User.objects.create_user(
            username='assignee', email='assignee@test.com',
            password='testpass123', department=self.dept,
        )
        self.other_user = User.objects.create_user(
            username='other', email='other@test.com',
            password='testpass123', department=self.dept,
        )
        self.admin_user = User.objects.create_user(
            username='admin', email='admin@test.com',
            password='testpass123', role='admin',
        )

        self.ticket = Ticket.objects.create(
            title='Server issue', description='Server down',
            created_by=self.creator, department=self.dept,
            assignee=self.assignee,
        )

        self.list_url = reverse('ticket-list')
        self.detail_url = reverse('ticket-detail', args=[self.ticket.id])
        self.status_url = reverse('ticket-change-status', args=[self.ticket.id])
        self.assign_url = reverse('ticket-assign', args=[self.ticket.id])

    # ── CRUD tests ────────────────────────────────────────

    def test_list_tickets_as_admin(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data if isinstance(response.data, list) else response.data.get('results', [])
        self.assertEqual(len(data), 1)

    def test_list_tickets_department_access(self):
        self.client.force_authenticate(user=self.creator)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data if isinstance(response.data, list) else response.data.get('results', [])
        self.assertEqual(len(data), 1)

    def test_create_ticket(self):
        self.client.force_authenticate(user=self.creator)
        data = {
            'title': 'New Ticket',
            'description': 'Description',
            'department': self.dept.id,
        }
        response = self.client.post(self.list_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Ticket.objects.count(), 2)
        self.assertEqual(response.data['status'], Ticket.Status.OPEN)

    def test_update_ticket(self):
        self.client.force_authenticate(user=self.creator)
        response = self.client.patch(self.detail_url, {'title': 'Updated'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.ticket.refresh_from_db()
        self.assertEqual(self.ticket.title, 'Updated')

    def test_delete_ticket(self):
        self.client.force_authenticate(user=self.creator)
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Ticket.objects.count(), 0)

    # ── Status transition tests ───────────────────────────

    def test_valid_status_change_open_to_in_progress(self):
        self.client.force_authenticate(user=self.assignee)
        response = self.client.post(self.status_url, {'status': 'in_progress'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.ticket.refresh_from_db()
        self.assertEqual(self.ticket.status, Ticket.Status.IN_PROGRESS)

    def test_valid_status_change_in_progress_to_closed(self):
        self.ticket.status = Ticket.Status.IN_PROGRESS
        self.ticket.save(update_fields=['status'])
        self.client.force_authenticate(user=self.assignee)
        response = self.client.post(self.status_url, {'status': 'closed'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.ticket.refresh_from_db()
        self.assertEqual(self.ticket.status, Ticket.Status.CLOSED)

    def test_invalid_status_change_open_to_closed(self):
        self.client.force_authenticate(user=self.assignee)
        response = self.client.post(self.status_url, {'status': 'closed'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_status_change_backward(self):
        self.ticket.status = Ticket.Status.CLOSED
        self.ticket.save(update_fields=['status'])
        self.client.force_authenticate(user=self.assignee)
        response = self.client.post(self.status_url, {'status': 'open'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # ── Permission tests ──────────────────────────────────

    def test_non_assignee_cannot_change_status(self):
        self.client.force_authenticate(user=self.other_user)
        response = self.client.post(self.status_url, {'status': 'in_progress'})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_change_status(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.post(self.status_url, {'status': 'in_progress'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.ticket.refresh_from_db()
        self.assertEqual(self.ticket.status, Ticket.Status.IN_PROGRESS)

    # ── Assign tests ──────────────────────────────────────

    def test_assign_ticket(self):
        self.client.force_authenticate(user=self.creator)
        response = self.client.post(self.assign_url, {'assignee': self.other_user.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.ticket.refresh_from_db()
        self.assertEqual(self.ticket.assignee, self.other_user)

    # ── Audit log tests ──────────────────────────────────

    def test_audit_log_on_create(self):
        self.client.force_authenticate(user=self.creator)
        self.client.post(self.list_url, {
            'title': 'Audit Test', 'description': 'Desc',
            'department': self.dept.id,
        })
        self.assertTrue(
            AuditLog.objects.filter(
                action='CREATE', object_type='Ticket',
            ).exists()
        )

    def test_audit_log_on_status_change(self):
        self.client.force_authenticate(user=self.assignee)
        self.client.post(self.status_url, {'status': 'in_progress'})
        log = AuditLog.objects.filter(
            action='STATUS_CHANGE', object_type='Ticket',
        ).first()
        self.assertIsNotNone(log)
        self.assertEqual(log.metadata['old_status'], 'open')
        self.assertEqual(log.metadata['new_status'], 'in_progress')

    def test_audit_log_on_assign(self):
        self.client.force_authenticate(user=self.creator)
        self.client.post(self.assign_url, {'assignee': self.other_user.id})
        log = AuditLog.objects.filter(
            action='ASSIGN', object_type='Ticket',
        ).first()
        self.assertIsNotNone(log)
        self.assertEqual(log.metadata['new_assignee_id'], self.other_user.id)

    def test_cross_department_ticket_not_visible(self):
        hr_user = User.objects.create_user(
            username='hr_user', email='hr@test.com',
            password='testpass123', department=self.other_dept,
        )
        self.client.force_authenticate(user=hr_user)
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
