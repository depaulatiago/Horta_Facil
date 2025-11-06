from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from core import views as core_views

router = routers.DefaultRouter()
router.register(r'hortas', core_views.HortaViewSet, basename='horta')
router.register(r'hortalicas', core_views.HortalicaViewSet, basename='hortalica')
router.register(r'cultivos', core_views.CultivoViewSet, basename='cultivo')
router.register(r'colheitas', core_views.ColheitaViewSet, basename='colheita')
router.register(r'relatorios', core_views.RelatorioViewSet, basename='relatorio')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework'))
]