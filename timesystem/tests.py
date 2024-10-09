from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth.models import User
from .models import ClockInRecord, BreakRecord

class APITests(APITestCase):

    def setUp(self):
        # Create a test user with email and password
        self.user_email = 'allankevin22@gmail.com'
        self.user_password = 'Admin123'
        self.user = User.objects.create_user(
            username='admin',
            email=self.user_email,
            password=self.user_password,
            is_staff=False
        )

        # Define URLs
        self.login_url = reverse('login')
        self.clock_in_url = reverse('clock_in')
        self.clock_out_url = reverse('clock_out')
        self.take_break_url = reverse('take_break')

    def test_login(self):
        # Test login with email and password
        response = self.client.post(self.login_url, {
            'email': self.user_email,
            'password': self.user_password
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

        # Store tokens for further use
        self.access_token = response.data['access']
        self.refresh_token = response.data['refresh']

    def authenticate(self):
        # Helper method to authenticate and set the token
        self.test_login()
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.access_token)

    def test_clock_in(self):
        self.authenticate()
        response = self.client.post(self.clock_in_url, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('message', response.data)
        self.assertIn('record_id', response.data)

        # Store the clock-in record ID for later use
        self.clock_in_record_id = response.data['record_id']

    def test_clock_out(self):
        self.test_clock_in()  # This will authenticate and clock in
        response = self.client.post(self.clock_out_url, {
            'record_id': self.clock_in_record_id
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)
        self.assertIn('hours_worked', response.data)

    def test_take_break(self):
        self.test_clock_in()  # Authenticate and clock in
        response = self.client.post(self.take_break_url, {
            'record_id': self.clock_in_record_id,
            'break_type': 'tea',
            'break_notes': 'Taking a short tea break'
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('message', response.data)
        self.assertIn('break_id', response.data)

    def test_full_workflow(self):
        # Test the full workflow from login to clocking in, taking a break, and clocking out
        self.authenticate()

        # Clock in
        response = self.client.post(self.clock_in_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.clock_in_record_id = response.data['record_id']

        # Take a break
        response = self.client.post(self.take_break_url, {
            'record_id': self.clock_in_record_id,
            'break_type': 'lunch',
            'break_notes': 'Lunch break'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('break_id', response.data)

        # Clock out
        response = self.client.post(self.clock_out_url, {
            'record_id': self.clock_in_record_id
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('hours_worked', response.data)
