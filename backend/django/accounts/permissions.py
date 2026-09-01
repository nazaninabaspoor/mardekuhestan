from rest_framework.permissions import BasePermission


class IsCustomerOrStaff(BasePermission):
    message = "اول وارد حساب شوید."

    def has_permission(self, request, view) -> bool:
        user = request.user
        return bool(user and user.is_authenticated)
