from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from departments.models import Department
from documents.models import Document
from tickets.models import Ticket
from audit.models import AuditLog
from django.core.files.uploadedfile import SimpleUploadedFile

User = get_user_model()

class AuditLogAPITestCase(APITestCase):
    def setUp(self):
        # Create department
        self.dept = Department.objects.create(name='IT')

        # Create users
        self.employee = User.objects.create_user(username='employee', email='emp@example.com', password='password123', department=self.dept)
        self.admin = User.objects.create_user(username='admin', email='adm@example.com', password='password123', role='admin')

        # Create objects
        self.ticket = Ticket.objects.create(title="Initial Ticket", description="Desc", created_by=self.employee, department=self.dept)
        self.doc = Document.objects.create(title="Initial Doc", author=self.employee, department=self.dept)
        
        # Endpoints
        self.audit_list_url = reverse('auditlog-list')
        self.ticket_list_url = reverse('ticket-list')
        self.document_list_url = reverse('document-list')
        
        # Clear logs from initial setup creation
        AuditLog.objects.all().delete()

    def test_log_ticket_create(self):
        self.client.force_authenticate(user=self.employee)
        response = self.client.post(self.ticket_list_url, {
            'title': 'New Ticket', 'description': 'Something broke', 'department': self.dept.id
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(AuditLog.objects.filter(action='CREATE', object_type='Ticket').count(), 1)
        log = AuditLog.objects.get(object_type='Ticket')
        self.assertEqual(log.user, self.employee)
        self.assertEqual(log.object_id, response.data['id'])

    def test_log_ticket_update(self):
        self.client.force_authenticate(user=self.employee)
        url = reverse('ticket-detail', args=[self.ticket.id])
        response = self.client.patch(url, {'title': 'Updated Ticket'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(AuditLog.objects.filter(action='UPDATE', object_type='Ticket').count(), 1)

    def test_log_ticket_delete(self):
        self.client.force_authenticate(user=self.employee)
        url = reverse('ticket-detail', args=[self.ticket.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(AuditLog.objects.filter(action='DELETE', object_type='Ticket').count(), 1)

    def test_log_document_create(self):
        self.client.force_authenticate(user=self.employee)
        file_content = b'Testing audit log.'
        test_file = SimpleUploadedFile("test_audit.txt", file_content, content_type="text/plain")
        response = self.client.post(self.document_list_url, {
            'title': 'New Doc', 'file': test_file, 'department': self.dept.id
        }, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(AuditLog.objects.filter(action='CREATE', object_type='Document').count(), 1)

    def test_log_document_update(self):
        self.client.force_authenticate(user=self.employee)
        url = reverse('document-detail', args=[self.doc.id])
        response = self.client.patch(url, {'title': 'Updated Doc'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(AuditLog.objects.filter(action='UPDATE', object_type='Document').count(), 1)

    def test_log_document_delete(self):
        self.client.force_authenticate(user=self.employee)
        url = reverse('document-detail', args=[self.doc.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(AuditLog.objects.filter(action='DELETE', object_type='Document').count(), 1)

    def test_admin_can_view_logs(self):
        # Create a dummy log
        AuditLog.objects.create(user=self.employee, action='CREATE', object_type='Ticket', object_id=1)
        
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(self.audit_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data['results'] if 'results' in response.data else response.data
        self.assertEqual(len(data), 1)

    def test_non_admin_cannot_view_logs(self):
        AuditLog.objects.create(user=self.employee, action='CREATE', object_type='Ticket', object_id=1)
        
        self.client.force_authenticate(user=self.employee)
        response = self.client.get(self.audit_list_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
