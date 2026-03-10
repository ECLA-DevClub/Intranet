from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import Employee

class EmployeeModelTest(TestCase):
    def test_create_employee(self):
        emp = Employee.objects.create(
            name="John Doe",
            email="john@example.com",
            position="Developer",
            department="IT",
            role="Staff"
        )
        self.assertEqual(emp.name, "John Doe")
        self.assertEqual(str(emp), "John Doe (Developer)")

class EmployeeAPITest(APITestCase):
    def setUp(self):
        # We need an authenticated user if IsAuthenticated is set globally.
        # But wait, IsAuthenticated is in DEFAULT_PERMISSION_CLASSES.
        # However, default Wagtail API or standard DRF auth.
        from django.contrib.auth import get_user_model
        User = get_user_model()
        self.user = User.objects.create_user(username='testuser', email='test@example.com', password='password123')
        self.client.force_authenticate(user=self.user)
        
        self.emp1 = Employee.objects.create(
            name="Alice", email="alice@example.com", position="Dev", department="IT", role="Staff"
        )
        self.emp2 = Employee.objects.create(
            name="Bob", email="bob@example.com", position="HR Manager", department="HR", role="Manager"
        )
        self.list_url = reverse('employee-list')

    def test_list_employees(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results'] if 'results' in response.data else response.data), 2)

    def test_filter_employees_by_department(self):
        response = self.client.get(self.list_url, {'department': 'IT'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data['results'] if 'results' in response.data else response.data
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['name'], "Alice")

    def test_create_employee(self):
        data = {
            "name": "Charlie",
            "email": "charlie@example.com",
            "position": "Analyst",
            "department": "Finance",
            "role": "Staff"
        }
        response = self.client.post(self.list_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Employee.objects.count(), 3)

    def test_update_employee(self):
        url = reverse('employee-detail', args=[self.emp1.id])
        data = {"name": "Alice Smith"}
        response = self.client.patch(url, data) # partial update
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Employee.objects.get(id=self.emp1.id).name, "Alice Smith")

    def test_delete_employee(self):
        url = reverse('employee-detail', args=[self.emp2.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Employee.objects.count(), 1)
