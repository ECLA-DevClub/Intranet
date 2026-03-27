import os
import django

# Настройка окружения Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "intranet_backend.settings.dev")
django.setup()

from django.contrib.auth import get_user_model

def setup_admin():
    User = get_user_model()
    username = 'admin'
    email = 'admin@example.com'
    password = 'admin'

    try:
        if User.objects.filter(username=username).exists():
            print(f"Пользователь '{username}' найден. Сбрасываем пароль...")
            user = User.objects.get(username=username)
            user.set_password(password)
            user.role = User.Role.ADMIN
            user.is_staff = True
            user.is_superuser = True
            user.save()
            print(f"УСПЕХ: Пароль для '{username}' изменен на '{password}'")
        else:
            print(f"Пользователь '{username}' не найден. Создаем нового...")
            user = User.objects.create_superuser(username, email, password)
            user.role = User.Role.ADMIN
            user.save(update_fields=['role'])
            print(f"УСПЕХ: Суперпользователь '{username}' создан с паролем '{password}'")
    except Exception as e:
        print(f"ОШИБКА: {e}")

if __name__ == "__main__":
    setup_admin()