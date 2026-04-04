import io
import openpyxl
from django.http import HttpResponse
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from forms.models import Form
import gspread
import os
from google.oauth2.service_account import Credentials
import json
from datetime import datetime

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_excel(request, form_id):
    form = get_object_or_404(Form, id=form_id, created_by=request.user)
    
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Responses"
    
    fields = list(form.fields.all().order_by('order'))
    
    # Headers
    headers = ["Submission Date"] + [f.label for f in fields]
    ws.append(headers)
    
    # Rows
    responses = form.responses.all().order_by('submitted_at')
    for doc in responses:
        # Check if Django passes naive or timezone aware. stringify it nicely here.
        row = [doc.submitted_at.strftime('%Y-%m-%d %H:%M:%S')]
        answers_dict = {a.field_id: a.value for a in doc.answers.all()}
        for field in fields:
            val = answers_dict.get(field.id, "")
            if isinstance(val, list):
                val = ", ".join(map(str, val))
            row.append(str(val) if val else "")
        ws.append(row)
        
    buffer = io.BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    
    response = HttpResponse(buffer.read(), content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    response['Content-Disposition'] = f'attachment; filename="form_{form_id}_responses.xlsx"'
    return response

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def export_google_sheets(request, form_id):
    form = get_object_or_404(Form, id=form_id, created_by=request.user)
    # The creds file should be in the backend root
    creds_path = os.path.join(settings.BASE_DIR, 'credentials.json')
    
    if not os.path.exists(creds_path):
        return Response({
            "status": "error",
            "message": "Fichier 'credentials.json' manquant.",
            "setup_required": True
        }, status=400)

    try:
        scopes = ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive"]
        creds = Credentials.from_service_account_file(creds_path, scopes=scopes)
        client = gspread.authorize(creds)
        
        # Check if form already has a spreadsheet ID (future: store it in model)
        # For now, we always create a new one to ensure "Direct Transmission" feeling
        title = f"Vura: {form.title} - {datetime.now().strftime('%Y-%m-%d %H:%M')}"
        sh = client.create(title)
        
        # Share it broadly so the user can open it instantly in their browser
        sh.share(None, perm_type='anyone', role='writer')
        
        ws = sh.get_worksheet(0)
        ws.update_title("Vura Responses")
        
        fields = list(form.fields.all().order_by('order'))
        headers = ["Submission Date"] + [f.label for f in fields]
        
        data = [headers]
        responses = form.responses.all().order_by('submitted_at')
        for doc in responses:
            row = [doc.submitted_at.strftime('%Y-%m-%d %H:%M:%S')]
            answers_dict = {a.field_id: a.value for a in doc.answers.all()}
            for field in fields:
                val = answers_dict.get(field.id, "")
                if isinstance(val, list):
                    val = ", ".join(map(str, val))
                row.append(str(val) if val else "")
            data.append(row)
            
        # Update sheet with all data at once for performance
        ws.update('A1', data)
        
        return Response({
            "status": "success",
            "message": "Synchronisation réussie !",
            "sheet_url": sh.url
        })
    except Exception as e:
        return Response({
            "status": "error",
            "message": f"Erreur Google API: {str(e)}"
        }, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_tsv(request, form_id):
    form = get_object_or_404(Form, id=form_id, created_by=request.user)
    fields = list(form.fields.all().order_by('order'))
    
    # Headers
    headers = ["Date de soumission"] + [f.label for f in fields]
    tsv_content = "\t".join(headers) + "\n"
    
    # Rows
    responses = form.responses.all().order_by('submitted_at')
    for doc in responses:
        row = [doc.submitted_at.strftime('%Y-%m-%d %H:%M:%S')]
        answers_dict = {a.field_id: a.value for a in doc.answers.all()}
        for field in fields:
            val = answers_dict.get(field.id, "")
            if isinstance(val, list):
                val = ", ".join(map(str, val))
            row.append(str(val) if val else "")
        tsv_content += "\t".join(row) + "\n"
        
    response = HttpResponse(tsv_content, content_type='text/tab-separated-values')
    response['Content-Disposition'] = f'attachment; filename="vura_data_{form_id}.tsv"'
    return response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_magic_link(request, form_id):
    import hashlib
    token = hashlib.sha256(f"vura_secret_{form_id}".encode()).hexdigest()[:16]
    # Build absolute URL
    url = request.build_absolute_uri(f'/api/integrations/{form_id}/public/tsv/{token}/')
    formula = f'=IMPORTDATA("{url}")'
    return Response({
        "url": url,
        "formula": formula
    })

@api_view(['GET'])
def public_export_tsv(request, form_id, token):
    # Simplified secret check: in production, this should be a real token in the DB
    # For now, we use a simple hash of the form ID + a salt
    import hashlib
    expected = hashlib.sha256(f"vura_secret_{form_id}".encode()).hexdigest()[:16]
    
    if token != expected:
        return Response({"error": "Unauthorized"}, status=403)
        
    form = get_object_or_404(Form, id=form_id)
    fields = list(form.fields.all().order_by('order'))
    
    headers = ["Date de soumission"] + [f.label for f in fields]
    tsv_content = "\t".join(headers) + "\n"
    
    responses = form.responses.all().order_by('submitted_at')
    for doc in responses:
        row = [doc.submitted_at.strftime('%Y-%m-%d %H:%M:%S')]
        answers_dict = {a.field_id: a.value for a in doc.answers.all()}
        for field in fields:
            val = answers_dict.get(field.id, "")
            if isinstance(val, list):
                val = ", ".join(map(str, val))
            row.append(str(val) if val else "")
        tsv_content += "\t".join(row) + "\n"
        
    return HttpResponse(tsv_content, content_type='text/tab-separated-values')
