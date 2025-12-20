import django_filters
from .models import Operation, Prevision


class OperationFilter(django_filters.FilterSet):
    date_operation = django_filters.DateFromToRangeFilter()
    categorie = django_filters.NumberFilter(field_name='categorie_id')
    sous_categorie = django_filters.NumberFilter(field_name='sous_categorie_id')
    semaine_iso = django_filters.NumberFilter()
    description = django_filters.CharFilter(lookup_expr='icontains')

    class Meta:
        model = Operation
        fields = ['date_operation', 'categorie', 'sous_categorie', 'semaine_iso', 'description']


class PrevisionFilter(django_filters.FilterSet):
    mois = django_filters.DateFilter()
    categorie = django_filters.NumberFilter(field_name='categorie_id')
    sous_categorie = django_filters.NumberFilter(field_name='sous_categorie_id')
    statut = django_filters.ChoiceFilter(choices=Prevision.STATUT_CHOICES)

    class Meta:
        model = Prevision
        fields = ['mois', 'categorie', 'sous_categorie', 'statut']



