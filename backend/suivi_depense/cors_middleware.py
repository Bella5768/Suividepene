"""
Middleware personnalisé pour forcer les headers CORS
"""

class CORSMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.allowed_origins = [
            'https://suividepenecsig.vercel.app',
            'https://bella5768.pythonanywhere.com',
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:3002',
            'http://localhost:5173',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:3001',
            'http://127.0.0.1:3002',
            'http://127.0.0.1:5173',
        ]

    def __call__(self, request):
        origin = request.META.get('HTTP_ORIGIN', '')
        
        # Vérifier si l'origine est autorisée
        if origin in self.allowed_origins:
            response = self.get_response(request)
            
            # Ajouter les headers CORS
            response['Access-Control-Allow-Origin'] = origin
            response['Access-Control-Allow-Methods'] = 'DELETE, GET, OPTIONS, PATCH, POST, PUT'
            response['Access-Control-Allow-Headers'] = 'accept, accept-encoding, authorization, content-type, dnt, origin, user-agent, x-csrftoken, x-requested-with'
            response['Access-Control-Allow-Credentials'] = 'true'
            response['Access-Control-Expose-Headers'] = 'content-type, x-csrftoken'
            
            return response
        else:
            response = self.get_response(request)
            return response

    def process_preflight(self, request):
        """Gérer les requêtes OPTIONS (preflight)"""
        origin = request.META.get('HTTP_ORIGIN', '')
        
        if origin in self.allowed_origins:
            return {
                'Access-Control-Allow-Origin': origin,
                'Access-Control-Allow-Methods': 'DELETE, GET, OPTIONS, PATCH, POST, PUT',
                'Access-Control-Allow-Headers': 'accept, accept-encoding, authorization, content-type, dnt, origin, user-agent, x-csrftoken, x-requested-with',
                'Access-Control-Allow-Credentials': 'true',
                'Access-Control-Expose-Headers': 'content-type, x-csrftoken',
            }
        return {}
