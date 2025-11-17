from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import RiscoCardiacoPaciente

class HeartAPITests(APITestCase):
    def setUp(self):
        """Create some test data"""
        RiscoCardiacoPaciente.objects.create(paciente_id=1, idade=50, colesterol=200, pressao=120, risco=1)
        RiscoCardiacoPaciente.objects.create(paciente_id=2, idade=60, colesterol=240, pressao=140, risco=0)
        RiscoCardiacoPaciente.objects.create(paciente_id=3, idade=70, colesterol=220, pressao=130, risco=1)

    def test_correlacao_variaveis_success(self):
        """
        Ensure we can get the correlation matrix.
        """
        url = reverse('correlacao-variaveis')
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('matriz_correlacao', response.data)
        expected_keys = ['idade', 'colesterol', 'pressao', 'risco']
        self.assertEqual(list(response.data['matriz_correlacao'].keys()), expected_keys)
        for key in expected_keys:
            self.assertEqual(list(response.data['matriz_correlacao'][key].keys()), expected_keys)

    def test_correlacao_variaveis_no_data(self):
        """
        Ensure we get a 404 if no data is available.
        """
        RiscoCardiacoPaciente.objects.all().delete()
        url = reverse('correlacao-variaveis')
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_dispersao_colesterol_pressao_success(self):
        """
        Ensure we can get the dispersion data.
        """
        url = reverse('dispersao-colesterol-pressao')
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)
        self.assertIn('colesterol', response.data[0])
        self.assertIn('pressao', response.data[0])
        self.assertNotIn('idade', response.data[0])

    def test_dispersao_colesterol_pressao_no_data(self):
        """
        Ensure we get a 404 if no data is available.
        """
        RiscoCardiacoPaciente.objects.all().delete()
        url = reverse('dispersao-colesterol-pressao')
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_mapa_calor_correlacao_success(self):
        """
        Ensure we can get the correlation matrix for the heatmap.
        """
        url = reverse('mapa-calor-correlacao')
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('matriz_correlacao', response.data)
        expected_keys = ['idade', 'colesterol', 'pressao', 'risco']
        self.assertEqual(list(response.data['matriz_correlacao'].keys()), expected_keys)
        for key in expected_keys:
            self.assertEqual(list(response.data['matriz_correlacao'][key].keys()), expected_keys)

    def test_mapa_calor_correlacao_no_data(self):
        """
        Ensure we get a 404 if no data is available.
        """
        RiscoCardiacoPaciente.objects.all().delete()
        url = reverse('mapa-calor-correlacao')
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
