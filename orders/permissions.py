from rest_framework import permissions

class IsOrderParticipant(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user == obj.buyer or request.user == obj.seller