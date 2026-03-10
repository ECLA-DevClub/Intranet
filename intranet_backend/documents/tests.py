from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from django.contrib.auth import get_user_model
from departments.models import Department
from .models import Document

User = get_user_model()

class DocumentAPIRestTestCase(APITestCase):
    def setUp(self):
        # Create departments
        self.hr_dept = Department.objects.create(name='HR')
        self.eng_dept = Department.objects.create(name='Engineering')
        self.sales_dept = Department.objects.create(name='Sales')

        # Create users
        self.hr_user = User.objects.create_user(username='hr_user', email='hr@example.com', password='password123', department=self.hr_dept)
        self.eng_user = User.objects.create_user(username='eng_user', email='eng@example.com', password='password123', department=self.eng_dept)
        self.admin_user = User.objects.create_user(username='admin_user', email='admin@example.com', password='password123', role='admin')

        # Create a document authored by eng_user, available to eng_dept and sales_dept
        self.eng_doc = Document.objects.create(
            title="Engineering Specs",
            author=self.eng_user
        )
        self.eng_doc.allowed_departments.set([self.eng_dept, self.sales_dept])

        # Create a document authored by hr_user, available ONLY to HR
        self.hr_doc = Document.objects.create(
            title="HR Policies",
            author=self.hr_user
        )
        self.hr_doc.allowed_departments.set([self.hr_dept])
        
        self.list_url = reverse('document-list')

    def test_document_model_creation(self):
        self.assertEqual(Document.objects.count(), 2)
        self.assertEqual(str(self.eng_doc), "Engineering Specs")

    def test_list_documents_as_admin(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results'] if 'results' in response.data else response.data), 2)

    def test_list_documents_department_access(self):
        # HR user should only see HR doc
        self.client.force_authenticate(user=self.hr_user)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data['results'] if 'results' in response.data else response.data
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['title'], "HR Policies")

        # Eng user should only see Eng doc
        self.client.force_authenticate(user=self.eng_user)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data['results'] if 'results' in response.data else response.data
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['title'], "Engineering Specs")

    def test_retrieve_document_permission_denied(self):
        # HR user tries to access Eng doc directly
        self.client.force_authenticate(user=self.hr_user)
        url = reverse('document-detail', args=[self.eng_doc.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND) # ModelViewSet get_queryset filters it out first

    def test_create_document_upload(self):
        self.client.force_authenticate(user=self.eng_user)
        file_content = b'This is a test file.'
        test_file = SimpleUploadedFile("test_file.txt", file_content, content_type="text/plain")
        
        data = {
            'title': 'New Eng Doc',
            'file': test_file,
            'allowed_departments': [self.eng_dept.id]
        }
        
        response = self.client.post(self.list_url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Document.objects.count(), 3)
        self.assertEqual(Document.objects.latest('created_at').author, self.eng_user)

    def test_update_document_author_allowed(self):
        self.client.force_authenticate(user=self.eng_user)
        url = reverse('document-detail', args=[self.eng_doc.id])
        data = {'title': 'Updated Eng Specs'}
        response = self.client.patch(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.eng_doc.refresh_from_db()
        self.assertEqual(self.eng_doc.title, 'Updated Eng Specs')

    def test_delete_document_author_allowed(self):
        self.client.force_authenticate(user=self.eng_user)
        url = reverse('document-detail', args=[self.eng_doc.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Document.objects.count(), 1)
