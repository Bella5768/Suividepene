from rest_framework import serializers
from .models import AuditLog


class AuditLogSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    
    class Meta:
        model = AuditLog
        fields = [
            'id', 'action', 'user', 'model_name', 'object_repr',
            'changes', 'ip_address', 'user_agent', 'timestamp', 'metadata'
        ]
        read_only_fields = fields
    
    def get_user(self, obj):
        return obj.user.username if obj.user else None





