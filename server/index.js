import express from 'express';
import cors from 'cors';
import fs from 'fs';

const server = express();
server.use([cors(), express.json()]);

const tweets = fs.readFileSync('./server/storage/tweets.txt', 'utf8').toString().split(", ");
if (tweets[0] !== "") {
    for (let i = 0; i < tweets.length; i++) {
        const tweet = tweets[i];
        tweets[i] = JSON.parse(tweet);
    }
}

const users = fs.readFileSync('./server/storage/users.txt', 'utf8').toString().split(", ");
if (users[0] !== "") {
    for (let i = 0; i < users.length; i++) {
        const user = users[i];
        users[i] = JSON.parse(user);
    }
}

server.get("/tweets", (req, res) => {
    if (tweets.join('') === "") {
        res.send([]);
    }
    res.send(tweets.slice(-10));
});
server.post("/tweets", (req, res) => {
    const newTweet = req.body;
    const usernames = users.map(u => u.username);
    if (newTweet.username !== "" && usernames.includes(newTweet.username) && newTweet.tweet !== "") {
        if (tweets[0] === "") {
            tweets[0] = newTweet;
            fs.appendFileSync('./server/storage/tweets.txt', JSON.stringify(newTweet));
        } else {
            tweets.push(newTweet);
            fs.appendFileSync('./server/storage/tweets.txt', `, ${JSON.stringify(newTweet)}`);    
        }
        res.status(201).send("Pensamento da sua cabeça adicionado com sucesso!");
    } else {
        res.status(400).send("Todos os campos são obrigatórios!");
    }
});

server.post("/sign-up", (req, res) => {
    const newUser = req.body;
    if (newUser.username !== "" && validUrl(newUser.avatar)) {
        if (users[0] === "") {
            users[0] = newUser;
            fs.appendFileSync('./server/storage/users.txt', JSON.stringify(newUser));
        } else {
            users.push(newUser);
            fs.appendFileSync('./server/storage/users.txt', `, ${JSON.stringify(newUser)}`);
        }
        res.status(201).send("Usuário cadastrado com sucesso!");
    } else {
        res.status(400).send("Todos os campos são obrigatórios!")
    }
});

function validUrl(string) {
    let url;
    try {
      url = new URL(string);
    } catch (_) {
      return false;  
    }
    return url.protocol === "http:" || url.protocol === "https:";
  }

console.log("Servidor pronto para ouvir as fofocas na porta 5000!");

server.listen(5000);