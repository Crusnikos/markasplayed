Aplikacja webowa - blog - recenzje i newsy ze świata gier. 

Technologie:
-ASP.NET
-PostgreSQL
-React/TypeScript
-Docker

Do uwierzytelniania użytkowników wykoszystano Firebase Authentication backend.

Przed uruchomieniem kontenerów:
1.Pobierz i zainstaluj Node.js (jeżeli nie masz)
2.W folderze markasplayed/ui/ wykonaj npm ci
3.Zainstaluj i skonfiguruj docker (jeżeli nie masz)
4.Polecam również skorzystać z WSL2 i np Ubuntu do uruchamiania kontenerów

Proces uruchamiania kontenerów w terminalu:
1.docker compose build
2.docker compose up -d
3.docker compose exec api bash
4.bash run.sh start
5.docker compose exec ui bash
6.npm start

Aplikacja powinna być dostepna pod adresem: http://Localhost:3000
