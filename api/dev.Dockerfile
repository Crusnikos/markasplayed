FROM mcr.microsoft.com/dotnet/sdk:6.0 AS builder
WORKDIR /app

RUN dotnet tool install -g dotnet-format
ENV PATH="$PATH:/root/.dotnet/tools"
COPY run.sh .
COPY *.sln .
COPY MarkAsPlayed.Api/*.csproj MarkAsPlayed.Api/
RUN bash ./run.sh restore

COPY . ./
RUN bash ./run.sh build -c Release --no-restore

EXPOSE 80/tcp