create table article_review_data (
    article_id bigint not null
        references article (article_id)
            on delete cascade,
    played_on_gaming_platform_id integer not null references gaming_platform (gaming_platform_id),
    producer text not null,
    play_time integer not null
);

create table article_content (
    article_id bigint not null
        references article (article_id)
            on delete cascade,
    long_description text not null
);

create table article_statistics (
    article_id bigint not null
        references article (article_id)
            on delete cascade
);

insert into article_review_data (article_id, played_on_gaming_platform_id, producer, play_time)
    select distinct article_id, played_on_gaming_platform_id, producer, play_time
        from article where article_type_id = 1 order by article_id ASC;

insert into article_content (article_id, long_description)
    select distinct article_id, long_description
        from article order by article_id ASC;

insert into article_statistics (article_id)
    select distinct article_id
        from article order by article_id ASC;

alter table article 
    drop column played_on_gaming_platform_id, 
    drop column producer, 
    drop column play_time, 
    drop column long_description;