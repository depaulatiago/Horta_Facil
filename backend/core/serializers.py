from rest_framework import serializers
# Certifique-se de que seus modelos estão sendo importados corretamente
from .models import Horta, Hortaliça, Cultivo, Colheita, Relatorio

# 1. Serializer para Horta
class HortaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Horta
        # Incluir o campo 'responsavel' para vincular ao usuário logado
        fields = ['id', 'nome', 'responsavel', 'localizacao', 'area_total', 'consumo_agua_estimado']
        read_only_fields = ('responsavel',) # Gerenciado pelo backend

# 2. Serializer para Hortaliça
class HortalicaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hortaliça
        # Exponha todos os campos técnicos necessários para os cálculos
        fields = '__all__'

# 3. Serializer para Cultivo (A nova "Produção")
class CultivoSerializer(serializers.ModelSerializer):
    # Campos calculados como read_only para o frontend
    area_total_hortaliça = serializers.ReadOnlyField() 
    
    class Meta:
        model = Cultivo
        # Inclua a 'area_total_hortaliça' que é calculada no save()
        fields = ['id', 'horta', 'hortaliça', 'data_inicio', 
                  'producao_semanal_desejada', 'num_modulos', 'area_total_hortaliça']

# 4. Serializer para Colheita
class ColheitaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Colheita
        fields = '__all__'
        
# 5. Serializer para Relatorio (Mantido para a contagem de 5 entidades)
class RelatorioSerializer(serializers.ModelSerializer):
    # A eficiência é calculada no modelo, então é read_only na API
    eficiencia = serializers.ReadOnlyField()
    
    class Meta:
        model = Relatorio
        fields = ['id', 'horta', 'data', 'total_produzido_planejado', 
                  'total_colhido_real', 'eficiencia']
        read_only_fields = ('data',)