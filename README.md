# automataTest

Another test project. Using [hyperandroid/Automata](https://github.com/hyperandroid/Automata) to imulate some kinda quiz game.
- Service waits for six users to be connected. then it generates som random number from 1 to 10 - the correct answer. 
- Server picks one random user and offers him to choose correct number.
- Server waits 5 seconds user to make a decission.
- If user answer is correct, then game overs, user has won and all are happy!
- If user answer is not correct, server picks another user, until all of six will be picked.

To test:
```
npm install
tsc
npm run start
```
and open 
[html/test.html](https://github.com/flour/automataTest/blob/master/html/test.html)
