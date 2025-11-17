from rest_framework import serializers
from .models import RiscoCardiacoPaciente

class RiscoCardiacoPacienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = RiscoCardiacoPaciente
        fields = ['idade', 'colesterol', 'pressao', 'risco']
