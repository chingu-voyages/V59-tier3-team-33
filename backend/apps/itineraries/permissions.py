from rest_framework import permissions
from apps.itineraries.models import UserTrip

class IsTripMember(permissions.BasePermission):
    """
    Permission check to ensure the user is a member of the trip.
    """
    def has_permission(self, request, view):
        if request.user.is_anonymous:
            return False
            
        trip_pk = view.kwargs.get("trip_pk")
        if not trip_pk:
            return False
            
        return UserTrip.objects.filter(trip_id=trip_pk, user=request.user).exists()
