from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory, force_authenticate
from apps.places.views import PlaceViewSearch

User = get_user_model()

class PlaceViewSearchTestCase(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.view = PlaceViewSearch.as_view()
        
        self.admin = User.objects.create_user(
            first_name = "chris",
            last_name = "chris",
            email = "chris.mcke876@gmail.com",
            password = "password",
        )
        self.admin.is_staff = True
        self.admin.is_superuser = True
        self.admin.save()
        
    def test_authentication(self):
        request = self.factory.get("/api/search/?q=louvre")
        response = self.view(request)
        
        self.assertEqual(response.status_code, 401)
        
    def test_query_too_short(self):
        request = self.factory.get("/api/search/?q=l")
        response = self.view(request)
        
        self.assertEqual(response.status_code, 401)
        
    def test_limit_not_integer(self):
        request = self.factory.get("/api/search/?q=louvre&limit=h")
        response = self.view(request)
        
        self.assertEqual(response.status_code, 401)
        
    def test_authenticaed_user(self):
        request = self.factory.get("/api/search/?q=Louvre")
        force_authenticate(request, user=self.admin)
        
        response = self.view(request)
        
        self.assertEqual(response.status_code, 200)
    
    
        