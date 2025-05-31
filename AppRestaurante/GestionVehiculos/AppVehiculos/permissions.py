from rest_framework.permissions import BasePermission

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_admin()

class IsAdminOrMeseroOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        return request.user.is_authenticated and (
            request.user.is_admin() or request.user.tipo_empleado == 'MES'
        )

IsAdminOrReadOnly = IsAdminOrMeseroOrReadOnly  