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
from datetime import timedelta, datetime
import math
from django.http import HttpResponse

class HortaViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing Hortas.
    """
    queryset = Horta.objects.all()
    serializer_class = HortaSerializer

    def perform_create(self, serializer):
        """ Associates the logged-in user (if any) as the responsible party. """
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
            
            if desejada_str is None: 
                return Response(
                    {"error": "Parameter 'desejada' (desired production) is required."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            desejada = float(desejada_str)
            if desejada <= 0:
                 return Response(
                    {"error": "Parameter 'desejada' must be greater than 0."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            produtividade_esperada = hortalica.produtividade_esperada
            area_modulo = hortalica.area_modulo

            if produtividade_esperada <= 0:
                return Response(
                    {"error": "Hortalica's 'produtividade_esperada' must be greater than zero."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            num_modulos_calculado = math.ceil(desejada / produtividade_esperada)
            area_total_calculada = num_modulos_calculado * area_modulo

            return Response({
                "num_modulos_calculado": num_modulos_calculado,
                "area_total_calculada": area_total_calculada
            })
        
        except ValueError:
             return Response(
                    {"error": "Parameter 'desejada' must be a valid number."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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

    @action(detail=False, methods=['get'], url_path='calendario-consolidado')
    def calendario_consolidado(self, request):
        """
        Retorna o calendário consolidado de TODOS os cultivos
        Exemplo: /api/cultivos/calendario-consolidado/
        """
        # Filtrar todos os cultivos
        cultivos = Cultivo.objects.all()
        
        atividades_consolidadas = []
        
        for cultivo in cultivos:
            hortalica = cultivo.hortalica
            horta = cultivo.horta
            data_inicio = cultivo.data_inicio
            num_modulos = cultivo.num_modulos
            periodicidade_plantio = hortalica.periodicidade
            ciclo_dev = hortalica.ciclo_desenvolvimento
            ciclo_col = hortalica.ciclo_colheita
            ciclo_limp = hortalica.ciclo_limpeza
            
            for i in range(num_modulos):
                inicio_plantio_modulo = data_inicio + timedelta(weeks=(i * periodicidade_plantio))
                inicio_colheita = inicio_plantio_modulo + timedelta(weeks=ciclo_dev)
                fim_colheita = inicio_colheita + timedelta(weeks=ciclo_col)
                inicio_limpeza = fim_colheita
                fim_limpeza = inicio_limpeza + timedelta(weeks=ciclo_limp)
                
                atividades_consolidadas.append({
                    "horta_id": horta.id,
                    "horta_nome": horta.nome,
                    "hortalica_id": hortalica.id,
                    "hortalica_nome": hortalica.nome,
                    "cultivo_id": cultivo.id,
                    "modulo": i + 1,
                    "data_plantio": inicio_plantio_modulo.isoformat(),
                    "data_inicio_colheita": inicio_colheita.isoformat(),
                    "data_fim_colheita": fim_colheita.isoformat(),
                    "data_inicio_limpeza": inicio_limpeza.isoformat(),
                    "data_proximo_plantio_disponivel": fim_limpeza.isoformat(),
                })
        
        # Ordenar por data
        atividades_consolidadas.sort(key=lambda x: x['data_plantio'])
        return Response(atividades_consolidadas)
    
    @action(detail=False, methods=['get'], url_path='gerar-pdf-semanal')
    def gerar_pdf_semanal(self, request):
        """
        Gera um PDF com todas as tarefas da semana atual
        """
        # Importar aqui (lazy import) para evitar erro se reportlab não estiver instalado
        from reportlab.lib.pagesizes import A4
        from reportlab.lib import colors
        from reportlab.lib.units import inch
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
        from reportlab.lib.styles import getSampleStyleSheet
        
        # Pegar data inicial da semana (segunda-feira)
        hoje = datetime.now().date()
        inicio_semana = hoje - timedelta(days=hoje.weekday())
        fim_semana = inicio_semana + timedelta(days=6)
        
        # Buscar todos os cultivos
        cultivos = Cultivo.objects.all()
        tarefas = []
        
        for cultivo in cultivos:
            hortalica = cultivo.hortalica
            horta = cultivo.horta
            data_inicio = cultivo.data_inicio
            num_modulos = cultivo.num_modulos
            periodicidade_plantio = hortalica.periodicidade
            ciclo_dev = hortalica.ciclo_desenvolvimento
            ciclo_col = hortalica.ciclo_colheita
            
            for i in range(num_modulos):
                # Calcular datas do módulo
                data_plantio = data_inicio + timedelta(weeks=(i * periodicidade_plantio))
                data_inicio_colheita = data_plantio + timedelta(weeks=ciclo_dev)
                data_fim_colheita = data_inicio_colheita + timedelta(weeks=ciclo_col)
                
                # Verificar se plantio está na semana
                if inicio_semana <= data_plantio <= fim_semana:
                    tarefas.append({
                        'data': data_plantio,
                        'tipo': 'Plantio',
                        'hortalica': hortalica.nome,
                        'horta': horta.nome,
                        'modulo': i + 1
                    })
                
                # Verificar se início de colheita está na semana
                if inicio_semana <= data_inicio_colheita <= fim_semana:
                    tarefas.append({
                        'data': data_inicio_colheita,
                        'tipo': 'Início Colheita',
                        'hortalica': hortalica.nome,
                        'horta': horta.nome,
                        'modulo': i + 1
                    })
                
                # Verificar se fim de colheita está na semana
                if inicio_semana <= data_fim_colheita <= fim_semana:
                    tarefas.append({
                        'data': data_fim_colheita,
                        'tipo': 'Fim Colheita',
                        'hortalica': hortalica.nome,
                        'horta': horta.nome,
                        'modulo': i + 1
                    })
        
        # Ordenar por data
        tarefas.sort(key=lambda x: x['data'])
        
        # Criar PDF
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="cronograma_semana_{inicio_semana}.pdf"'
        
        doc = SimpleDocTemplate(response, pagesize=A4, topMargin=0.5*inch)
        elementos = []
        styles = getSampleStyleSheet()
        
        # Título
        titulo_texto = f"<b>Cronograma Semanal</b><br/>{inicio_semana.strftime('%d/%m/%Y')} a {fim_semana.strftime('%d/%m/%Y')}"
        titulo = Paragraph(titulo_texto, styles['Title'])
        elementos.append(titulo)
        elementos.append(Spacer(1, 0.3*inch))
        
        # Tabela de tarefas
        if tarefas:
            dados = [['Data', 'Tipo', 'Hortaliça', 'Horta', 'Módulo']]
            for tarefa in tarefas:
                dados.append([
                    tarefa['data'].strftime('%d/%m/%Y'),
                    tarefa['tipo'],
                    tarefa['hortalica'],
                    tarefa['horta'],
                    str(tarefa['modulo'])
                ])
            
            tabela = Table(dados, colWidths=[1.2*inch, 1.5*inch, 2*inch, 2*inch, 1*inch])
            tabela.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#27AE60')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 11),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('TOPPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#F0F9F7')),
                ('GRID', (0, 0), (-1, -1), 1, colors.grey),
                ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 1), (-1, -1), 9),
                ('TOPPADDING', (0, 1), (-1, -1), 8),
                ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
            ]))
            elementos.append(tabela)
        else:
            sem_tarefas = Paragraph("Nenhuma tarefa programada para esta semana.", styles['Normal'])
            elementos.append(sem_tarefas)
        
        # Rodapé
        elementos.append(Spacer(1, 0.5*inch))
        rodape = Paragraph(f"<i>Gerado em {datetime.now().strftime('%d/%m/%Y às %H:%M')}</i>", styles['Normal'])
        elementos.append(rodape)
        
        doc.build(elementos)
        return response

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