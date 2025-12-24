from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth.models import User

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """Endpoint de santé pour vérifier que le backend fonctionne"""
    admin_exists = User.objects.filter(username='admin').exists()
    return Response({
        'status': 'ok',
        'admin_user_exists': admin_exists,
        'total_users': User.objects.count(),
    })

urlpatterns = [
    path('health/', health_check, name='health_check'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]






