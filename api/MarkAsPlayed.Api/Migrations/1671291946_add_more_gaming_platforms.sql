alter table gaming_platform
    add column group_name char not null
    default 'A';

update gaming_platform
SET name = 'Sony Playstation 5 (PS5)', group_name = 'P'
where name = 'Sony Playstation';

update gaming_platform
SET name = 'Microsoft Xbox One (XOne)', group_name = 'X'
where name = 'Microsoft Xbox';

update gaming_platform
SET name = 'Nintendo Switch (Switch)', group_name = 'S'
where name = 'Nintendo Switch';

update gaming_platform
SET name = 'Computer (PC)', group_name = 'C'
where name = 'Computer';

update gaming_platform
SET name = 'Other', group_name = 'A'
where name = 'None';

insert
into gaming_platform (
    name,
    group_name
)
values
(
    'Nintendo Game Boy (GameBoy)',
    'N'
),
(
    'Nintendo 3DS (3DS)',
    'N'
),
(
    'Nintendo 2DS (2DS)',
    'N'
),
(
    'Nintendo 64 (N64)',
    'N'
),
(
    'Nintendo DS (DS)',
    'N'
),
(
    'Nintendo GameCube (GameCube)',
    'N'
),
(
    'Sony Playstation (PSX)',
    'P'
),
(
    'Sony Playstation 2 (PS2)',
    'P'
),
(
    'Sony Playstation 3 (PS3)',
    'P'
),
(
    'Sony Playstation 4 (PS4)',
    'P'
),
(
    'Sony Playstation PSP (PSP)',
    'P'
),
(
    'Sony Playstation Vita (PSVita)',
    'P'
),
(
    'Super Nintendo Entertainment System (SNES)',
    'N'
),
(
    'Nintendo Wii (Wii)',
    'N'
),
(
    'Nintendo WiiU (WiiU)',
    'N'
),
(
    'Microsoft Xbox Classic (Xbox Classic)',
    'X'
),
(
    'Microsoft Xbox 360 (Xbox 360)',
    'X'
),
(
    'Microsoft Xbox Series X and S (Xbox X&S)',
    'X'
);