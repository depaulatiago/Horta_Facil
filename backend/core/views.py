from rest_framework import viewsets
from .models import Horta, Hortaliça, Cultivo, Colheita, Relatorio
from .serializers import (
    HortaSerializer, 
    HortalicaSerializer, 
    CultivoSerializer, 
    ColheitaSerializer, 
    RelatorioSerializer
)

# Imports ADICIONADOS para a Lógica de Negócios
from rest_framework.decorators import action
from rest_framework.response import Response
from datetime import timedelta
import math

# --- ViewSet 1: Horta ---
class HortaViewSet(viewsets.ModelViewSet):
    queryset = Horta.objects.all()
    serializer_class = HortaSerializer

    def perform_create(self, serializer):
        serializer.save(responsavel=self.request.user)

# --- ViewSet 2: Hortaliça (COM AÇÃO NOVA) ---
class HortalicaViewSet(viewsets.ModelViewSet):
    queryset = Hortaliça.objects.all()
    serializer_class = HortalicaSerializer

    # AÇÃO DE DIMENSIONAMENTO (Fase 3)
    @action(detail=True, methods=['get'], url_path='calcular-dimensionamento')
    def calcular_dimensionamento(self, request, pk=None):
        """
        Calcula o número de módulos e a área total
        baseado na produção semanal desejada.
        
        Exemplo de URL: /api/hortalicas/1/calcular-dimensionamento/?desejada=100
        """
        try:
            hortalica = self.get_object() # Pega a hortaliça (ex: Alface)
            
            # Pega o parâmetro 'desejada' da URL
            desejada_str = request.query_params.get('desejada', None)
            
            if desejada_str is None:
                return Response({"erro": "Parâmetro 'desejada' (produção desejada) é obrigatório."}, status=400)

            desejada = float(desejada_str)
            
            # Pega os dados técnicos do modelo
            produtividade_esperada = hortalica.produtividade_esperada
            area_modulo = hortalica.area_modulo

            # LÓGICA DE CÁLCULO (Exemplo simples)
            if produtividade_esperada <= 0:
                return Response({"erro": "Produtividade esperada da hortaliça deve ser maior que zero."}, status=400)
                
            num_modulos_calculado = math.ceil(desejada / produtividade_esperada)
            area_total_calculada = num_modulos_calculado * area_modulo

            # Retorna o JSON para o Flutter
            return Response({
                "num_modulos_calculado": num_modulos_calculado,
                "area_total_calculada": area_total_calculada
            })

        except Exception as e:
            return Response({"erro": str(e)}, status=500)


# --- ViewSet 3: Cultivo (COM AÇÃO NOVA) ---
class CultivoViewSet(viewsets.ModelViewSet):
    queryset = Cultivo.objects.all()
    serializer_class = CultivoSerializer

    # AÇÃO DE CALENDÁRIO (Fase 3)
    @action(detail=True, methods=['get'], url_path='calendario')
    def calendario(self, request, pk=None):
        """
        Gera o cronograma de atividades (plantio, colheita, limpeza)
        para cada módulo de um cultivo.
        
        Exemplo de URL: /api/cultivos/1/calendario/
        """
        cultivo = self.get_object() # Pega o cultivo (ex: Alface na Horta 1)
        hortalica = cultivo.hortaliça
        
        # Pega os dados de ciclo do modelo Hortaliça
        data_inicio = cultivo.data_inicio
        num_modulos = cultivo.num_modulos
        periodicidade_plantio = hortalica.periodicidade
        ciclo_dev = hortalica.ciclo_desenvolvimento
        ciclo_col = hortalica.ciclo_colheita
        ciclo_limp = hortalica.ciclo_limpeza

        atividades = []

        # LÓGICA DE CÁLCULO DO CALENDÁRIO
        # Itera por cada módulo definido no Cultivo
        for i in range(num_modulos):
            # Calcula o início do plantio para este módulo
            inicio_plantio_modulo = data_inicio + timedelta(weeks=(i * periodicidade_plantio))
            
            # Calcula as datas das atividades
            inicio_colheita = inicio_plantio_modulo + timedelta(weeks=ciclo_dev)
            fim_colheita = inicio_colheita + timedelta(weeks=ciclo_col)
            inicio_limpeza = fim_colheita
            fim_limpeza = inicio_limpeza + timedelta(weeks=ciclo_limp)

            atividades.append({
                "modulo": i + 1,
                "data_plantio": inicio_plantio_modulo,
                "data_inicio_colheita": inicio_colheita,
                "data_fim_colheita": fim_colheita,
                "data_proximo_plantio_disponivel": fim_limpeza,
            })

        # Retorna o JSON (lista de atividades) para o Flutter
        return Response(atividades)

# --- ViewSet 4: Colheita ---
class ColheitaViewSet(viewsets.ModelViewSet):
    queryset = Colheita.objects.all()
    serializer_class = ColheitaSerializer

# --- ViewSet 5: Relatorio ---
class RelatorioViewSet(viewsets.ModelViewSet):
    queryset = Relatorio.objects.all()
    serializer_class = RelatorioSerializer