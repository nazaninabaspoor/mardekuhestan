from django.core.management.base import BaseCommand

from content.management.commands.setup_content_panel import Command as SetupContentPanelCommand


class Command(SetupContentPanelCommand):
    help = "همان setup_content_panel (سازگاری با نام قبلی)"
