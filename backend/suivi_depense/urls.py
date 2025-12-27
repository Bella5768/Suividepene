"""
URL configuration for suivi_depense project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from depenses.views_frontend import index, get_token

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('depenses.urls_auth')),
    path('api/auth/token-django/', get_token, name='django-token'),
    path('api/', include('depenses.urls')),
    path('', index, name='index'),
    path('login/', index, name='login'),
    path('dashboard/', index, name='dashboard'),
    path('operations/', index, name='operations'),
    path('previsions/', index, name='previsions'),
    path('imputations/', index, name='imputations'),
    path('rapports/', index, name='rapports'),
    path('categories/', index, name='categories'),
    path('utilisateurs/', index, name='utilisateurs'),
    path('audit/', index, name='audit'),
    path('restauration/', index, name='restauration'),
    path('commander/<str:token>/', index, name='commander-public'),
    path('commander/', index, name='commander-aujourdhui'),  # Lien fixe pour le menu du jour
    path('tableau-bord-cantine/', index, name='tableau-bord-cantine'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)


