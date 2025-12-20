from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.contrib.auth import authenticate
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken
import json


def index(request, **kwargs):
    """Vue principale qui sert l'interface React
    
    Accepte des paramètres supplémentaires (comme token) pour les routes
    qui nécessitent des paramètres dans l'URL, mais React Router gère
    le routage côté client.
    """
    return render(request, 'depenses/index.html', {
        'user': request.user,
        'debug': settings.DEBUG,
    })


def get_token(request):
    """Endpoint pour obtenir un token JWT (pour l'API React)"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')
            
            user = authenticate(request, username=username, password=password)
            if user:
                refresh = RefreshToken.for_user(user)
                return JsonResponse({
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                })
            else:
                return JsonResponse({'error': 'Invalid credentials'}, status=401)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

