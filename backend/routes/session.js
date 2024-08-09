const express = require("express");
const routes = express.Router();


const dbo = require("../db/conn");

const ObjectId = require("mongodb").ObjectId;

routes.route("/session_set/:email").get(async function (req, res) {
    console.log("In /session_set, session is: ", req.session);

    if (!req.session.username) {
        console.log("No session found. Creating a new one!");

        // Fetch user data from the database
        let db_connect = dbo.getDb();
        let email = req.params.email;

        try {
            const user = await db_connect.collection("userAccounts").findOne({ email: email });

            if (user) {
                req.session.username = email;
                req.session.role = user.role; // Store the role in the session

                console.log("Fetched user data:", user);
                console.log("Session created with username: ", req.session.username);
                console.log("User role: ", req.session.role);

                const resultObj = { username: req.session.username, role: req.session.role };
                res.json(resultObj);
            } else {
                console.log("User not found");
                res.status(404).json({ message: "User not found" });
            }
        } catch (err) {
            console.error("Error retrieving user data:", err);
            res.status(500).json({ message: "Internal server error" });
        }
    } else {
        console.log("Session already existed!");
        const resultObj = { username: req.session.username, role: req.session.role };
        res.json(resultObj);
    }
});

routes.route("/session_get").get(async function (req, res) {
    console.log("in /session_get, session is: " + req.session);
    
    if (!req.session.username){
        console.log("No session set!")
    } else{
        console.log("Session is: " + req.session.username)
    }

    const resultObj = req.session.username;
    res.json(resultObj);
});

routes.route("/session_delete").get(async function (req, res) {
    console.log("in /session_delete, session is: " + req.session);

    req.session.destroy();
    
    let status = "No session set";

    const resultObj = { status: status };
    res.json(resultObj);
})

module.exports = routes;