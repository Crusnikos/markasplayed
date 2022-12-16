--E stands for entertainment
--G stands for genre
--M stands for mode
--P stands for pegi
--T stands for type

insert
into tag (
    name,
    group_name
)
values
(
    'story', 'E'
);

insert
into tag (
    name,
    group_name
)
values
(
    'sandbox', 'T'
),
(
    'shooter', 'T'
),
(
    'cardGame', 'T'
),
(
    'diceGame', 'T'
);

insert
into tag (
    name,
    group_name
)
values
(
    'mystery', 'G'
),
(
    'romance', 'G'
),
(
    'western', 'G'
);