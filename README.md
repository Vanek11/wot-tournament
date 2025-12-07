# WoT Tournament Frontend

Frontend приложение для сайта турнира по World of Tanks.

## Установка

```bash
npm install
```

## Разработка

```bash
npm run dev
```

Приложение будет доступно на `http://localhost:3000`

## Сборка для продакшена

```bash
npm run build
```

Собранные файлы будут в папке `dist/`

## Деплой на GitHub Pages

1. Создайте репозиторий на GitHub (например, `wot-tournament-frontend`)

2. Настройте GitHub Actions для автоматического деплоя:

Создайте файл `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm install
        
      - name: Build
        run: npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
          
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

3. В настройках репозитория GitHub:
   - Settings → Pages
   - Source: GitHub Actions
   - Укажите URL вашего backend API в Secrets → Actions secrets → `VITE_API_URL` (например, `https://your-backend.onrender.com/api`)

4. После первого push в `main` ветку, GitHub Actions автоматически соберет и задеплоит сайт.

## Переменные окружения

Создайте файл `.env.production` для production сборки:

```
VITE_API_URL=https://your-backend-url.com/api
```

Или используйте GitHub Secrets для `VITE_API_URL` в workflow.

## Локальная разработка

Для локальной разработки создайте `.env.local`:

```
VITE_API_URL=http://localhost:3001/api
```


