drop table if exists comp_lb;
drop table if exists coop_lb;
drop table if exists players;
drop table if exists teams;
drop table if exists curr_lobby;

create table comp_lb (
    id serial primary key,
    score integer,
    pName varchar,
    rank integer
);
create table coop_lb{
    id serial primary key,
    score integer,
    tName varchar,
    rank integer
};
create table players{
    id serial primary key,
    name varchar,
    curr_lobby_id integer references curr_lobby(id),
    comp_lb_id integer references comp_lb(id)
};
create table teams{
    id serial primary key,
    name varchar,
    curr_lobby_id integer references curr_lobby(id),
    comp_lb_id integer references coop_lb(id)
};
create table curr_lobby{
    id serial primary key,
    name varchar,
    pCount integer
};
