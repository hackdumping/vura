from django.urls import path
from .views import export_excel, export_google_sheets, export_tsv, public_export_tsv, get_magic_link

urlpatterns = [
    path('<int:form_id>/export/excel/', export_excel, name='export_excel'),
    path('<int:form_id>/export/google-sheets/', export_google_sheets, name='export_google_sheets'),
    path('<int:form_id>/export/tsv/', export_tsv, name='export_tsv'),
    path('<int:form_id>/get-magic-link/', get_magic_link, name='get_magic_link'),
    path('<int:form_id>/public/tsv/<str:token>/', public_export_tsv, name='public_export_tsv'),
]
