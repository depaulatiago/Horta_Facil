from django.contrib import admin
from .models import Horta, Hortaliça, Producao, Colheita, Relatorio


@admin.register(Horta)
class HortaAdmin(admin.ModelAdmin):
    list_display = ("id", "nome", "responsavel")
    search_fields = ("nome", "responsavel__username")
    list_filter = ("responsavel",)


@admin.register(Hortaliça)
class HortaliçaAdmin(admin.ModelAdmin):
    list_display = ("id", "nome", "tipo_plantio", "ciclo_colheita", "num_modulos")
    search_fields = ("nome",)
    list_filter = ("tipo_plantio",)


@admin.register(Producao)
class ProducaoAdmin(admin.ModelAdmin):
    list_display = ("id", "horta", "hortaliça", "producao_semanal", "unidade")
    search_fields = ("horta__nome", "hortaliça__nome")
    list_filter = ("horta", "hortaliça")


@admin.register(Colheita)
class ColheitaAdmin(admin.ModelAdmin):
    list_display = ("id", "producao", "data", "quantidade")
    search_fields = ("producao__hortaliça__nome", "producao__horta__nome")
    list_filter = ("data", "producao__hortaliça")

@admin.register(Relatorio)
class RelatorioAdmin(admin.ModelAdmin):
    list_display = ("id", "horta", "data", "total_produzido", "total_colhido", "eficiencia")
    readonly_fields = ("eficiencia", "data")
    search_fields = ("horta__nome",)
    list_filter = ("data", "horta")