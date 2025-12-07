# Режим полностью статического деплоя на GitHub Pages

Этот проект теперь поддерживает **полностью статический режим** для деплоя на GitHub Pages без использования backend сервера.

## Как включить статический режим

### Вариант 1: Через переменную окружения

Создайте файл `.env` или `.env.production`:

```env
VITE_USE_STATIC_DATA=true
```

Или установите в GitHub Actions secrets:
- `VITE_USE_STATIC_DATA` = `true`

### Вариант 2: Автоматически (если нет API URL)

Если `VITE_API_URL` не установлен, проект автоматически переключится в статический режим.

## Как это работает

### 1. Данные в JSON файлах

Все данные хранятся в `public/data/data.json`. Этот файл:
- Читается напрямую из репозитория
- Обновляется через GitHub API в админке
- Версионируется через Git

### 2. Чтение данных

Frontend читает данные напрямую из JSON файла через `fetch('/data/data.json')`.

### 3. Сохранение данных (админка)

Админка использует GitHub API для обновления файла `data/data.json` в репозитории.

**Настройка GitHub API:**
1. Создайте Personal Access Token на GitHub (Settings → Developer settings)
2. В админке: Settings → GitHub Configuration
3. Введите:
   - Repository Owner (ваш GitHub username)
   - Repository Name
   - Branch (обычно `main`)
   - Personal Access Token

### 4. Wotstat интеграция

Работает на клиенте, но может быть заблокирована CORS. Решения:
- Использовать CORS proxy (уже встроено)
- Настроить GitHub Actions для периодического обновления данных

## Структура данных

```json
{
  "players": [
    {
      "id": 1,
      "nickname": "Player1",
      "clanTag": "CLAN",
      "bucket": 1,
      "portalProfileUrl": "...",
      "streams": [
        { "platform": "Twitch", "url": "..." }
      ],
      "stats": {
        "battles": 1000,
        "wins": 600,
        "wr": 60.0,
        "avgDamage": 2000,
        "avgExp": 1000,
        "hits": 85.5,
        "rating": 1500
      }
    }
  ],
  "teams": [
    {
      "id": 1,
      "name": "Team Name",
      "playerIds": [1, 2, 3],
      "wotstat_lastX": 50,
      "wotstat_level": 10
    }
  ],
  "matches": [...],
  "rules": [...],
  "ruleCards": [...],
  "settings": {...}
}
```

## Деплой

1. Убедитесь, что `public/data/data.json` существует с начальными данными
2. Установите `VITE_USE_STATIC_DATA=true` или не указывайте `VITE_API_URL`
3. Соберите проект: `npm run build`
4. Задеплойте на GitHub Pages

## Преимущества

✅ Полностью бесплатно  
✅ Нет зависимости от backend сервера  
✅ Все данные в Git (история изменений)  
✅ Легко делать бэкапы  
✅ Работает полностью на GitHub Pages

## Ограничения

⚠️ GitHub API rate limits (5000 запросов/час с токеном)  
⚠️ CORS проблемы с Wotstat (можно решить через proxy)  
⚠️ Токен хранится в localStorage (не идеально для безопасности)  
⚠️ Нет реального backend (все на клиенте)

## Переключение между режимами

Проект автоматически определяет режим:
- Если `VITE_API_URL` установлен → использует API
- Если `VITE_USE_STATIC_DATA=true` → использует JSON файлы
- Иначе → пытается использовать API, затем fallback на JSON


