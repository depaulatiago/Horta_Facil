from django.contrib import admin
from .models import Horta, Hortalica, Cultivo, Colheita, Relatorio

@admin.register(Horta)
class HortaAdmin(admin.ModelAdmin):
    list_display = ("id", "nome", "responsavel", "localizacao") 
    search_fields = ("nome", "responsavel__username")
    list_filter = ("responsavel",)

@admin.register(Hortalica)
class HortalicaAdmin(admin.ModelAdmin):
    list_display = ("id", "nome", "tipo_plantio", "ciclo_colheita", "ciclo_desenvolvimento")
    search_fields = ("nome",)
    list_filter = ("tipo_plantio",)

@admin.register(Cultivo)
class CultivoAdmin(admin.ModelAdmin):
    list_display = ("id", "horta", "hortalica", "producao_semanal_desejada", "num_modulos")
    search_fields = ("horta__nome", "hortalica__nome")
    list_filter = ("horta", "hortalica")

@admin.register(Colheita)
class ColheitaAdmin(admin.ModelAdmin):
    list_display = ("id", "cultivo", "data", "quantidade_colhida")
    search_fields = ("cultivo__hortalica__nome", "cultivo__horta__nome")
    list_filter = ("data", "cultivo__hortalica")

@admin.register(Relatorio)
class RelatorioAdmin(admin.ModelAdmin):
    list_display = ("id", "horta", "data", "total_produzido_planejado", "total_colhido_real", "eficiencia")
    readonly_fields = ("eficiencia", "data")
    search_fields = ("horta__nome",)
    list_filter = ("data", "horta")