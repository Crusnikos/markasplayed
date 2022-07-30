## Table of contents

- [General info](#general-info)
- [Technologies](#technologies)
- [Setup](#setupen)

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
