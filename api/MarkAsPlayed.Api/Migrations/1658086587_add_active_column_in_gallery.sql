alter table article_gallery
    add column is_active boolean not null
    default true;