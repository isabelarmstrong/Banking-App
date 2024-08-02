const express = require("express");
const app = express();
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo");

require("dotenv").config({ path: "./config.env" });

app.use(session(
    {
        secret: "keyboard cat",
        saveUninitialized:false, //don't create sessions until something is stored
        resave: false, //don't save session if unmodified
        store: MongoStore.create({
            mongoUrl: process.env.ATLAS_URI
        })
    }
))

app.use(cors(
    {
        origin: "http://localhost:3000",
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        credentials:true,
        optionsSuccessStatus: 204,
        allowedHeaders: ["Content-Type", "Authorization"],
    }
));

const dbo = require("./db/conn");

app.use(express.json());
app.use(require("./routes/record"));
app.use(require("./routes/session"));


const port = process.env.PORT; //states to go into the config.env file and find PORT

app.get("/", (req, res) =>{
    res.send("Hello, World!");
});

// Function to create the initial words document
const createAccountHistoryDocument = async () => {
    try {
        let db_connect = dbo.getDb();
        const existingDocument = await db_connect.collection("words").findOne({});
        if (!existingDocument) {
            const initialWordsDocument = { listOfWords: [] };
            await db_connect.collection("accountHistory").insertOne(initialWordsDocument);
            console.log("Account History document created.");
        } else {
            console.log("Account History document already exists.");
        }
    } catch (err) {
        console.error("Error creating Account History document:", err);
    }
};


app.listen(port, () => {
    dbo.connectToServer(async (err) =>{
        if(err){
            console.err(err);
        }else {
            await createAccountHistoryDocument();
        }
    });

    console.log(`Server is running on port ${port}`);
});

