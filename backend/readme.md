# 📚 **README - Backend com Django para o Projeto Horta Fácil**

Este repositório contém o backend do projeto **Horta Fácil** desenvolvido com Django. O sistema gerencia o cadastro de **hortas**, **hortaliças**, **produções**, **colheitas** e **relatórios** para monitorar a produção agrícola.

---

## 🚀 **Como Rodar o Projeto**

### 1. **Instalar Dependências**

Sem usar `venv`, instale diretamente as dependências:

```bash
# Instalar Django e dependências
pip install django
pip install -r requirements.txt
```

---

### 2. **Rodar o Servidor do Django**

Dentro da pasta do projeto (onde está o arquivo `manage.py`), rode:

```bash
python3 manage.py runserver
```

Isso vai rodar o servidor localmente no endereço `http://127.0.0.1:8000/`.

---

### 3. **Configurar o Admin com Senha Padrão (`123`)**

1. **Criar o superusuário com senha `123`:**
   O superusuário será criado automaticamente com a senha padrão `123` para acesso ao Django Admin, sem a necessidade de usar `createsuperuser`.

   No terminal, execute o comando abaixo para rodar as migrações e garantir que tudo seja configurado corretamente:

   ```bash
   python3 manage.py migrate
   ```

2. **Acessar o Admin do Django:**

   Com o servidor rodando, vá até o navegador e acesse:

   ```
   http://127.0.0.1:8000/admin
   ```

   * **Usuário:** admin
   * **Senha:** 123

   Você estará dentro do painel administrativo do Django, onde pode criar, editar e excluir hortas, hortaliças, produções, colheitas e relatórios.

---

## 🔧 **Como Usar o Sistema**

### 1. **Cadastrar e Gerenciar Dados**

Dentro do painel de administração, você pode:

* **Criar** e **editar** hortas, hortaliças, produções e colheitas.
* Os relatórios são **calculados automaticamente**, com base nas colheitas realizadas e nas produções planejadas.

#### Para Criar um Relatório:

1. Clique em **Relatórios** no painel administrativo.
2. Clique em **Add Relatório**.
3. Escolha a **Horta**, preencha os campos de **total produzido**, **total colhido** e **consumo de água**.
4. O campo **Eficiência** será calculado automaticamente.

---

## 📑 **Estrutura de Modelos**

### **Modelos principais no `models.py`**:

* **Horta**: Representa a área onde as hortaliças serão plantadas.
* **Hortaliça**: Representa o tipo de planta cultivada.
* **Produção**: Relaciona a **Horta** e a **Hortaliça**, especificando a quantidade planejada para produção.
* **Colheita**: Relaciona a **Produção**, registrando a quantidade de produto colhido.
* **Relatório**: Gera um relatório sobre o desempenho da horta, comparando a produção planejada com a colheita real.

---

### **Exemplo de Modelos**

```python
# Horta
class Horta(models.Model):
    nome = models.CharField(max_length=100)
    descricao = models.TextField(blank=True, null=True)
    responsavel = models.ForeignKey(User, on_delete=models.CASCADE)
    
    def __str__(self):
        return self.nome


# Hortaliça
class Hortaliça(models.Model):
    nome = models.CharField(max_length=100)
    tipo_plantio = models.CharField(max_length=20, choices=[("mudas", "Mudas"), ("direta", "Semeadura Direta")])
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


# Relatório
class Relatorio(models.Model):
    horta = models.ForeignKey(Horta, on_delete=models.CASCADE)
    data = models.DateField(auto_now_add=True)
    total_produzido = models.FloatField(help_text="Total produzido planejado (kg)")
    total_colhido = models.FloatField(help_text="Total colhido real (kg)")
    consumo_agua = models.FloatField(help_text="Consumo de água (m³)")
    eficiencia = models.FloatField(help_text="Eficiência de produção (%)", null=True, blank=True)
    
    def save(self, *args, **kwargs):
        if self.total_produzido > 0:
            self.eficiencia = (self.total_colhido / self.total_produzido) * 100
        super(Relatorio, self).save(*args, **kwargs)

    def __str__(self):
        return f"Relatório {self.horta.nome} - {self.data}"
```

---

## 📦 **Dependências**

As dependências do projeto estão no arquivo `requirements.txt`:

```txt
django==3.2.8
```

Você pode instalar todas as dependências com o comando:

```bash
pip install -r requirements.txt
```

---

## 🛠 **Desenvolvimento Local**

### 1. **Rodar Migrações**

Sempre que você alterar os modelos ou adicionar novos campos, rode as migrações:

```bash
python3 manage.py makemigrations
python3 manage.py migrate
```

### 2. **População Inicial de Dados**

Use o comando abaixo para importar dados iniciais, como hortas, hortaliças e produções:

```bash
python3 manage.py loaddata core/fixtures/initial_data.json
```

---

## 🔧 **Testando o Backend via Terminal**

Você pode usar o shell interativo do Django para criar, atualizar e deletar dados diretamente no banco:

```bash
python3 manage.py shell
```

No shell, você pode interagir com os modelos diretamente:

```python
from core.models import Horta, Hortaliça, Producao, Colheita

# Criar uma horta
horta = Horta.objects.create(nome="Horta Escolar", descricao="Horta da escola")
# Criar uma hortaliça
hortalica = Hortaliça.objects.create(nome="Alface", tipo_plantio="mudas", ciclo_colheita=4, ciclo_limpeza=1, espacamento_linhas=0.3, espacamento_plantas=0.3, plantas_por_modulo=20, area_modulo=1.5, periodicidade=1, num_modulos=7)
# Criar uma produção
producao = Producao.objects.create(horta=horta, hortaliça=hortalica, producao_semanal=100, unidade="cabeças")
```

---

## 🚀 **Conclusão**

Com este backend, você consegue gerenciar todas as hortas, hortaliças, produções, colheitas e relatórios diretamente do Django Admin. A estrutura é flexível para futuras alterações e expansões, como a adição de novos modelos ou funcionalidades.

