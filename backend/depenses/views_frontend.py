from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse, HttpResponse
from django.contrib.auth import authenticate
from django.conf import settings
from django.template.loader import get_template
from rest_framework_simplejwt.tokens import RefreshToken
import json
import logging

logger = logging.getLogger(__name__)


def index(request, **kwargs):
    """Vue principale qui sert l'interface frontend vanilla
    
    Accepte des paramètres supplémentaires (comme token) pour les routes
    qui nécessitent des paramètres dans l'URL, mais le routeur vanilla JS gère
    le routage côté client.
    """
    try:
        template = get_template('depenses/index.html')
        context = {
            'user': request.user,
            'debug': settings.DEBUG,
        }
        return HttpResponse(template.render(context, request))
    except Exception as e:
        logger.error(f"Erreur lors du chargement du template: {str(e)}")
        return HttpResponse(f"Erreur: {str(e)}", status=500)


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

