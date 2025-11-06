from django.contrib import admin
# 1. CORREÇÃO: Importar 'Cultivo' (não 'Producao')
from .models import Horta, Hortaliça, Cultivo, Colheita, Relatorio

@admin.register(Horta)
class HortaAdmin(admin.ModelAdmin):
    # CORREÇÃO: Usando 'localizacao' do seu models.py
    list_display = ("id", "nome", "responsavel", "localizacao") 
    search_fields = ("nome", "responsavel__username")
    list_filter = ("responsavel",)

@admin.register(Hortaliça)
class HortaliçaAdmin(admin.ModelAdmin):
    # CORREÇÃO: Usando campos do seu models.py
    list_display = ("id", "nome", "tipo_plantio", "ciclo_colheita", "ciclo_desenvolvimento")
    search_fields = ("nome",)
    list_filter = ("tipo_plantio",)

# 2. CORREÇÃO: Classe renomeada para 'CultivoAdmin'
@admin.register(Cultivo)
class CultivoAdmin(admin.ModelAdmin):
    # 3. CORREÇÃO: Usando campos do models.py 'Cultivo'
    list_display = ("id", "horta", "hortaliça", "producao_semanal_desejada", "num_modulos")
    search_fields = ("horta__nome", "hortaliça__nome")
    list_filter = ("horta", "hortaliça")

@admin.register(Colheita)
class ColheitaAdmin(admin.ModelAdmin):
    # 4. CORREÇÃO: Usando campos do models.py 'Colheita'
    list_display = ("id", "cultivo", "data", "quantidade_colhida")
    search_fields = ("cultivo__hortaliça__nome", "cultivo__horta__nome")
    list_filter = ("data", "cultivo__hortaliça")

@admin.register(Relatorio)
class RelatorioAdmin(admin.ModelAdmin):
    # 5. CORREÇÃO: Usando campos do models.py 'Relatorio'
    list_display = ("id", "horta", "data", "total_produzido_planejado", "total_colhido_real", "eficiencia")
    readonly_fields = ("eficiencia", "data")
    search_fields = ("horta__nome",)
    list_filter = ("data", "horta")