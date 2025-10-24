from django.db import models
from django.contrib.auth.models import User

class Horta(models.Model):
    nome = models.CharField(max_length=100)
    descricao = models.TextField(blank=True, null=True)
    responsavel = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.nome


class Hortaliça(models.Model):
    TIPO_PLANTIO = [
        ("mudas", "Mudas"),
        ("direta", "Semeadura Direta"),
    ]

    nome = models.CharField(max_length=100)
    tipo_plantio = models.CharField(max_length=20, choices=TIPO_PLANTIO)
    ciclo_colheita = models.IntegerField(help_text="Semanas de colheita")
    ciclo_limpeza = models.IntegerField(help_text="Semanas para limpeza/preparo")
    espacamento_linhas = models.FloatField(help_text="Espaçamento entre linhas (m)")
    espacamento_plantas = models.FloatField(help_text="Espaçamento entre plantas (m)")
    plantas_por_modulo = models.FloatField()
    area_modulo = models.FloatField(help_text="Área de cada módulo (m²)")
    periodicidade = models.IntegerField(help_text="Intervalo entre plantios (semanas)")
    num_modulos = models.IntegerField()

    def __str__(self):
        return self.nome


class Producao(models.Model):
    horta = models.ForeignKey(Horta, on_delete=models.CASCADE)
    hortaliça = models.ForeignKey(Hortaliça, on_delete=models.CASCADE)
    producao_semanal = models.FloatField()
    unidade = models.CharField(max_length=20, help_text="Ex: kg, cabeças, unidades")

    def __str__(self):
        return f"{self.hortaliça.nome} - {self.producao_semanal}/{self.unidade}"


class Colheita(models.Model):
    producao = models.ForeignKey(Producao, on_delete=models.CASCADE)
    data = models.DateField()
    quantidade = models.FloatField()

    def __str__(self):
        return f"{self.producao.hortaliça.nome} em {self.data} - {self.quantidade}"

class Relatorio(models.Model):
    horta = models.ForeignKey(Horta, on_delete=models.CASCADE)

    data = models.DateField(auto_now_add=True)

    total_produzido = models.FloatField(help_text="Total produzido planejado (kg)")
    total_colhido = models.FloatField(help_text="Total colhido real (kg)")
    consumo_agua = models.FloatField(help_text="Consumo de água (m³)")

    eficiencia = models.FloatField(help_text="Eficiência de produção (%)", null=True, blank=True)

    def save(self, *args, **kwargs):
        if self.total_produzido and self.total_produzido > 0:
            self.eficiencia = (self.total_colhido / self.total_produzido) * 100
        else:
            self.eficiencia = 0.0

        super(Relatorio, self).save(*args, **kwargs)

    def __str__(self):
        return f"Relatório {self.horta.nome} - {self.data}"