from django.db import models

class RiscoCardiacoPaciente(models.Model):
    paciente_id = models.IntegerField(primary_key=True)
    idade = models.IntegerField()
    colesterol = models.IntegerField()
    pressao = models.IntegerField()
    risco = models.IntegerField()

    def __str__(self):
        return f"Paciente {self.paciente_id}"
