from django.db import models
from django.contrib.auth.models import User

class Horta(models.Model):
    """
    Represents a physical garden/plot (Horta).
    """
    nome = models.CharField(max_length=100)
    responsavel = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL,
        null=True, 
        blank=True
    )
    localizacao = models.CharField(max_length=150, blank=True, null=True)
    area_total = models.FloatField(help_text="Area total da horta em m2", null=True, blank=True)
    consumo_agua_estimado = models.FloatField(help_text="Consumo estimado de agua (m3/mes)", null=True, blank=True)

    def __str__(self):
        return self.nome

class Hortalica(models.Model):
    """
    Template for a vegetable (Hortalica), defining its technical parameters.
    """
    TIPO_PLANTIO = [
        ("mudas", "Mudas"),
        ("direta", "Semeadura Direta"),
    ]
    nome = models.CharField(max_length=100)
    tipo_plantio = models.CharField(max_length=20, choices=TIPO_PLANTIO)
    ciclo_desenvolvimento = models.IntegerField(help_text="Semanas de desenvolvimento", default=0) 
    ciclo_colheita = models.IntegerField(help_text="Semanas de colheita")
    ciclo_limpeza = models.IntegerField(help_text="Semanas para limpeza/preparo")
    espacamento_linhas = models.FloatField(help_text="Espacamento entre linhas (m)")
    espacamento_plantas = models.FloatField(help_text="Espacamento entre plantas (m)")
    produtividade_esperada = models.FloatField(help_text="Produtividade esperada por modulo (kg ou unidades)", default=0)
    area_modulo = models.FloatField(help_text="Area de cada modulo (m2)")
    periodicidade = models.IntegerField(help_text="Intervalo entre plantios (semanas)")

    def __str__(self):
        return self.nome

class Cultivo(models.Model):
    """
    Links a Horta to a Hortalica. This is an active cultivation.
    """
    horta = models.ForeignKey(Horta, on_delete=models.CASCADE)
    hortalica = models.ForeignKey(Hortalica, on_delete=models.CASCADE)
    data_inicio = models.DateField()
    producao_semanal_desejada = models.FloatField(help_text="Producao semanal desejada (kg ou unidades)")
    num_modulos = models.IntegerField(help_text="Numero de modulos de cultivo")
    area_total_hortalica = models.FloatField(help_text="Area total ocupada por esta hortalica (m2)", null=True, blank=True)

    def save(self, *args, **kwargs):
        """
        Auto-calculates total area on save.
        """
        if not self.area_total_hortalica:
            self.area_total_hortalica = self.num_modulos * self.hortalica.area_modulo
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.hortalica.nome} ({self.horta.nome})"

class Colheita(models.Model):
    """
    Log entry for a specific harvest event (Colheita).
    """
    cultivo = models.ForeignKey(Cultivo, on_delete=models.CASCADE, null=True) 
    data = models.DateField()
    quantidade_colhida = models.FloatField(help_text="Quantidade colhida (kg ou unidades)", default=0) 

    def __str__(self):
        if self.cultivo:
            return f"{self.cultivo.hortalica.nome} - {self.data}"
        return f"Colheita em {self.data}"

class Relatorio(models.Model):
    """
    Consolidated report (Relatorio) for a Horta's efficiency.
    """
    horta = models.ForeignKey(Horta, on_delete=models.CASCADE)
    data = models.DateField(auto_now_add=True)
    total_produzido_planejado = models.FloatField(help_text="Producao total planejada (kg ou unidades)")
    total_colhido_real = models.FloatField(help_text="Producao total colhida (kg ou unidades)", default=0)
    eficiencia = models.FloatField(help_text="Eficiencia de producao (%)", null=True, blank=True)

    def save(self, *args, **kwargs):
        """
        Auto-calculates efficiency on save.
        """
        if self.total_produzido_planejado and self.total_produzido_planejado > 0:
            self.eficiencia = (self.total_colhido_real / self.total_produzido_planejado) * 100
        else:
            self.eficiencia = 0
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Relatorio {self.horta.nome} - {self.data}"