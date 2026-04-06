from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Form, FormResponse, ResponseAnswer
from .serializers import FormSerializer, FormResponseSerializer
from django.db.models import Count
from django.db.models.functions import TruncDate

class FormViewSet(viewsets.ModelViewSet):
    serializer_class = FormSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Form.objects.filter(created_by=self.request.user)

    @action(detail=True, methods=['get'])
    def analytics(self, request, pk=None):
        form = self.get_object()
        total_responses = form.responses.count()
        
        fields_summary = []
        for field in form.fields.all():
            if field.type in ['single_choice', 'multiple_choice']:
                answers = ResponseAnswer.objects.filter(field=field)
                counts = {}
                for answer in answers:
                    val = answer.value
                    if isinstance(val, list):
                        for v in val:
                            counts[v] = counts.get(v, 0) + 1
                    elif val:
                        str_val = str(val).strip()
                        if str_val:
                            counts[str_val] = counts.get(str_val, 0) + 1
                
                # Sort counts and keep top 15
                sorted_counts = dict(sorted(counts.items(), key=lambda item: item[1], reverse=True)[:15])
                
                fields_summary.append({
                    "field_id": field.id,
                    "label": field.label,
                    "type": field.type,
                    "counts": sorted_counts
                })

        # Calculate daily responses
        daily_qs = form.responses.annotate(date=TruncDate('submitted_at')).values('date').annotate(count=Count('id')).order_by('date')
        daily_responses = [{"date": str(item['date']), "count": item['count']} for item in daily_qs]

        # Calculate step-by-step conversion for specialized forms
        funnel_data = []
        if form.is_specialized and form.funnel_config:
            steps = form.funnel_config.get('steps', [])
            stats = form.step_impressions or {}
            for step in steps:
                funnel_data.append({
                    "id": step.get('id'),
                    "type": step.get('type'),
                    "label": step.get('title') or step.get('type').upper(),
                    "views": stats.get(step.get('id'), 0)
                })

        return Response({
            "is_specialized": form.is_specialized,
            "total_responses": total_responses,
            "views": form.views,
            "fields_summary": fields_summary,
            "daily_responses": daily_responses,
            "funnel_data": funnel_data,
            "fields": [{"id": f.id, "label": f.label, "type": f.type} for f in form.fields.all()],
            "responses": FormResponseSerializer(form.responses.order_by('-submitted_at'), many=True).data
        })

    @action(detail=True, methods=['post'], permission_classes=[permissions.AllowAny])
    def track_impression(self, request, pk=None):
        form = self.get_object()
        step_id = request.data.get('step_id')
        
        # Global view increment if no step_id (initial load)
        if not step_id:
            form.views += 1
        else:
            # Step-specific impression
            stats = form.step_impressions or {}
            stats[step_id] = stats.get(step_id, 0) + 1
            form.step_impressions = stats
            
        form.save(update_fields=['views', 'step_impressions'])
        return Response({"status": "ok"})

    @action(detail=True, methods=['delete'], url_path='responses/(?P<response_id>[^/.]+)')
    def delete_response(self, request, pk=None, response_id=None):
        form = self.get_object()
        response = get_object_or_404(FormResponse, id=response_id, form=form)
        response.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_public_form(request, public_id):
    form = get_object_or_404(Form, public_id=public_id, is_published=True)
    serializer = FormSerializer(form)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def submit_form(request, public_id):
    form = get_object_or_404(Form, public_id=public_id, is_published=True)
    response_id = request.data.get('response_id')
    answers_data = request.data.get('answers', [])

    # Check for duplicate email if response_id is not provided
    if not response_id:
        email_field = form.fields.filter(type='email').first()
        if email_field:
            email_val = None
            for ans in answers_data:
                if str(ans.get('field_id')) == str(email_field.id):
                    email_val = ans.get('value')
                    break
            
            if email_val:
                existing_answer = ResponseAnswer.objects.filter(
                    field=email_field, 
                    value=email_val,
                    response__form=form
                ).first()
                if existing_answer:
                    response_id = existing_answer.response.id

    if response_id:
        form_response = get_object_or_404(FormResponse, id=response_id, form=form)
        serializer = FormResponseSerializer(form_response, data=request.data, partial=True)
    else:
        serializer = FormResponseSerializer(data=request.data)
        
    if serializer.is_valid():
        serializer.save(form=form)
        is_created = not bool(response_id)
        return Response(serializer.data, status=status.HTTP_201_CREATED if is_created else status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

