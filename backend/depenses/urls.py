from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, CategorieViewSet, SousCategorieViewSet, PrevisionViewSet,
    OperationViewSet, ImputationViewSet, RapportViewSet,
    PlatViewSet, MenuViewSet, MenuPlatViewSet, FenetreCommandeViewSet,
    RegleSubventionViewSet, CommandeViewSet, CommandeLigneViewSet, ExtraRestaurationViewSet,
    LotTicketsViewSet, TicketRepasViewSet,
    menu_public, commander_public, generer_facture, imprimer_facture
)
from audit.views import AuditLogViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='users')
router.register(r'categories', CategorieViewSet)
router.register(r'sous-categories', SousCategorieViewSet)
router.register(r'previsions', PrevisionViewSet)
router.register(r'operations', OperationViewSet)
router.register(r'imputations', ImputationViewSet)
router.register(r'rapports', RapportViewSet, basename='rapports')
router.register(r'audit', AuditLogViewSet, basename='audit')

# Routes Restauration
router.register(r'restauration/plats', PlatViewSet, basename='plats')
router.register(r'restauration/menus', MenuViewSet, basename='menus')
router.register(r'restauration/menu-plats', MenuPlatViewSet, basename='menu-plats')
router.register(r'restauration/fenetres-commande', FenetreCommandeViewSet, basename='fenetres-commande')
router.register(r'restauration/regles-subvention', RegleSubventionViewSet, basename='regles-subvention')
router.register(r'restauration/commandes', CommandeViewSet, basename='commandes')
router.register(r'restauration/commande-lignes', CommandeLigneViewSet, basename='commande-lignes')
router.register(r'restauration/extras', ExtraRestaurationViewSet, basename='extras-restauration')
router.register(r'restauration/lots-tickets', LotTicketsViewSet, basename='lots-tickets')
router.register(r'restauration/tickets', TicketRepasViewSet, basename='tickets')

urlpatterns = [
    path('', include(router.urls)),
    # Routes publiques pour commander sans authentification
    path('restauration/public/menu/<str:token>/', menu_public, name='menu-public'),
    path('restauration/public/commander/<str:token>/', commander_public, name='commander-public'),
    # Routes pour les factures
    path('restauration/factures/<str:date_str>/', generer_facture, name='generer-facture'),
    path('restauration/factures/<str:date_str>/imprimer/', imprimer_facture, name='imprimer-facture'),
]

