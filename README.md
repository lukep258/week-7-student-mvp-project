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
![image](https://github.com/lukep258/week-7-student-mvp-project/assets/143543147/62268bed-54dc-4c3a-bcaa-e2d6557cf428)
![image](https://github.com/lukep258/week-7-student-mvp-project/assets/143543147/417e66b8-de4f-45ea-85cb-c1d7d168eb68)
![image](https://github.com/lukep258/week-7-student-mvp-project/assets/143543147/6d2d7321-a82c-4a7c-bf60-7abb0cec8f08)
![image](https://github.com/lukep258/week-7-student-mvp-project/assets/143543147/1f85fc78-7e10-4cb2-be2b-3d01a847212f)
![image](https://github.com/lukep258/week-7-student-mvp-project/assets/143543147/9d1fb63b-14d9-4ac2-850b-3a5c39218c85)
![image](https://github.com/lukep258/week-7-student-mvp-project/assets/143543147/5e49e139-e0c0-4959-9831-47fb26fe7734)

