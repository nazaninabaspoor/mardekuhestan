from rest_framework.permissions import BasePermission

from sec.ownership import acting_user


class IsCustomerOrStaff(BasePermission):
    message = "اول وارد حساب شوید."

    def has_permission(self, request, view) -> bool:
        return acting_user(request) is not None
