using MarkAsPlayed.Api.Data.Models;
using MarkAsPlayed.Api.Lookups;
using Microsoft.AspNetCore.Mvc;

namespace MarkAsPlayed.Api.Modules;

[Route("articleTypes")]
public sealed class ArticleTypeController : LookupController<ArticleType>
{
    public ArticleTypeController(LookupQuery<ArticleType> query) : base(query)
    {
    }
}
