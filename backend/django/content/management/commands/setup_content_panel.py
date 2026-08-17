from django.contrib.auth.models import Group, Permission
from django.core.management.base import BaseCommand

from content.constants import CONTENT_CREATOR_GROUP, SEO_SPECIALIST_GROUP


class Command(BaseCommand):
    help = "ساخت گروه‌ها و دسترسی‌های پنل استودیو محتوا و سئو"

    def handle(self, *args, **options):
        content_perms = Permission.objects.filter(content_type__app_label="content")
        if not content_perms.exists():
            self.stderr.write("هنوز دسترسی برای اپ محتوا ساخته نشده. اول migrate بزن.")
            return

        for group_name in (CONTENT_CREATOR_GROUP, SEO_SPECIALIST_GROUP):
            group, created = Group.objects.get_or_create(name=group_name)
            group.permissions.set(content_perms)
            status = "ساخته شد" if created else "به‌روز شد"
            self.stdout.write(
                self.style.SUCCESS(f"{group_name}: {status} ({content_perms.count()} دسترسی)")
            )

        self.stdout.write(
            self.style.WARNING(
                "کاربر را Staff کنید و در یکی از این گروه‌ها بگذارید؛ "
                "بعد فقط آدرس /studio/ برایش باز است و به /admin/ فنی دسترسی ندارد."
            )
        )
