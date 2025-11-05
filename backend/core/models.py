from django.db import models
from django.contrib.auth.models import User

class Horta(models.Model):
    nome = models.CharField(max_length=100)
    responsavel = models.ForeignKey(User, on_delete=models.CASCADE)
    localizacao = models.CharField(max_length=150, blank=True, null=True)
    area_total = models.FloatField(help_text="Área total da horta em m²", null=True, blank=True)
    consumo_agua_estimado = models.FloatField(help_text="Consumo estimado de água (m³/mês)", null=True, blank=True)

    def _str_(self):
        return self.nome


class Hortaliça(models.Model):
    TIPO_PLANTIO = [
        ("mudas", "Mudas"),
        ("direta", "Semeadura Direta"),
    ]

    nome = models.CharField(max_length=100)
    tipo_plantio = models.CharField(max_length=20, choices=TIPO_PLANTIO)
    ciclo_desenvolvimento = models.IntegerField(help_text="Semanas de desenvolvimento")
    ciclo_colheita = models.IntegerField(help_text="Semanas de colheita")
    ciclo_limpeza = models.IntegerField(help_text="Semanas para limpeza/preparo")
    espacamento_linhas = models.FloatField(help_text="Espaçamento entre linhas (m)")
    espacamento_plantas = models.FloatField(help_text="Espaçamento entre plantas (m)")
    produtividade_esperada = models.FloatField(help_text="Produtividade esperada por módulo (kg ou unidades)")
    area_modulo = models.FloatField(help_text="Área de cada módulo (m²)")
    periodicidade = models.IntegerField(help_text="Intervalo entre plantios (semanas)")

    def _str_(self):
        return self.nome


class Cultivo(models.Model):
    """Relaciona uma hortaliça a uma horta específica"""
    horta = models.ForeignKey(Horta, on_delete=models.CASCADE)
    hortaliça = models.ForeignKey(Hortaliça, on_delete=models.CASCADE)
    data_inicio = models.DateField()
    producao_semanal_desejada = models.FloatField(help_text="Produção semanal desejada (kg ou unidades)")
    num_modulos = models.IntegerField(help_text="Número de módulos de cultivo")
    area_total_hortaliça = models.FloatField(help_text="Área total ocupada por essa hortaliça (m²)", null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.area_total_hortaliça:
            self.area_total_hortaliça = self.num_modulos * self.hortaliça.area_modulo
        super().save(*args, **kwargs)

    def _str_(self):
        return f"{self.hortaliça.nome} ({self.horta.nome})"


class Colheita(models.Model):
    cultivo = models.ForeignKey(Cultivo, on_delete=models.CASCADE)
    data = models.DateField()
    quantidade_colhida = models.FloatField(help_text="Quantidade colhida (kg ou unidades)")

    def _str_(self):
        return f"{self.cultivo.hortaliça.nome} - {self.data}"


class Relatorio(models.Model):
    horta = models.ForeignKey(Horta, on_delete=models.CASCADE)
    data = models.DateField(auto_now_add=True)
    total_produzido_planejado = models.FloatField(help_text="Produção total planejada (kg ou unidades)")
    total_colhido_real = models.FloatField(help_text="Produção total colhida (kg ou unidades)")
    eficiencia = models.FloatField(help_text="Eficiência de produção (%)", null=True, blank=True)

    def save(self, *args, **kwargs):
        if self.total_produzido_planejado > 0:
            self.eficiencia = (self.total_colhido_real / self.total_produzido_planejado) * 100
        else:
            self.eficiencia = 0
        super().save(*args, **kwargs)

    def _str_(self):
        return f"Relatório {self.horta.nome} - {self.data}"