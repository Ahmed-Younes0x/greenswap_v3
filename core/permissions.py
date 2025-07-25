from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    """صلاحية المالك أو القراءة فقط"""
    
    def has_object_permission(self, request, view, obj):
        # صلاحيات القراءة للجميع
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # صلاحيات الكتابة للمالك فقط
        return obj.owner == request.user

class IsAuthorOrReadOnly(permissions.BasePermission):
    """صلاحية المؤلف أو القراءة فقط"""
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        return obj.author == request.user

class IsBusinessUser(permissions.BasePermission):
    """صلاحية المستخدمين التجاريين"""
    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            request.user.user_type in ['business', 'recycling_center']
        )

class IsVerifiedUser(permissions.BasePermission):
    """صلاحية المستخدمين الموثقين"""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_verified

class IsActiveUser(permissions.BasePermission):
    """صلاحية المستخدمين النشطين"""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_active