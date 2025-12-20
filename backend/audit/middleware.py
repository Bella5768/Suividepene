from .models import AuditLog
from django.contrib.contenttypes.models import ContentType


class AuditMiddleware:
    """Middleware pour capturer automatiquement les actions utilisateur"""
    
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Stocker la requête pour utilisation dans les vues
        request._audit_context = {
            'ip_address': self.get_client_ip(request),
            'user_agent': request.META.get('HTTP_USER_AGENT', ''),
        }
        
        response = self.get_response(request)
        return response

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


def log_audit(action, user, obj=None, changes=None, metadata=None):
    """Fonction utilitaire pour créer une entrée d'audit"""
    if obj is None:
        # Pour les actions sans objet spécifique (export, etc.)
        AuditLog.objects.create(
            action=action,
            user=user,
            content_type=None,
            object_id=None,
            model_name='',
            object_repr='',
            changes=changes or {},
            metadata=metadata or {}
        )
    else:
        content_type = ContentType.objects.get_for_model(obj.__class__)
        AuditLog.objects.create(
            action=action,
            user=user,
            content_type=content_type,
            object_id=obj.pk,
            model_name=obj.__class__.__name__,
            object_repr=str(obj),
            changes=changes or {},
            metadata=metadata or {}
        )

