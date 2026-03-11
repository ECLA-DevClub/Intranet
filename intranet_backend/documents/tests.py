from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from django.contrib.auth import get_user_model
from departments.models import Department
from audit.models import AuditLog
from .models import Document, DocumentVersion

User = get_user_model()


class DocumentAPIRestTestCase(APITestCase):
    def setUp(self):
        self.hr_dept = Department.objects.create(name='HR')
        self.eng_dept = Department.objects.create(name='Engineering')

        self.hr_user = User.objects.create_user(
            username='hr_user', email='hr@example.com',
            password='password123', department=self.hr_dept,
        )
        self.eng_user = User.objects.create_user(
            username='eng_user', email='eng@example.com',
            password='password123', department=self.eng_dept,
        )
        self.admin_user = User.objects.create_user(
            username='admin_user', email='admin@example.com',
            password='password123', role='admin',
        )

        self.eng_doc = Document.objects.create(
            title="Engineering Specs",
            author=self.eng_user,
            department=self.eng_dept,
        )
        self.hr_doc = Document.objects.create(
            title="HR Policies",
            author=self.hr_user,
            department=self.hr_dept,
        )

        self.list_url = reverse('document-list')

    # ── Existing CRUD tests ───────────────────────────────

    def test_document_model_creation(self):
        self.assertEqual(Document.objects.count(), 2)
        self.assertEqual(str(self.eng_doc), "Engineering Specs")

    def test_list_documents_as_admin(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data if isinstance(response.data, list) else response.data.get('results', [])
        self.assertEqual(len(data), 2)

    def test_list_documents_department_access(self):
        self.client.force_authenticate(user=self.eng_user)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data if isinstance(response.data, list) else response.data.get('results', [])
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['title'], "Engineering Specs")

    def test_retrieve_document_cross_department_denied(self):
        self.client.force_authenticate(user=self.hr_user)
        url = reverse('document-detail', args=[self.eng_doc.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_create_document_upload(self):
        self.client.force_authenticate(user=self.eng_user)
        test_file = SimpleUploadedFile("test_file.txt", b'Test content', content_type="text/plain")

        data = {
            'title': 'New Eng Doc',
            'file': test_file,
            'department': self.eng_dept.id,
        }

        response = self.client.post(self.list_url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Document.objects.count(), 3)
        new_doc = Document.objects.latest('created_at')
        self.assertEqual(new_doc.department, self.eng_dept)
        self.assertEqual(new_doc.current_version, 1)

    def test_create_document_creates_initial_version(self):
        self.client.force_authenticate(user=self.eng_user)
        test_file = SimpleUploadedFile("v1.txt", b'Version 1', content_type="text/plain")
        response = self.client.post(self.list_url, {
            'title': 'Versioned Doc',
            'file': test_file,
            'department': self.eng_dept.id,
        }, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        doc = Document.objects.get(id=response.data['id'])
        self.assertEqual(doc.versions.count(), 1)
        self.assertEqual(doc.versions.first().version_number, 1)

    def test_update_document_same_department(self):
        self.client.force_authenticate(user=self.eng_user)
        url = reverse('document-detail', args=[self.eng_doc.id])
        response = self.client.patch(url, {'title': 'Updated Eng Specs'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.eng_doc.refresh_from_db()
        self.assertEqual(self.eng_doc.title, 'Updated Eng Specs')

    def test_delete_document_same_department(self):
        self.client.force_authenticate(user=self.eng_user)
        url = reverse('document-detail', args=[self.eng_doc.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Document.objects.count(), 1)

    # ── Versioning tests ──────────────────────────────────

    def test_upload_version(self):
        self.client.force_authenticate(user=self.eng_user)
        url = reverse('document-upload-version', args=[self.eng_doc.id])
        new_file = SimpleUploadedFile("v2.txt", b'Version 2 content', content_type="text/plain")
        response = self.client.post(url, {'file': new_file, 'comment': 'Updated specs'}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.eng_doc.refresh_from_db()
        self.assertEqual(self.eng_doc.current_version, 2)
        self.assertEqual(response.data['version_number'], 2)

    def test_upload_multiple_versions(self):
        self.client.force_authenticate(user=self.eng_user)
        url = reverse('document-upload-version', args=[self.eng_doc.id])

        for i in range(2, 5):
            new_file = SimpleUploadedFile(f"v{i}.txt", f'Version {i}'.encode(), content_type="text/plain")
            response = self.client.post(url, {'file': new_file}, format='multipart')
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.eng_doc.refresh_from_db()
        self.assertEqual(self.eng_doc.current_version, 4)
        self.assertEqual(DocumentVersion.objects.filter(document=self.eng_doc).count(), 3)

    def test_list_versions(self):
        # Create some versions first
        for i in range(1, 4):
            DocumentVersion.objects.create(
                document=self.eng_doc,
                file=SimpleUploadedFile(f"v{i}.txt", f'v{i}'.encode()),
                version_number=i,
                uploaded_by=self.eng_user,
            )

        self.client.force_authenticate(user=self.eng_user)
        url = reverse('document-versions', args=[self.eng_doc.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)

    def test_version_audit_log(self):
        self.client.force_authenticate(user=self.eng_user)
        url = reverse('document-upload-version', args=[self.eng_doc.id])
        new_file = SimpleUploadedFile("v2.txt", b'Version 2', content_type="text/plain")
        self.client.post(url, {'file': new_file}, format='multipart')

        log = AuditLog.objects.filter(
            action='UPDATE', object_type='Document',
            object_id=self.eng_doc.id,
        ).first()
        self.assertIsNotNone(log)
        self.assertEqual(log.metadata.get('action'), 'new_version')

    def test_cross_department_cannot_upload_version(self):
        self.client.force_authenticate(user=self.hr_user)
        url = reverse('document-upload-version', args=[self.eng_doc.id])
        new_file = SimpleUploadedFile("hack.txt", b'Hacked', content_type="text/plain")
        response = self.client.post(url, {'file': new_file}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
