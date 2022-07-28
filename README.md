## Table of contents
* [General info / Informacje](#general-info)
* [Technologies / technologie](#technologies)
* [SetupEN](#setupen)
* [SetupPL / konfiguracja](#setuppl)

## General info
* EN - Web application - blog - reviews and news from the world of games.
* PL - Aplikacja webowa - blog - recenzje i newsy ze świata gier.

## Technologies
* ASP.NET
* PostgreSQL
* React/TypeScript
* Docker
* EN - For user authentication was used Firebase Authentication backend.
* PL - Do uwierzytelniania użytkowników wykoszystano Firebase Authentication backend.

## SetupEN
Before containers start:

```
1.Download and install Node.js (if you dont have)
2.In folder markasplayed/ui/ execute command npm ci
3.Download, install and configure docker (if you dont have)
4.I advice also use WSL2 and Ubuntu for containers launching
```

Process launching containers in terminal:
```
1.docker compose build
2.docker compose up -d
3.docker compose exec api bash
4.bash run.sh start
5.docker compose exec ui bash
6.npm start
```

Application should be available under adress: http://Localhost:3000

## SetupPL
Przed uruchomieniem kontenerów:

```
1.Pobierz i zainstaluj Node.js (jeżeli nie masz)
2.W folderze markasplayed/ui/ wykonaj npm ci
3.Pobierz, zainstaluj i skonfiguruj docker (jeżeli nie masz)
4.Polecam również skorzystać z WSL2 i np Ubuntu do uruchamiania kontenerów
```

Proces uruchamiania kontenerów w terminalu:
```
1.docker compose build
2.docker compose up -d
3.docker compose exec api bash
4.bash run.sh start
5.docker compose exec ui bash
6.npm start
```

Aplikacja powinna być dostepna pod adresem: http://Localhost:3000
