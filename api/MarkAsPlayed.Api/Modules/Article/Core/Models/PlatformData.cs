﻿using System.ComponentModel.DataAnnotations;

namespace MarkAsPlayed.Api.Modules.Article.Core.Models;

/// <summary>
///     Platform informations
/// </summary>
public class PlatformData
{
    /// <summary>
    ///     Article Id
    /// </summary>
    [Required]
    public long ArticleId { get; set; }

    /// <summary>
    ///     Platform Id
    /// </summary>
    [Required]
    public int PlatformId { get; set; }

    /// <summary>
    ///     Platform name
    /// </summary>
    [Required]
    public string PlatformName { get; set; } = default!;

    /// <summary>
    ///     Platform group name
    /// </summary>
    [Required]
    public char PlatformGroupName { get; set; } = default!;
}
