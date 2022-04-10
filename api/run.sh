# !/bin/sh
set -Eeuo pipefail

function restore() # Restore packages
{
  dotnet restore MarkAsPlayed.sln "$@"
}

function build() # Build the solution
{
  dotnet build MarkAsPlayed.sln /warnaserror "$@"
}

function start() # Starts the project
{
  dotnet run --project MarkAsPlayed.Api/MarkAsPlayed.Api.csproj "$@"
}

if [ $# -eq 0 ] || [ "_$1" = "_" ]; then
  help
else
  "$@"
fi