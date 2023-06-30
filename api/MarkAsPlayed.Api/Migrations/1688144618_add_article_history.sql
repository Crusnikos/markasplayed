create table article_version_history (
    article_id bigint not null
        references article (article_id)
            on delete cascade,
    transaction_id text not null UNIQUE,
    created_at timestamptz not null default now(),
    created_by_author_id integer not null references author (author_id),
    differences JSONB not null
);
