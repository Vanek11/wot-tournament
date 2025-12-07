# Настройка проекта для полностью статического деплоя на GitHub Pages

Этот проект настроен для работы **полностью на GitHub Pages** без использования сторонних сервисов.

## Как это работает

1. **Данные хранятся в JSON файлах** в репозитории (`data/data.json`)
2. **Frontend читает данные** напрямую из JSON файлов
3. **Админка использует GitHub API** для редактирования данных через интерфейс
4. **Wotstat интеграция** работает на клиенте (с возможными ограничениями CORS)

## Настройка

### 1. Структура данных

Данные хранятся в файле `public/data/data.json` (или `data/data.json` после сборки).

### 2. Настройка GitHub API для админки

1. Создайте **Personal Access Token** на GitHub:
   - Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Generate new token (classic)
   - Выберите scope: `repo` (полный доступ к репозиторию)
   - Скопируйте токен (он показывается только один раз!)

2. В админке перейдите в **Настройки** → **GitHub Configuration**:
   - **Repository Owner**: ваш GitHub username
   - **Repository Name**: название репозитория (например, `wot-tournament`)
   - **Branch**: `main` (или другая ветка)
   - **Personal Access Token**: вставьте токен

3. Нажмите "Test Connection" для проверки

### 3. Деплой на GitHub Pages

1. Создайте репозиторий на GitHub

2. Загрузите код:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/wot-tournament.git
git push -u origin main
```

3. Настройте GitHub Pages:
   - Settings → Pages
   - Source: **GitHub Actions** (workflow уже настроен)
   - Или используйте ветку `gh-pages`

4. Создайте файл `public/data/data.json` с начальными данными (см. пример ниже)

### 4. Начальные данные

Создайте файл `public/data/data.json`:

```json
{
  "players": [],
  "teams": [],
  "matches": [],
  "rules": [],
  "ruleCards": [],
  "settings": {
    "name": "World of Tanks Tournament",
    "description": "Киберспортивный турнир по World of Tanks",
    "startDate": "",
    "endDate": "",
    "prizePool": "Призовой фонд уточняется",
    "logoUrl": "",
    "wotstat_baseUrl": "https://ru.wotstat.info/session/chuck-norris-tournament",
    "wotstat_defaultLastX": 50,
    "wotstat_defaultLevel": 10,
    "techPool": []
  }
}
```

## Ограничения

### 1. Wotstat CORS

Wotstat может блокировать запросы с других доменов (CORS). Решения:
- Использовать CORS proxy (например, `api.allorigins.win`)
- Настроить GitHub Actions workflow для проксирования запросов
- Использовать браузерное расширение для обхода CORS (только для разработки)

### 2. GitHub API Rate Limits

GitHub API имеет лимиты:
- **Authenticated requests**: 5000 запросов/час
- **Unauthenticated requests**: 60 запросов/час

Для админки обязательно используйте Personal Access Token.

### 3. Безопасность токена

⚠️ **Важно**: Personal Access Token хранится в localStorage браузера. Это не идеально с точки зрения безопасности, но для личных проектов приемлемо.

Для продакшена рассмотрите:
- Использование GitHub OAuth App
- Проксирование через собственный сервер
- Использование GitHub Actions для автоматического обновления данных

## Альтернатива: GitHub Actions для Wotstat

Можно настроить GitHub Actions workflow, который будет периодически обновлять данные с Wotstat:

```yaml
name: Update Wotstat Data

on:
  schedule:
    - cron: '0 */6 * * *'  # Каждые 6 часов
  workflow_dispatch:

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Fetch Wotstat data
        run: |
          # Скрипт для получения данных с Wotstat
          # и обновления data.json
      - name: Commit changes
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add data/data.json
          git commit -m "Update Wotstat data" || exit 0
          git push
```

## Преимущества этого подхода

✅ Полностью бесплатно  
✅ Нет зависимости от сторонних сервисов  
✅ Все данные в одном месте (GitHub репозиторий)  
✅ История изменений через Git  
✅ Легко делать бэкапы (клонировать репозиторий)

## Недостатки

❌ Ограничения GitHub API  
❌ CORS проблемы с Wotstat  
❌ Токен хранится в браузере  
❌ Нет реального backend (все на клиенте)


