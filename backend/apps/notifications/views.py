from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer


class NotificationListView(generics.ListAPIView):
    """GET /api/v1/notifications/ — returns current user's notifications."""
    serializer_class   = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Notification.objects.filter(recipient=self.request.user)
        unread = self.request.query_params.get('unread')
        if unread == 'true':
            qs = qs.filter(is_read=False)
        return qs


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_all_read(request):
    """POST /api/v1/notifications/mark-read/ — marks all as read."""
    Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
    return Response({'detail': 'All notifications marked as read.'})


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def mark_one_read(request, pk):
    """PATCH /api/v1/notifications/<pk>/read/"""
    try:
        notif = Notification.objects.get(pk=pk, recipient=request.user)
        notif.is_read = True
        notif.save()
        return Response(NotificationSerializer(notif).data)
    except Notification.DoesNotExist:
        return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
