using MarkAsPlayed.Api.Data.Models;
using MarkAsPlayed.Api.Lookups;
using Microsoft.AspNetCore.Mvc;

namespace MarkAsPlayed.Api.Modules;

[Route("gamingPlatforms")]
public class GamingPlatformController : LookupController<GamingPlatform>
{
    public GamingPlatformController(LookupQuery<GamingPlatform> query) : base(query)
    {
    }
}
