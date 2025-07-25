from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    """صلاحية المديرين فقط"""
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            (request.user.is_staff or request.user.is_superuser)
        )

class IsSuperUser(permissions.BasePermission):
    """صلاحية المديرين العامين فقط"""
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.is_superuser
        )

class CanViewAnalytics(permissions.BasePermission):
    """صلاحية عرض التحليلات"""
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            (request.user.is_staff or request.user.is_superuser)
        )

class CanExportData(permissions.BasePermission):
    """صلاحية تصدير البيانات"""
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.is_superuser
        )