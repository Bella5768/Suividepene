from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver
from .models import Operation, Prevision, Imputation
from audit.middleware import log_audit


@receiver(post_save, sender=Operation)
def log_operation_save(sender, instance, created, **kwargs):
    """Logger la création/modification d'une opération"""
    if instance.created_by:
        action = 'create' if created else 'update'
        changes = {}
        if not created and hasattr(instance, '_old_values'):
            changes = instance._old_values
        log_audit(action, instance.created_by, instance, changes=changes)


@receiver(pre_save, sender=Operation)
def store_old_values(sender, instance, **kwargs):
    """Stocker les anciennes valeurs avant modification"""
    if instance.pk:
        try:
            old_instance = Operation.objects.get(pk=instance.pk)
            instance._old_values = {
                'montant_depense': str(old_instance.montant_depense),
                'date_operation': str(old_instance.date_operation),
            }
        except Operation.DoesNotExist:
            pass


@receiver(post_delete, sender=Operation)
def log_operation_delete(sender, instance, **kwargs):
    """Logger la suppression d'une opération"""
    if instance.created_by:
        log_audit('delete', instance.created_by, instance)


@receiver(post_save, sender=Prevision)
def log_prevision_save(sender, instance, created, **kwargs):
    """Logger la création/modification d'une prévision"""
    if instance.created_by:
        action = 'create' if created else 'update'
        log_audit(action, instance.created_by, instance)


@receiver(post_save, sender=Imputation)
def log_imputation_save(sender, instance, created, **kwargs):
    """Logger la création/modification d'une imputation"""
    if instance.created_by:
        action = 'create' if created else 'update'
        log_audit(action, instance.created_by, instance)



