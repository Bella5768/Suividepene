from django.contrib import admin
from .models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['timestamp', 'action', 'user', 'model_name', 'object_repr', 'ip_address']
    list_filter = ['action', 'timestamp', 'model_name']
    search_fields = ['user__username', 'object_repr', 'model_name']
    readonly_fields = ['timestamp', 'action', 'user', 'content_type', 'object_id', 'model_name', 'object_repr', 'changes', 'ip_address', 'user_agent', 'metadata']
    date_hierarchy = 'timestamp'
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False
    
    def has_delete_permission(self, request, obj=None):
        return False




