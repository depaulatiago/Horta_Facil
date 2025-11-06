from django.contrib import admin
from django.urls import path, include  # <-- Importar 'include'
from rest_framework import routers     # <-- Importar 'routers'
from core import views as core_views   # <-- Importar as views do 'core'

# 1. Configura o Roteador do DRF
router = routers.DefaultRouter()
router.register(r'hortas', core_views.HortaViewSet, basename='horta')
router.register(r'hortalicas', core_views.HortalicaViewSet, basename='hortalica')
router.register(r'cultivos', core_views.CultivoViewSet, basename='cultivo')
router.register(r'colheitas', core_views.ColheitaViewSet, basename='colheita')
router.register(r'relatorios', core_views.RelatorioViewSet, basename='relatorio')

# 2. Define os padrões de URL
urlpatterns = [
    path('admin/', admin.site.urls), # URL do Admin (você já tinha)
    
    # Adiciona as URLs da API geradas pelo Roteador
    path('api/', include(router.urls)),
    
    # Adiciona URLs de login/logout para a interface do DRF (útil para testes)
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework'))
]