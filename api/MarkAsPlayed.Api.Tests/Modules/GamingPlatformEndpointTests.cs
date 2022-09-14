using Flurl.Http;
using FluentAssertions;
using MarkAsPlayed.Api.Lookups;

namespace MarkAsPlayed.Api.Tests.Modules;

public sealed class GamingPlatformEndpointTests : IntegrationTest
{
    [Fact]
    public async Task ShouldRetrieveLookupDataTable()
    {
        var response = await Client.Request("gamingPlatforms").
                                    GetJsonAsync<List<LookupData>>();
        response.Should().Contain(v => v.Name == "Sony Playstation 5 (PS5)" && v.GroupName == 'P');
        response.Should().Contain(v => v.Name == "Microsoft Xbox One (XOne)" && v.GroupName == 'X');
        response.Should().Contain(v => v.Name == "Nintendo Switch (Switch)" && v.GroupName == 'S');
        response.Should().Contain(v => v.Name == "Computer (PC)" && v.GroupName == 'C');
        response.Should().Contain(v => v.Name == "None" && v.GroupName == 'A');
        response.Should().Contain(v => v.Name == "Nintendo Game Boy (GameBoy)" && v.GroupName == 'N');
        response.Should().Contain(v => v.Name == "Nintendo 3DS (3DS)" && v.GroupName == 'N');
        response.Should().Contain(v => v.Name == "Nintendo 2DS (2DS)" && v.GroupName == 'N');
        response.Should().Contain(v => v.Name == "Nintendo 64 (N64)" && v.GroupName == 'N');
        response.Should().Contain(v => v.Name == "Nintendo DS (DS)" && v.GroupName == 'N');
        response.Should().Contain(v => v.Name == "Nintendo GameCube (GameCube)" && v.GroupName == 'N');
        response.Should().Contain(v => v.Name == "Sony Playstation (PSX)" && v.GroupName == 'P');
        response.Should().Contain(v => v.Name == "Sony Playstation 2 (PS2)" && v.GroupName == 'P');
        response.Should().Contain(v => v.Name == "Sony Playstation 3 (PS3)" && v.GroupName == 'P');
        response.Should().Contain(v => v.Name == "Sony Playstation 4 (PS4)" && v.GroupName == 'P');
        response.Should().Contain(v => v.Name == "Sony Playstation PSP (PSP)" && v.GroupName == 'P');
        response.Should().Contain(v => v.Name == "Sony Playstation Vita (PSVita)" && v.GroupName == 'P');
        response.Should().Contain(v => v.Name == "Super Nintendo Entertainment System (SNES)" && v.GroupName == 'N');
        response.Should().Contain(v => v.Name == "Nintendo Wii (Wii)" && v.GroupName == 'N');
        response.Should().Contain(v => v.Name == "Nintendo WiiU (WiiU)" && v.GroupName == 'N');
        response.Should().Contain(v => v.Name == "Microsoft Xbox Classic (Xbox Classic)" && v.GroupName == 'X');
        response.Should().Contain(v => v.Name == "Microsoft Xbox 360 (Xbox 360)" && v.GroupName == 'X');
        response.Should().Contain(v => v.Name == "Microsoft Xbox Series X and S (Xbox X&S)" && v.GroupName == 'X');
        response.Should().HaveCount(23);
    }
}
