from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'إنشاء مستخدم إداري'

    def add_arguments(self, parser):
        parser.add_argument('--email', type=str, help='البريد الإلكتروني')
        parser.add_argument('--password', type=str, help='كلمة المرور')
        parser.add_argument('--name', type=str, help='الاسم الكامل')

    def handle(self, *args, **options):
        email = options.get('email') or input('البريد الإلكتروني: ')
        password = options.get('password') or input('كلمة المرور: ')
        name = options.get('name') or input('الاسم الكامل: ')

        if User.objects.filter(email=email).exists():
            self.stdout.write(
                self.style.ERROR(f'المستخدم {email} موجود بالفعل!')
            )
            return

        user = User.objects.create_superuser(
            email=email,
            password=password,
            full_name=name
        )

        self.stdout.write(
            self.style.SUCCESS(f'تم إنشاء المستخدم الإداري {email} بنجاح!')
        )