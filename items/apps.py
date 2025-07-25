from django.apps import AppConfig


class ItemsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'items'
    verbose_name = 'إدارة المنتجات'

    def ready(self):
        import items.signals