﻿--E stands for entertainment
--G stands for genre
--M stands for mode
--P stands for pegi
--T stands for type

create table tag (
	tag_id integer not null primary key generated by default as identity,
    name text not null unique,
    group_name char not null
);

create table article_tag (
    article_id bigint not null
        references article (article_id)
            on delete cascade,
    tag_id integer not null 
        references tag (tag_id),
    is_active boolean not null,
    PRIMARY KEY (article_id, tag_id)
);

create index tag_id_idx on tag (tag_id);
create index article_tag_tag_id_idx on article_tag (tag_id);

insert
into tag (
    name,
    group_name
)
values
(
    'boardGame', 'E'
),
(
    'event', 'E'
),
(
    'game', 'E'
),
(
    'movie', 'E'
),
(
    'series', 'E'
);

insert
into tag (
    name,
    group_name
)
values
(
    'action', 'T'
),
(
    'adventure', 'T'
),
(
    'puzzle', 'T'
),
(
    'rolePlaying', 'T'
),
(
    'simulation', 'T'
),
(
    'strategy', 'T'
),
(
    'sports', 'T'
);

insert
into tag (
    name,
    group_name
)
values
(
    'anime', 'G'
),
(
    'comedy', 'G'
),
(
    'fantasy', 'G'
),
(
    'horror', 'G'
),
(
    'scienceFiction', 'G'
),
(
    'thriller', 'G'
);

insert
into tag (
    name,
    group_name
)
values
(
    'pegi3', 'P'
),
(
    'pegi7', 'P'
),
(
    'pegi12', 'P'
),
(
    'pegi16', 'P'
),
(
    'pegi18', 'P'
),
(
    'violence', 'P'
),
(
    'badLanguage', 'P'
),
(
    'fear', 'P'
),
(
    'gambling', 'P'
),
(
    'sex', 'P'
),
(
    'drugs', 'P'
),
(
    'discrimination', 'P'
),
(
    'inGamePurchases', 'P'
);

insert
into tag (
    name,
    group_name
)
values
(
    'singlePlayer', 'M'
),
(
    'multiPlayer', 'M'
),
(
    'cooperative', 'M'
),
(
    'competitive', 'M'
),
(
    'mmo', 'M'
);