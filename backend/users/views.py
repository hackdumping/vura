from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .serializers import RegisterSerializer, UserSerializer

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

class UpgradeView(generics.UpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def put(self, request, *args, **kwargs):
        user = self.get_object()
        plan_type = request.data.get('plan', 'pro')
        user.plan = plan_type
        user.is_premium = True
        user.save()
        serializer = self.get_serializer(user)
        return Response(serializer.data)
