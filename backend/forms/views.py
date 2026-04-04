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

        return Response({
            "total_responses": total_responses,
            "fields_summary": fields_summary,
            "daily_responses": daily_responses,
            "fields": [{"id": f.id, "label": f.label, "type": f.type} for f in form.fields.all()],
            "responses": FormResponseSerializer(form.responses.order_by('-submitted_at'), many=True).data
        })

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
    serializer = FormResponseSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(form=form)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
