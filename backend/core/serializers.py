from rest_framework import serializers
from .models import Horta, Hortalica, Cultivo, Colheita, Relatorio

class HortaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Horta
        fields = ['id', 'nome', 'responsavel', 'localizacao', 'area_total', 'consumo_agua_estimado']
        read_only_fields = ('responsavel',) 

class HortalicaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hortalica
        fields = '__all__'

class CultivoSerializer(serializers.ModelSerializer):
    area_total_hortalica = serializers.ReadOnlyField() 
    
    class Meta:
        model = Cultivo
        fields = ['id', 'horta', 'hortalica', 'data_inicio', 
                  'producao_semanal_desejada', 'num_modulos', 'area_total_hortalica']

class ColheitaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Colheita
        fields = '__all__'
        
class RelatorioSerializer(serializers.ModelSerializer):
    eficiencia = serializers.ReadOnlyField()
    
    class Meta:
        model = Relatorio
        fields = ['id', 'horta', 'data', 'total_produzido_planejado', 
                  'total_colhido_real', 'eficiencia']
        read_only_fields = ('data',)