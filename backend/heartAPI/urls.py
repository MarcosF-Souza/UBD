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
