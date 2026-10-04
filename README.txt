AUTOFORGE — как запустить

ВАРИАНТ А. GitHub Pages + бесплатный Cloudflare Worker (всё работает, 0 ₽)
1. Загрузите в репозиторий GitHub ВСЁ из папки public/: index.html, sw.js, manifest.webmanifest, icon-192.png, icon-512.png. Включите Pages.
2. cloudflare.com -> Workers -> Create -> вставьте код из worker.js -> Deploy.
3. Workers -> KV -> создайте namespace, в Worker: Settings -> Bindings -> KV, имя переменной DB.
4. Settings -> Variables: OWNER_EMAIL, OWNER_PASS, SECRET (любая длинная случайная строка).
5. В index.html найдите строку const API_BASE='' и вставьте адрес Worker, например const API_BASE='https://autoforge.ваше-имя.workers.dev'
Готово: услуги, фото, цены, заявки и кабинет работают с любого устройства.

ВАРИАНТ Б. Свой сервер (VPS, Render, Railway и т.п.), нужен Node.js 16+
Загрузите всё, задайте OWNER_EMAIL и OWNER_PASS, запуск: npm start. Данные лежат в data/ — храните на постоянном диске и делайте копии.

Вход в кабинет держится 7 дней. Для установки как приложение нужен HTTPS.
