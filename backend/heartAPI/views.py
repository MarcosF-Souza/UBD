import pandas as pd
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import Http404
from .models import RiscoCardiacoPaciente
from .serializers import RiscoCardiacoPacienteSerializer

class CorrelacaoVariaveisView(APIView):
    def get(self, request):
        try:
            pacientes = RiscoCardiacoPaciente.objects.all()
            if not pacientes.exists():
                raise Http404
            data = list(pacientes.values('idade', 'colesterol', 'pressao', 'risco'))
            df = pd.DataFrame(data)
            correlation_matrix = df.corr(method='pearson')
            return Response({"matriz_correlacao": correlation_matrix.to_dict()})
        except Http404:
            return Response({"error": "No data found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DispersaoColesterolPressaoView(APIView):
    def get(self, request):
        try:
            pacientes = RiscoCardiacoPaciente.objects.all()
            if not pacientes.exists():
                raise Http404
            serializer = RiscoCardiacoPacienteSerializer(pacientes, many=True)
            # Correctly select only 'colesterol' and 'pressao' for the response
            response_data = [{key: item[key] for key in ['colesterol', 'pressao']} for item in serializer.data]
            return Response(response_data)
        except Http404:
            return Response({"error": "No data found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MapaCalorCorrelacaoView(APIView):
    def get(self, request):
        try:
            pacientes = RiscoCardiacoPaciente.objects.all()
            if not pacientes.exists():
                raise Http404
            data = list(pacientes.values('idade', 'colesterol', 'pressao', 'risco'))
            df = pd.DataFrame(data)
            correlation_matrix = df.corr(method='pearson')
            return Response({"matriz_correlacao": correlation_matrix.to_dict()})
        except Http404:
            return Response({"error": "No data found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
