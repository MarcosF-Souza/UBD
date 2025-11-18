# 📚 Documentação Detalhada - Heart API Django

## ⚠️ IMPORTANTE: Abordagem Diferente da Energy API

A **Heart API** usa uma abordagem **orientada a banco de dados** (Model-based), enquanto a **Energy API** usa **processamento direto de CSV** (Service-based).

---

## 🔄 Comparação das Abordagens

### Energy API (Sua Abordagem)
```
CSV → Pandas → Services → Views → JSON
```
- ✅ Dados processados em tempo real
- ✅ Sem banco de dados
- ✅ Simples para análises pontuais
- ❌ Lê CSV toda vez (mais lento)

### Heart API (Abordagem do Amigo)
```
CSV → Command → Database → Models → Views → JSON
```
- ✅ Dados persistidos no banco
- ✅ Queries rápidas
- ✅ Escalável para milhares de registros
- ❌ Mais complexo (Models, Migrations, Commands)

---

## 📋 Arquitetura da Heart API

### 1. Fluxo Completo

```
┌─────────────────────────────────────────────────────────────┐
│ 1. CARGA INICIAL (Uma vez)                                   │
├─────────────────────────────────────────────────────────────┤
│ CSV (risco_cardiaco.csv)                                     │
│         ↓                                                    │
│ Management Command (load_heart_data.py)                      │
│         ↓                                                    │
│ SQLite Database (db.sqlite3)                                 │
│         ↓                                                    │
│ Tabela: heartAPI_riscocardiacopaciente                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 2. REQUISIÇÕES (Toda vez que frontend acessa)               │
├─────────────────────────────────────────────────────────────┤
│ Frontend → GET /api/saude/correlacao-variaveis/             │
│         ↓                                                    │
│ View (CorrelacaoVariaveisView)                               │
│         ↓                                                    │
│ Model.objects.all() → Query no banco                         │
│         ↓                                                    │
│ Pandas processa dados                                        │
│         ↓                                                    │
│ Response JSON                                                │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. Model (Estrutura de Dados)

### 1.1. O que é um Model?

**Model** no Django representa uma **tabela no banco de dados**.

**Arquivo**: `backend/heartAPI/models.py`

```python
from django.db import models

class RiscoCardiacoPaciente(models.Model):
    paciente_id = models.IntegerField(primary_key=True)
    idade = models.IntegerField()
    colesterol = models.IntegerField()
    pressao = models.IntegerField()
    risco = models.IntegerField()

    def __str__(self):
        return f"Paciente {self.paciente_id}"
```

### 1.2. Explicação Linha por Linha

```python
from django.db import models
```
- Importa sistema de modelos do Django
- Permite criar classes que viram tabelas no DB

---

```python
class RiscoCardiacoPaciente(models.Model):
```
- Define classe que herda de `models.Model`
- Django cria automaticamente:
  - Tabela no banco: `heartAPI_riscocardiacopaciente`
  - Métodos: `.save()`, `.delete()`, `.objects.all()`

---

```python
paciente_id = models.IntegerField(primary_key=True)
```

**O que faz:**
- Cria coluna `paciente_id` do tipo inteiro
- `primary_key=True`: Chave primária (identificador único)
- Django NÃO cria campo `id` automático quando você define primary_key

**Equivalente SQL:**
```sql
CREATE TABLE heartAPI_riscocardiacopaciente (
    paciente_id INTEGER PRIMARY KEY,
    ...
);
```

---

```python
idade = models.IntegerField()
colesterol = models.IntegerField()
pressao = models.IntegerField()
risco = models.IntegerField()
```

**Campos normais:**
- Cada linha cria uma coluna na tabela
- `IntegerField()`: Aceita números inteiros

**Tipos disponíveis:**
```python
CharField(max_length=100)     # Texto curto
TextField()                   # Texto longo
FloatField()                  # Número decimal
BooleanField()                # True/False
DateField()                   # Data
DateTimeField()               # Data e hora
```

---

```python
def __str__(self):
    return f"Paciente {self.paciente_id}"
```

**O que faz:**
- Define representação em string do objeto
- Usado no Django Admin: mostra "Paciente 1" em vez de "RiscoCardiacoPaciente object"

**Exemplo:**
```python
paciente = RiscoCardiacoPaciente.objects.get(paciente_id=1)
print(paciente)  # Output: "Paciente 1"
```

---

### 1.3. Migrations (Criando a Tabela)

**Migrations** são arquivos que criam/modificam tabelas no banco.

**Comandos:**

```bash
# 1. Criar arquivo de migration
python manage.py makemigrations

# 2. Aplicar migration (criar tabela)
python manage.py migrate
```

**O que acontece:**
1. Django lê `models.py`
2. Compara com banco atual
3. Gera arquivo SQL em `migrations/0001_initial.py`
4. Executa SQL no banco

**Resultado no DB:**
```
Tabela: heartAPI_riscocardiacopaciente
┌─────────────┬───────┬────────────┬─────────┬───────┐
│ paciente_id │ idade │ colesterol │ pressao │ risco │
├─────────────┼───────┼────────────┼─────────┼───────┤
│      1      │  45   │    220     │   140   │   1   │
│      2      │  38   │    180     │   125   │   0   │
└─────────────┴───────┴────────────┴─────────┴───────┘
```

---

## 2. Management Command (Carregar CSV)

### 2.1. O que é um Management Command?

**Management Commands** são scripts customizados que você executa com `python manage.py <comando>`.

**Exemplos nativos:**
```bash
python manage.py runserver       # Nativo do Django
python manage.py migrate          # Nativo do Django
python manage.py load_heart_data  # Custom do seu amigo
```

### 2.2. Estrutura de Pastas

```
heartAPI/
└── management/
    └── commands/
        └── load_heart_data.py  ← Comando customizado
```

**Importante:**
- Pasta `management/` deve ter `__init__.py`
- Pasta `commands/` deve ter `__init__.py`
- Nome do arquivo = nome do comando

---

### 2.3. Código Completo

**Arquivo**: `backend/heartAPI/management/commands/load_heart_data.py`

```python
import csv
from django.core.management.base import BaseCommand
from heartAPI.models import RiscoCardiacoPaciente
import os

class Command(BaseCommand):
    help = 'Loads heart risk data from a CSV file'

    def handle(self, *args, **kwargs):
        csv_file_path = os.path.join(
            os.path.dirname(os.path.abspath(__file__)), 
            '..', '..', '..', '..', 
            'dados', 
            'risco_cardiaco.csv'
        )
        
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
```

### 2.4. Explicação Detalhada

#### 2.4.1. Estrutura Básica

```python
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = 'Loads heart risk data from a CSV file'
```

**O que faz:**
- Herda de `BaseCommand` (obrigatório)
- `help`: Texto mostrado em `python manage.py help load_heart_data`

---

#### 2.4.2. Método `handle()`

```python
def handle(self, *args, **kwargs):
```

**O que faz:**
- Método obrigatório
- Django chama este método quando comando é executado
- `*args, **kwargs`: Aceita argumentos opcionais

---

#### 2.4.3. Construir Caminho do CSV

```python
csv_file_path = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), 
    '..', '..', '..', '..', 
    'dados', 
    'risco_cardiaco.csv'
)
```

**Decompondo:**

1. `__file__`: Caminho do arquivo atual
   - `C:\...\UBD\backend\heartAPI\management\commands\load_heart_data.py`

2. `os.path.abspath(__file__)`: Caminho absoluto
   - Garante que é caminho completo

3. `os.path.dirname(...)`: Pega diretório pai
   - `C:\...\UBD\backend\heartAPI\management\commands\`

4. `'..', '..', '..', '..'`: Sobe 4 níveis
   - commands → management → heartAPI → backend → UBD

5. `'dados', 'risco_cardiaco.csv'`: Adiciona subpastas
   - Resultado: `C:\...\UBD\dados\risco_cardiaco.csv`

**Problema dessa abordagem:**
- Muitos `'..'` são confusos
- **Melhor usar pathlib** (como na Energy API):

```python
from pathlib import Path
csv_file_path = Path(__file__).resolve().parent.parent.parent.parent.parent / 'dados' / 'risco_cardiaco.csv'
```

---

#### 2.4.4. Verificar se Arquivo Existe

```python
if not os.path.exists(csv_file_path):
    self.stderr.write(self.style.ERROR(f'CSV file not found at: {csv_file_path}'))
    return
```

**O que faz:**
- Verifica se arquivo existe antes de tentar abrir
- `self.stderr.write()`: Escreve no console (erro)
- `self.style.ERROR()`: Colorido de vermelho
- `return`: Encerra comando sem fazer nada

**Output no terminal:**
```
CSV file not found at: C:\...\dados\risco_cardiaco.csv
```

---

#### 2.4.5. Mensagem de Sucesso Inicial

```python
self.stdout.write(self.style.SUCCESS(f'Loading data from: {csv_file_path}'))
```

**O que faz:**
- Mensagem colorida de verde
- Informa que está iniciando carga

**Output no terminal:**
```
Loading data from: C:\...\dados\risco_cardiaco.csv
```

---

#### 2.4.6. Ler CSV e Inserir no Banco

```python
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
```

**Explicação:**

1. **`with open(csv_file_path, 'r') as file:`**
   - Abre arquivo CSV para leitura
   - `with`: Fecha arquivo automaticamente ao final

2. **`reader = csv.DictReader(file)`**
   - Lê CSV e transforma cada linha em dicionário
   - Usa primeira linha como chaves

**Exemplo do CSV:**
```csv
paciente,idade,colesterol,pressao,risco
1,45,220,140,1
2,38,180,125,0
```

**Como DictReader vê:**
```python
# Primeira iteração (linha 2 do CSV)
row = {
    'paciente': '1',
    'idade': '45',
    'colesterol': '220',
    'pressao': '140',
    'risco': '1'
}

# Segunda iteração (linha 3 do CSV)
row = {
    'paciente': '2',
    'idade': '38',
    ...
}
```

3. **`for row in reader:`**
   - Itera sobre cada linha do CSV

4. **`RiscoCardiacoPaciente.objects.create(...)`**
   - Cria novo registro no banco
   - `.objects`: Manager do Django (faz queries)
   - `.create()`: INSERT no banco

**Equivalente SQL:**
```sql
INSERT INTO heartAPI_riscocardiacopaciente 
(paciente_id, idade, colesterol, pressao, risco)
VALUES (1, 45, 220, 140, 1);
```

**Importante:**
- `row['paciente']` é **string** do CSV
- Django converte automaticamente para **int** (campo é IntegerField)

---

#### 2.4.7. Como Executar o Command

```bash
# Certifique-se que está na pasta backend/
cd backend

# Execute o comando
python manage.py load_heart_data
```

**Output esperado:**
```
Loading data from: C:\...\dados\risco_cardiaco.csv
Data loaded successfully!
```

**O que aconteceu:**
- CSV foi lido
- 4 registros foram inseridos no banco SQLite
- Dados agora persistem (mesmo se reiniciar servidor)

---

## 3. Serializers (Formatação JSON)

### 3.1. O que é um Serializer?

**Serializer** transforma objetos Django → JSON (e vice-versa).

**Arquivo**: `backend/heartAPI/serializers.py`

```python
from rest_framework import serializers
from .models import RiscoCardiacoPaciente

class RiscoCardiacoPacienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = RiscoCardiacoPaciente
        fields = ['idade', 'colesterol', 'pressao', 'risco']
```

### 3.2. Explicação

```python
class RiscoCardiacoPacienteSerializer(serializers.ModelSerializer):
```
- Herda de `ModelSerializer` (baseado em Model)
- Django REST Framework cria automaticamente campos

---

```python
class Meta:
    model = RiscoCardiacoPaciente
    fields = ['idade', 'colesterol', 'pressao', 'risco']
```

**O que define:**
- `model`: Qual model usar
- `fields`: Quais campos incluir no JSON

**Nota:** `paciente_id` não está nos fields! Será excluído do JSON.

---

### 3.3. Como Usar

```python
# Pegar todos os pacientes do banco
pacientes = RiscoCardiacoPaciente.objects.all()

# Serializar (Model → JSON)
serializer = RiscoCardiacoPacienteSerializer(pacientes, many=True)
print(serializer.data)
```

**Output:**
```python
[
    {'idade': 45, 'colesterol': 220, 'pressao': 140, 'risco': 1},
    {'idade': 38, 'colesterol': 180, 'pressao': 125, 'risco': 0},
    ...
]
```

**Vantagens:**
- Valida dados automaticamente
- Fácil criar/atualizar (deserialização)
- DRY (Don't Repeat Yourself)

---

## 4. Views (Class-Based Views)

### 4.1. Diferença: Function-Based vs Class-Based

**Function-Based (Energy API):**
```python
@api_view(['GET'])
def analise_rendimento(request):
    return Response(dados)
```

**Class-Based (Heart API):**
```python
class CorrelacaoVariaveisView(APIView):
    def get(self, request):
        return Response(dados)
```

**Quando usar cada uma?**
- **Function**: Endpoints simples, lógica direta
- **Class**: Endpoints complexos, múltiplos métodos (GET, POST, PUT)

---

### 4.2. View 1: Correlação de Variáveis

```python
class CorrelacaoVariaveisView(APIView):
    def get(self, request):
        try:
            # 1. Buscar todos os pacientes do banco
            pacientes = RiscoCardiacoPaciente.objects.all()
            
            # 2. Verificar se há dados
            if not pacientes.exists():
                raise Http404
            
            # 3. Converter QuerySet em lista de dicionários
            data = list(pacientes.values('idade', 'colesterol', 'pressao', 'risco'))
            
            # 4. Criar DataFrame do Pandas
            df = pd.DataFrame(data)
            
            # 5. Calcular correlação
            correlation_matrix = df.corr(method='pearson')
            
            # 6. Retornar JSON
            return Response({"matriz_correlacao": correlation_matrix.to_dict()})
            
        except Http404:
            return Response({"error": "No data found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
```

#### 4.2.1. Explicação Detalhada

**1. Buscar Dados do Banco**
```python
pacientes = RiscoCardiacoPaciente.objects.all()
```

- `.objects`: Manager do Django
- `.all()`: SELECT * FROM heartAPI_riscocardiacopaciente
- Retorna **QuerySet** (lazy, não executa SQL ainda)

**Equivalente SQL:**
```sql
SELECT * FROM heartAPI_riscocardiacopaciente;
```

---

**2. Verificar se Há Dados**
```python
if not pacientes.exists():
    raise Http404
```

- `.exists()`: Executa query COUNT(*) (rápido)
- Se vazio, levanta erro 404

---

**3. Converter para Lista de Dicionários**
```python
data = list(pacientes.values('idade', 'colesterol', 'pressao', 'risco'))
```

**Decompondo:**

- `.values('idade', ...)`: SELECT apenas essas colunas
- Retorna QuerySet de dicionários
- `list()`: Força execução e converte para lista Python

**Resultado:**
```python
[
    {'idade': 45, 'colesterol': 220, 'pressao': 140, 'risco': 1},
    {'idade': 38, 'colesterol': 180, 'pressao': 125, 'risco': 0},
]
```

---

**4. Criar DataFrame**
```python
df = pd.DataFrame(data)
```

**Resultado:**
```
   idade  colesterol  pressao  risco
0     45         220      140      1
1     38         180      125      0
```

---

**5. Calcular Correlação**
```python
correlation_matrix = df.corr(method='pearson')
```

- Mesmo que na Energy API
- Retorna matriz de correlação

---

**6. Retornar JSON**
```python
return Response({"matriz_correlacao": correlation_matrix.to_dict()})
```

- Converte DataFrame → dict → JSON

---

### 4.3. View 2: Dispersão Colesterol × Pressão

```python
class DispersaoColesterolPressaoView(APIView):
    def get(self, request):
        try:
            pacientes = RiscoCardiacoPaciente.objects.all()
            if not pacientes.exists():
                raise Http404
            
            # Serializar todos os dados
            serializer = RiscoCardiacoPacienteSerializer(pacientes, many=True)
            
            # Filtrar apenas colesterol e pressão
            response_data = [
                {key: item[key] for key in ['colesterol', 'pressao']} 
                for item in serializer.data
            ]
            
            return Response(response_data)
        except Http404:
            return Response({"error": "No data found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
```

#### 4.3.1. Explicação

**Uso do Serializer:**
```python
serializer = RiscoCardiacoPacienteSerializer(pacientes, many=True)
```

- `pacientes`: QuerySet com múltiplos objetos
- `many=True`: Serializar lista inteira (não apenas 1 objeto)

---

**List Comprehension:**
```python
response_data = [
    {key: item[key] for key in ['colesterol', 'pressao']} 
    for item in serializer.data
]
```

**O que faz:**
- Itera sobre cada item serializado
- Cria novo dict com apenas colesterol e pressao

**Equivalente verboso:**
```python
response_data = []
for item in serializer.data:
    new_item = {}
    for key in ['colesterol', 'pressao']:
        new_item[key] = item[key]
    response_data.append(new_item)
```

**Resultado:**
```python
[
    {'colesterol': 220, 'pressao': 140},
    {'colesterol': 180, 'pressao': 125},
]
```

---

### 4.4. View 3: Mapa de Calor (Duplicada)

```python
class MapaCalorCorrelacaoView(APIView):
    def get(self, request):
        # MESMO CÓDIGO que CorrelacaoVariaveisView
        ...
```

**⚠️ Observação:**
- View duplicada! Retorna mesma coisa que `CorrelacaoVariaveisView`
- Provavelmente erro do seu amigo
- Deveria retornar dados formatados para mapa de calor

---

## 5. URLs

```python
from django.urls import path
from .views import (
    CorrelacaoVariaveisView,
    DispersaoColesterolPressaoView,
    MapaCalorCorrelacaoView,
)

urlpatterns = [
    path('correlacao-variaveis/', CorrelacaoVariaveisView.as_view(), name='correlacao-variaveis'),
    path('dispersao-colesterol-pressao/', DispersaoColesterolPressaoView.as_view(), name='dispersao-colesterol-pressao'),
    path('mapa-calor-correlacao/', MapaCalorCorrelacaoView.as_view(), name='mapa-calor-correlacao'),
]
```

### 5.1. Diferença: `.as_view()`

**Class-Based Views precisam de `.as_view()`:**

```python
path('correlacao/', CorrelacaoVariaveisView.as_view(), ...)
```

**Function-Based Views não:**

```python
path('rendimento/', analise_rendimento, ...)  # Sem parênteses
```

**Por quê?**
- `.as_view()` converte classe em função que Django pode chamar
- É um design pattern do Django

---

## 6. Como Usar a Heart API

### 6.1. Setup Inicial (Uma Vez)

```bash
# 1. Aplicar migrations (criar tabela)
cd backend
python manage.py makemigrations
python manage.py migrate

# 2. Carregar dados do CSV
python manage.py load_heart_data
```

**Output esperado:**
```
Loading data from: C:\...\dados\risco_cardiaco.csv
Data loaded successfully!
```

### 6.2. Verificar Dados no Banco

```bash
# Abrir shell Django
python manage.py shell
```

```python
# Dentro do shell
from heartAPI.models import RiscoCardiacoPaciente

# Ver todos os pacientes
pacientes = RiscoCardiacoPaciente.objects.all()
print(pacientes)  # <QuerySet [<RiscoCardiacoPaciente: Paciente 1>, ...]>

# Ver detalhes
for p in pacientes:
    print(f"Paciente {p.paciente_id}: idade={p.idade}, risco={p.risco}")
```

### 6.3. Testar Endpoints

```bash
# Iniciar servidor
python manage.py runserver
```

**URLs disponíveis:**
```
http://localhost:8000/api/saude/correlacao-variaveis/
http://localhost:8000/api/saude/dispersao-colesterol-pressao/
http://localhost:8000/api/saude/mapa-calor-correlacao/
```

---

## 7. Problemas e Melhorias Necessárias

### 7.1. ❌ Problemas Identificados

1. **View duplicada**: `MapaCalorCorrelacaoView` é cópia de `CorrelacaoVariaveisView`

2. **Falta pasta `services/`**: Lógica está nas views (misturado)

3. **Command usa `os.path`**: Deveria usar `pathlib.Path`

4. **Falta estatísticas**: Comparação risco alto vs baixo não existe

5. **Serializer não usado direito**: Em algumas views usa `.values()` direto

---

### 7.2. ✅ Sugestões de Melhoria

#### 7.2.1. Criar Services (como Energy API)

```python
# heartAPI/services/analise_saude.py
import pandas as pd
from ..models import RiscoCardiacoPaciente

def calcular_correlacao():
    """Calcula correlação entre variáveis de saúde"""
    pacientes = RiscoCardiacoPaciente.objects.all()
    data = list(pacientes.values('idade', 'colesterol', 'pressao', 'risco'))
    df = pd.DataFrame(data)
    
    correlacao = df.corr()
    
    return {
        'matriz_correlacao': correlacao.to_dict(),
        'insights': {
            'correlacao_idade_risco': float(correlacao.loc['idade', 'risco']),
            'correlacao_colesterol_risco': float(correlacao.loc['colesterol', 'risco']),
            'correlacao_pressao_risco': float(correlacao.loc['pressao', 'risco']),
        }
    }
```

**Views ficam limpas:**
```python
from .services.analise_saude import calcular_correlacao

class CorrelacaoVariaveisView(APIView):
    def get(self, request):
        try:
            dados = calcular_correlacao()  # Simples!
            return Response(dados)
        except Exception as e:
            return Response({'erro': str(e)}, status=500)
```

---

#### 7.2.2. Adicionar Endpoint de Comparação

```python
def analise_por_risco():
    """Compara grupos de risco alto vs baixo"""
    risco_baixo = RiscoCardiacoPaciente.objects.filter(risco=0)
    risco_alto = RiscoCardiacoPaciente.objects.filter(risco=1)
    
    return {
        'risco_baixo': {
            'quantidade': risco_baixo.count(),
            'idade_media': risco_baixo.aggregate(Avg('idade'))['idade__avg'],
            'colesterol_medio': risco_baixo.aggregate(Avg('colesterol'))['colesterol__avg'],
            'pressao_media': risco_baixo.aggregate(Avg('pressao'))['pressao__avg'],
        },
        'risco_alto': {
            # ... mesmo para risco alto
        }
    }
```

---

## 8. Conceitos Importantes

### 8.1. ORM (Object-Relational Mapping)

**Django ORM** traduz Python → SQL automaticamente.

**Python (ORM):**
```python
pacientes = RiscoCardiacoPaciente.objects.filter(idade__gt=40)
```

**SQL equivalente:**
```sql
SELECT * FROM heartAPI_riscocardiacopaciente WHERE idade > 40;
```

**Vantagens:**
- Não escrever SQL manualmente
- Mudanças de banco (SQLite → PostgreSQL) sem alterar código
- Proteção contra SQL Injection

---

### 8.2. QuerySets são Lazy

```python
# Não executa SQL ainda!
pacientes = RiscoCardiacoPaciente.objects.all()

# SQL executado aqui:
for p in pacientes:  # Iteração
    print(p)

# Ou aqui:
count = pacientes.count()  # Método agregado

# Ou aqui:
lista = list(pacientes)  # Conversão para lista
```

**Por quê?**
- Permite otimizações (combinar filtros)
- Só busca do banco quando realmente necessário

---

### 8.3. Migrations

**Migration** = Histórico de mudanças no banco.

**Exemplo de mudanças:**
```python
# models.py (antes)
class Paciente(models.Model):
    idade = models.IntegerField()

# models.py (depois) - Adicionar campo
class Paciente(models.Model):
    idade = models.IntegerField()
    peso = models.FloatField()  # NOVO
```

**Comandos:**
```bash
python manage.py makemigrations  # Cria migration
python manage.py migrate         # Aplica no banco
```

**Django cria SQL:**
```sql
ALTER TABLE pacientes ADD COLUMN peso FLOAT;
```

---

## 9. Comparação Final: Energy API vs Heart API

| Aspecto | Energy API | Heart API |
|---------|------------|-----------|
| **Fonte de Dados** | CSV direto | Banco de dados |
| **Persistência** | ❌ Não persiste | ✅ Persiste |
| **Velocidade** | Mais lenta (lê CSV) | Mais rápida (query DB) |
| **Complexidade** | Simples | Média (Models, Migrations) |
| **Escalabilidade** | Ruim (muitos dados) | Boa |
| **Setup** | Imediato | Requer migrations + command |
| **Views** | Function-based | Class-based |
| **Services** | ✅ Separado | ❌ Lógica nas views |

---

## 10. Quando Usar Cada Abordagem?

### Use **Energy API** (CSV direto) quando:
- ✅ Dados não mudam frequentemente
- ✅ Poucos registros (< 1000)
- ✅ Análises pontuais
- ✅ Projeto simples/protótipo

### Use **Heart API** (Banco de dados) quando:
- ✅ Dados atualizados por usuários
- ✅ Muitos registros (> 1000)
- ✅ Necessita CRUD (Create, Read, Update, Delete)
- ✅ Múltiplas queries complexas
- ✅ Produção

---

## 🎯 Conclusão

A **Heart API do seu amigo** funciona, mas:

**✅ Pontos Positivos:**
- Usa banco de dados (escalável)
- Management command para carregar dados
- Serializers corretos

**❌ Pontos Negativos:**
- Lógica misturada nas views (sem services)
- Views duplicadas
- Falta endpoints importantes (comparação risco)
- Usa `os.path` (antigo)

**💡 Recomendação:**
- Refatore para adicionar pasta `services/`
- Separe lógica de negócio das views
- Adicione mais endpoints úteis
- Use a estrutura da Energy API como referência

**Ambas as abordagens são válidas, mas para seu caso (aprendizado + projeto acadêmico), a Energy API (CSV direto) é mais simples e eficaz!** 🚀
