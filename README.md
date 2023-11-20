# week-7-student-mvp-project


Schema:
1. current lobby has serial id, name, player count, public, type, and host values
2. each lobby is referenced by many players by only by one team
3. players table has serial id, name, session/socket id, points, and lobby id values
4. teams table has serial id, name, points, and lobby id values
5. each player has one rank slot in the competitive leaderboard
6. the competitive leaderboard has serial id, score, rank, and player id values
7. each team has one rank slot in the cooperative leaderboard
8. the cooperative leaderboard has serial id, score, rank, and team id values


![ERD](https://github.com/lukep258/week-7-student-mvp-project/assets/143543147/0c822c1c-5ded-4644-9203-7a5b10167676)
