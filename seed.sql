drop table if exists comp_lb;
drop table if exists coop_lb;
drop table if exists players;
drop table if exists teams;
drop table if exists curr_lobby;

create table curr_lobby(
    id serial primary key,
    name varchar,
    pCount integer,
    public boolean,
    type varchar
);
create table players(
    id serial primary key,
    name varchar,
    sessID integer,
    lID integer references curr_lobby(id)
);
create table teams(
    id serial primary key,
    name varchar,
    lID integer references curr_lobby(id)
);
create table comp_lb (
    id serial primary key,
    score integer,
    rank integer,
    pID integer references players(id) 
);
create table coop_lb(
    id serial primary key,
    score integer,
    rank integer,
    tID integer references teams(id)
);