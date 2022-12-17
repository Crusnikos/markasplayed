alter table article_type
    add column group_name char not null
    default 'A';