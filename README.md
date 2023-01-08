## Table of contents

- [General info](#general-info)
- [Technologies](#technologies)
- [Setup](#setup)
- [API Tests Setup](#api-tests-setup)
- [Releases](#releases)

## General info

- Web application - blog - reviews and news from the world of games.

## Technologies

- ASP.NET
- PostgreSQL
- React/TypeScript
- Docker
- For user authentication was used Firebase Authentication backend.

## Setup

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
4.dotnet run --project MarkAsPlayed.Api/MarkAsPlayed.Api.csproj
5.docker compose exec ui bash
6.npm start
```

Application should be available under adress: http://Localhost:3000

## API Tests Setup

Process launching containers in terminal:

```
1.docker compose build
2.docker compose up -d
3.docker compose exec api bash
4.dotnet test MarkAsPlayed.sln
```

71 tests passed!

## Releases

- 1.0.0 - commit c7a04e6 - initial releases
- 1.0.1 - commit b6d31cb - phase 1 tests passed
- 1.0.2 - commit d27c758 - phase 2 tests passed
- 1.0.3 - commit c70dfb4 - added multi languages support
- 1.0.4 - commit c4e7c8b - fixed error in gallery creation
- 1.0.5 - commit 4cbd92a - dependency cleaning
- 1.1.0 - commit 3494928 - multiple fixes to UI and API
- 1.1.1 - commit d1a8aaf - multiple fixes to UI and API, new logo
- 1.1.2 - commit 9ed0fa7 - new footer design
- 1.2.0 - commit ef18b6d - added tags funcionality
- 1.2.1 - commit 2c22bed - fixed tags funcionality
- 1.2.2 - commit b67ee67 - fixed navigation back and forward
- 1.2.3 - commit 0e1e832 - fixed missing footer icons
- 1.2.4 - commit 38f6424 - article maximum length extended
- 1.2.5 - commit 32ee91e - improvments to article details and dashboard
- 1.2.6 - commit 5ceac71 - improvments to article dashboard item
- 1.2.7 - commit fd39f89 - slider improvments
- 1.2.8 - commit a670ecf - fixed slider dots on mobile screen
- 1.3.0 - commit daf8199 - api tests included, more tags and more platforms included
- 1.3.1 - commit last - alter tags component styling, waiting window fix and scroll to article details
