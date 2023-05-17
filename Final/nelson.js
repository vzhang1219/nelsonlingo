require('dotenv').config();
const http = require("http");
const express = require("express");
const path = require("path");
const bodyparser = require("body-parser");
process.stdin.setEncoding("utf8");
const port = 5001;
const app = express();
const { argv } = require('process');
const fs = require('fs');
const { MongoClient, ServerApiVersion } = require('mongodb');
app.use(bodyparser.urlencoded({extended:false}));

const username = process.env.MONGO_DB_USERNAME;
const password = process.env.MONGO_DB_PASSWORD;
const dbName = process.env.MONGO_DB_NAME;
const collectionName = process.env.MONGO_COLLECTION;
const databaseCollection = {
	db: dbName,
	collection: collectionName,
};

const url = `mongodb+srv://gshevchu:${password}@cluster0.yoyqm3z.mongodb.net/?retryWrites=true&w=majority`
const client = new MongoClient(url, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	serverApi: ServerApiVersion.v1,
});

process.stdin.on('readable', () => {
	let data = process.stdin.read();
    let action = data.trim();
	if (data !== null) {
        if (action === "stop") {
			console.log("Shutting down the server");
            process.exit(0);
        } else {
			console.log(`Invalid command: ${action}`);
		}
    }
    process.stdin.resume();
});

app.listen(port, function () {
    console.log("Web server started and running at http://localhost:5001");
});

app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");

app.use( express.static( "public" ) );

app.get('/', (req, res) => {
	res.render('index');
});

app.post('/result', async (req, res) => {
    let { phrase, definition } = req.body;
	try {
		await client.connect();
		const phrasesCollection = client
			.db(databaseCollection.db)
			.collection(databaseCollection.collection);

		await phrasesCollection.insertOne({
			phrase: phrase,
			definition: definition
		});
		await client.close();
        //let definition = phrasesCollection.find(element => element.phrase == phrase);
		return res.render('result', {
			phrase: phrase,
            definition: definition,
		});
	} catch (error) {
		console.error(error);
	}
});

app.get('/history', (req, res) => {
	res.render('history');
})

app.post('/historyResult', async (req, res) => {
	try {
		await client.connect();
		const cursor = client
			.db(databaseCollection.db)
			.collection(databaseCollection.collection)
			.find({});
		
		const phrases = await cursor.toArray();
		res.render('historyResult', { phrases });
		//await client.close();
		
	} catch (error) {
		console.error(error);
	}
});

app.get('/remove', (req, res) => {
	res.render('remove');
});

app.post('/processRemove', async (req, res) => {
	try {
		await client.connect();
		const count = await client
			.db(databaseCollection.db)
			.collection(databaseCollection.collection)
			.deleteMany({});

		await client.close();
		return res.render('processRemove');
	} catch (error) {
		console.error(error);
	}
});
