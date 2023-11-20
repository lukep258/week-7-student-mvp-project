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

insert into curr_lobby (name,pCount,type) values (
    'test lobby comp',
    1,
    'comp'
);
insert into curr_lobby (name,pCount,type) values (
    'test lobby coop',
    1,
    'coop'
);
insert into players (name,lID) values (
    'testplayer',
    1
);
insert into teams (name,lID) values (
    'testteam',
    2
);
insert into comp_lb (score,rank,pID) values (
    2000,
    1,
    1
);
insert into coop_lb (score,rank,tID) values (
    3000,
    1,
    1
);
