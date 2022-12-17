using MarkAsPlayed.Api.Data.Models;
using MarkAsPlayed.Api.Lookups;
using Microsoft.AspNetCore.Mvc;

namespace MarkAsPlayed.Api.Modules;

[Route("tagData")]
public class TagDataController : LookupController<Tag>
{
    public TagDataController(LookupQuery<Tag> query) : base(query)
    {
    }
}
