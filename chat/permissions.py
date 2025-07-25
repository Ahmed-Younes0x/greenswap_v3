from rest_framework import permissions

class IsConversationParticipant(permissions.BasePermission):
    """
    صلاحية للتأكد من أن المستخدم مشارك في المحادثة
    """
    
    def has_object_permission(self, request, view, obj):
        # للمحادثات
        if hasattr(obj, 'participants'):
            return obj.participants.filter(id=request.user.id).exists()
        
        # للرسائل
        if hasattr(obj, 'conversation'):
            return obj.conversation.participants.filter(id=request.user.id).exists()
        
        return False

class IsMessageSender(permissions.BasePermission):
    """
    صلاحية للتأكد من أن المستخدم هو مرسل الرسالة
    """
    
    def has_object_permission(self, request, view, obj):
        return obj.sender == request.user