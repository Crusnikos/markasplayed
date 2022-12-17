FROM mcr.microsoft.com/dotnet/sdk:6.0 AS builder
WORKDIR /app

COPY *.sln .
COPY MarkAsPlayed.Api/*.csproj MarkAsPlayed.Api/
COPY MarkAsPlayed.Api.Tests/*.csproj MarkAsPlayed.Api.Tests/
RUN dotnet restore MarkAsPlayed.sln

COPY . ./
RUN dotnet build MarkAsPlayed.sln -c Release --no-restore