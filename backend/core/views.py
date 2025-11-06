from rest_framework import viewsets, status
from .models import Horta, Hortalica, Cultivo, Colheita, Relatorio
from .serializers import (
    HortaSerializer, 
    HortalicaSerializer, 
    CultivoSerializer, 
    ColheitaSerializer, 
    RelatorioSerializer
)
from rest_framework.decorators import action
from rest_framework.response import Response
from datetime import timedelta
import math

class HortaViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing Hortas.
    """
    queryset = Horta.objects.all()
    serializer_class = HortaSerializer

    def perform_create(self, serializer):
        """ Associa o usuario logado (se houver) ao criar uma Horta. """
        if self.request.user.is_authenticated:
            serializer.save(responsavel=self.request.user)
        else:
            serializer.save(responsavel=None)
            
class HortalicaViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing Hortalicas (vegetable templates).
    """
    queryset = Hortalica.objects.all()
    serializer_class = HortalicaSerializer

    @action(detail=True, methods=['get'], url_path='calcular-dimensionamento')
    def calcular_dimensionamento(self, request, pk=None):
        """
        Calculates the number of modules and total area
        based on a desired weekly production.
        
        Example URL: /api/hortalicas/1/calcular-dimensionamento/?desejada=100
        """
        try:
            hortalica = self.get_object()
            
            desejada_str = request.query_params.get('desejada', None)
            
            if desejava_str is None:
                return Response(
                    {"erro": "Parametro 'desejada' (producao desejada) e obrigatorio."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            desejada = float(desejada_str)
            
            produtividade_esperada = hortalica.produtividade_esperada
            area_modulo = hortalica.area_modulo

            if produtividade_esperada <= 0:
                return Response(
                    {"erro": "Produtividade esperada da hortalica deve ser maior que zero."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            num_modulos_calculado = math.ceil(desejada / produtividade_esperada)
            area_total_calculada = num_modulos_calculado * area_modulo

            return Response({
                "num_modulos_calculado": num_modulos_calculado,
                "area_total_calculada": area_total_calculada
            })
        except Exception as e:
            return Response({"erro": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CultivoViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing Cultivos (active cultivations).
    """
    queryset = Cultivo.objects.all()
    serializer_class = CultivoSerializer

    @action(detail=True, methods=['get'], url_path='calendario')
    def calendario(self, request, pk=None):
        """
        Generates the activity schedule (planting, harvest, cleanup)
        for each module of a cultivation.
        
        Example URL: /api/cultivos/1/calendario/
        """
        cultivo = self.get_object()
        hortalica = cultivo.hortalica
        
        data_inicio = cultivo.data_inicio
        num_modulos = cultivo.num_modulos
        periodicidade_plantio = hortalica.periodicidade
        ciclo_dev = hortalica.ciclo_desenvolvimento
        ciclo_col = hortalica.ciclo_colheita
        ciclo_limp = hortalica.ciclo_limpeza

        atividades = []

        for i in range(num_modulos):
            inicio_plantio_modulo = data_inicio + timedelta(weeks=(i * periodicidade_plantio))
            
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

        return Response(atividades)

class ColheitaViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing Colheitas (harvest logs).
    """
    queryset = Colheita.objects.all()
    serializer_class = ColheitaSerializer

class RelatorioViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing Relatorios (efficiency reports).
    """
    queryset = Relatorio.objects.all()
    serializer_class = RelatorioSerializer