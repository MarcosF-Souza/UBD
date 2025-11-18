import csv
from django.core.management.base import BaseCommand
from heartAPI.models import RiscoCardiacoPaciente
import os

class Command(BaseCommand):
    help = 'Loads heart risk data from a CSV file'

    def handle(self, *args, **kwargs):
        csv_file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'dados', 'risco_cardiaco.csv')
        
        if not os.path.exists(csv_file_path):
            self.stderr.write(self.style.ERROR(f'CSV file not found at: {csv_file_path}'))
            return

        self.stdout.write(self.style.SUCCESS(f'Loading data from: {csv_file_path}'))

        with open(csv_file_path, 'r') as file:
            reader = csv.DictReader(file)
            for row in reader:
                RiscoCardiacoPaciente.objects.create(
                    paciente_id=row['paciente'],
                    idade=row['idade'],
                    colesterol=row['colesterol'],
                    pressao=row['pressao'],
                    risco=row['risco']
                )
        self.stdout.write(self.style.SUCCESS('Data loaded successfully!'))
