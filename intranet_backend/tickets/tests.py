from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from departments.models import Department
from .models import Ticket

User = get_user_model()

class TicketAPIRestTestCase(APITestCase):
    def setUp(self):
        # Create departments
        self.hr_dept = Department.objects.create(name='HR')
        self.eng_dept = Department.objects.create(name='Engineering')

        # Create users
        self.hr_user = User.objects.create_user(username='hr_user_ticket', email='hr2@example.com', password='password123', department=self.hr_dept)
        self.eng_user = User.objects.create_user(username='eng_user_ticket', email='eng2@example.com', password='password123', department=self.eng_dept)
        self.admin_user = User.objects.create_user(username='admin_user_ticket', email='admin2@example.com', password='password123', role='admin')

        # Create tickets
        self.eng_ticket = Ticket.objects.create(
            title="Server issue",
            description="Server down",
            created_by=self.eng_user,
            department=self.eng_dept
        )
        self.hr_ticket = Ticket.objects.create(
            title="Payroll delay",
            description="Payroll takes too long",
            created_by=self.hr_user,
            department=self.hr_dept
        )
        
        self.list_url = reverse('ticket-list')

    def test_ticket_model_creation(self):
        self.assertEqual(Ticket.objects.count(), 2)
        self.assertEqual(str(self.eng_ticket), "Server issue")

    def test_list_tickets_as_admin(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Admin sees both
        self.assertEqual(len(response.data['results'] if 'results' in response.data else response.data), 2)

    def test_list_tickets_department_access(self):
        self.client.force_authenticate(user=self.eng_user)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data['results'] if 'results' in response.data else response.data
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['title'], "Server issue")

    def test_retrieve_ticket_cross_department_denied(self):
        # HR user tries to access Eng ticket directly
        self.client.force_authenticate(user=self.hr_user)
        url = reverse('ticket-detail', args=[self.eng_ticket.id])
        response = self.client.get(url)
        # Should be 404 because get_queryset filters it out
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_create_ticket(self):
        self.client.force_authenticate(user=self.eng_user)
        
        data = {
            'title': 'New Eng Ticket',
            'description': 'Laptop broken',
            'department': self.eng_dept.id
        }
        
        response = self.client.post(self.list_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Ticket.objects.count(), 3)
        self.assertEqual(Ticket.objects.latest('created_at').department, self.eng_dept)

    def test_update_ticket_same_department(self):
        self.client.force_authenticate(user=self.eng_user)
        url = reverse('ticket-detail', args=[self.eng_ticket.id])
        data = {'title': 'Updated Server issue'}
        response = self.client.patch(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.eng_ticket.refresh_from_db()
        self.assertEqual(self.eng_ticket.title, 'Updated Server issue')

    def test_delete_ticket_same_department(self):
        self.client.force_authenticate(user=self.eng_user)
        url = reverse('ticket-detail', args=[self.eng_ticket.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Ticket.objects.count(), 1)
