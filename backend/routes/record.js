const express = require("express");

/* 
    TO DO:
-Add investments account
    -be able to withdraw/deposit
    -be able to transfer to and from account to other accounts
*/
 
// recordRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /record.
const recordRoutes = express.Router();
 
// This will help us connect to the database
const dbo = require("../db/conn");
 
// This helps convert the id from string to ObjectId for the _id.
const ObjectId = require("mongodb").ObjectId;
 
 
// This section will help you get a list of all user accounts without the passwords.
recordRoutes.route("/userAccounts").get(async (req, res) => {
    try{
        console.log("In get route...");
        let db_connect = dbo.getDb("users");
        const result = await db_connect.collection("userAccounts").find({}).project({_id: 0, password: 0}).toArray();
        console.log("Got result!");
        res.json(result);
    } catch(err){
        throw err;
    }
});
 
// This section will help you get records by role
recordRoutes.route("/userAccounts/role/:role").get(async (req, res) => {
    try{
        console.log("in get role route");
        let db_connect = dbo.getDb();
        let query = req.params.role;

        const result = await db_connect.collection("userAccounts").find({role: query}).project({_id: 0, password: 0}).toArray();
        console.log(result);
        res.json(result);
    } catch(err){
        throw err;
    }
});

//update the role of a user
recordRoutes.route("/changeRole/:email/:role").put(async (req, res) => {
    try{
        console.log("In update role!")
        let db_connect = dbo.getDb();
        let email = req.params.email;
        let role = req.params.role;

        newval = {
            $set: {
                role: role,
            },
        };

        const result = db_connect.collection("userAccounts").updateOne({email: email}, newval);
        res.json(result);
        console.log("Updated user's role!")
    } catch(err){
        throw err;
    }
});

//Gets a specific user by email and password
recordRoutes.route("/userAccounts/:email/:password").get(async (req, res) => {
    try{
        console.log("in get account route");
        let db_connect = dbo.getDb();
        let email = req.params.email;
        let pass = req.params.password;

        const result = await db_connect.collection("userAccounts").find({email: email, password: pass}).project({_id: 0, password: 0}).toArray();
        console.log(result);
        res.json(result);
    } catch(err){
        throw err;
    }
});

//gets a specific user by email
recordRoutes.route("/userAccounts/:email").get(async (req, res) => {
    try{
        console.log("in get account route");
        let db_connect = dbo.getDb();
        let email = req.params.email;

        const result = await db_connect.collection("userAccounts").find({email: email}).project({_id: 0, password: 0, role: 0}).toArray();
        console.log(result);
        res.json(result);
    } catch(err){
        throw err;
    }
});
 
// This section will help you create a new record.
recordRoutes.route("/userAccounts/add").post(async (req, res) => {
    try{
        console.log("Adding a new account!!")
        let db_connect = dbo.getDb();
        db_connect.collection("userAccounts").createIndex( { email: 1 }, { unique: true } ) //make it so that email is unique
        let myobj = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        role: req.body.role,
        password: req.body.password,
        email: req.body.email,
        phone: req.body.phone,
        checking: req.body.checking,
        savings: req.body.savings,
        investments: req.body.investments,
        };
        const result = await db_connect.collection("userAccounts").insertOne(myobj);
        res.json(result);
    } catch(err){
        if (err.code === 11000){
            console.error(err);
        }else {
            throw err;
        }
    }
});

// deposit into savings by email
recordRoutes.route("/savings/deposit/:email").put(async (req, res) => {
    try{
        console.log("In update savings!")
        let db_connect = dbo.getDb();
        let query = req.params.email;
        let givendollar = req.body.dollar;
        let givencents = req.body.cents;
        let givenval;
        let oldval;
        let newval;

        givendollar = givendollar.toString();
        givencents = givencents.toString();

        givenval = givendollar + givencents;

        givenval = parseInt(givenval);
        
        //get the value in checking currently stored
        let val = await db_connect.collection("userAccounts").find({email: query}).project({savings:1, _id:0}).toArray();

        val = JSON.stringify(val);

        for (let i = 0; i < val.length; i++){
            newval = parseInt(val.charAt(i));

            if (!isNaN(newval)){
                if (oldval == undefined){
                    oldval = val.charAt(i);
                } else{
                    oldval += val.charAt(i);
                }
            }
        }

        //create the new amount
        oldval = parseFloat((parseInt(oldval)/100).toFixed(2));
        givenval = parseFloat((givenval/100).toFixed(2));

        newval = parseInt((oldval + givenval).toFixed(2).replace(".", ""));

        newval = {
            $set: {
                savings: newval,
            },
        };

        const result = db_connect.collection("userAccounts").updateOne({email: query}, newval);
        res.json(result);
        console.log("Deposited!")
    } catch(err){
        throw err;
    }
});

// deposit into checking by email
recordRoutes.route("/checking/deposit/:email").put(async (req, res) => {
    try{
        console.log("In deposit checking!")
        let db_connect = dbo.getDb();
        let query = req.params.email;
        let givendollar = req.body.dollar;
        let givencents = req.body.cents;
        let givenval;
        let oldval;
        let newval;

        givendollar = givendollar.toString();
        givencents = givencents.toString();

        givenval = givendollar + givencents;

        givenval = parseInt(givenval);

        //get the value in checking currently stored
        let val = await db_connect.collection("userAccounts").find({email: query}).project({checking:1, _id:0}).toArray();

        val = JSON.stringify(val);

        for (let i = 0; i < val.length; i++){
            newval = parseInt(val.charAt(i));

            if (!isNaN(newval)){
                if (oldval == undefined){
                    oldval = val.charAt(i);
                } else{
                    oldval += val.charAt(i);
                }
            }
        }

        //create the new amount
        oldval = parseFloat((parseInt(oldval)/100).toFixed(2));
        givenval = parseFloat((givenval/100).toFixed(2));

        newval = parseInt((oldval + givenval).toFixed(2).replace(".", ""));

        newval = {
            $set: {
                checking: newval,
            },
        };

        const result = db_connect.collection("userAccounts").updateOne({email: query}, newval);
        res.json(result);
        console.log("Deposited!")
    } catch(err){
        throw err;
    }
});

//withdraw from checking
recordRoutes.route("/checking/withdraw/:email").put(async (req, res) => {
    try{
        console.log("In update checking!")
        let db_connect = dbo.getDb();
        let query = req.params.email;
        let givendollar = req.body.dollar;
        let givencents = req.body.cents;
        let givenval;
        let oldval;
        let newval;

        givendollar = givendollar.toString();
        givencents = givencents.toString();

        givenval = givendollar + givencents;

        givenval = parseInt(givenval);

        //get the value in checking currently stored
        let val = await db_connect.collection("userAccounts").find({email: query}).project({checking:1, _id:0}).toArray();

        val = JSON.stringify(val);

        for (let i = 0; i < val.length; i++){
            newval = parseInt(val.charAt(i));

            if (!isNaN(newval)){
                if (oldval == undefined){
                    oldval = val.charAt(i);
                } else{
                    oldval += val.charAt(i);
                }
            }
        }

        //create the new amount
        oldval = parseFloat((parseInt(oldval)/100).toFixed(2));
        givenval = parseFloat((givenval/100).toFixed(2));

        newval = oldval - givenval;

        if (newval >= 0){
            newval = parseInt((newval).toFixed(2).replace(".", ""));

            newval = {
                $set: {
                    checking: newval,
                },
            };

            const result = db_connect.collection("userAccounts").updateOne({email: query}, newval);
            res.json(result);
            console.log("Sucessfully withdrew amount from checking!");            
        } else{
            console.log("Failed to withdraw amount from savings.");
        }

    } catch(err){
        throw err;
    }
});

//withdraw from savings
recordRoutes.route("/savings/withdraw/:email").put(async (req, res) => {
    try{
        console.log("In update checking!")
        let db_connect = dbo.getDb();
        let query = req.params.email;
        let givendollar = req.body.dollar;
        let givencents = req.body.cents;
        let givenval;
        let oldval;
        let newval;

        givendollar = givendollar.toString();
        givencents = givencents.toString();

        givenval = givendollar + givencents;

        givenval = parseInt(givenval);

        //get the value in checking currently stored
        let val = await db_connect.collection("userAccounts").find({email: query}).project({savings:1, _id:0}).toArray();

        val = JSON.stringify(val);

        for (let i = 0; i < val.length; i++){
            newval = parseInt(val.charAt(i));

            if (!isNaN(newval)){
                if (oldval == undefined){
                    oldval = val.charAt(i);
                } else{
                    oldval += val.charAt(i);
                }
            }
        }

        //create the new amount
        oldval = parseFloat((parseInt(oldval)/100).toFixed(2));
        givenval = parseFloat((givenval/100).toFixed(2));

        newval = oldval - givenval;

        if (newval >= 0){
            newval = parseInt((newval).toFixed(2).replace(".", ""));

            newval = {
                $set: {
                    savings: newval,
                },
            };

            const result = db_connect.collection("userAccounts").updateOne({email: query}, newval);
            res.json(result);
            console.log("Sucessfully withdrew amount from savings!");            
        } else{
            console.log("Failed to withdraw amount from savings.");
        }

    } catch(err){
        throw err;
    }
});


//transfer checking -> savings
recordRoutes.route("/checking/savings/:email").put(async (req, res) => {
    try{
        console.log("In checking -> savings!")
        let db_connect = dbo.getDb();
        let query = req.params.email;
        let givenval = req.body.savings;
        let oldval;
        let newSavingsVal;
        let newCheckingVal;

        //get the value in checking currently stored
        let val = await db_connect.collection("userAccounts").find({email: query}).project({checking:1, _id:0}).toArray();

        val = JSON.stringify(val);

        for (let i = 0; i < val.length; i++){
            newCheckingVal = parseInt(val.charAt(i));

            if (!isNaN(newCheckingVal)){
                if (oldval == undefined){
                    oldval = val.charAt(i);
                } else{
                    oldval += val.charAt(i);
                }
            }
        }

        //check that the amount being transferred out doesn't exceed funds
        oldval = parseFloat((parseInt(oldval)/100).toFixed(2));
        givenval = parseFloat((givenval/100).toFixed(2));

        newCheckingVal = oldval - givenval;

        if (newCheckingVal >= 0){

            //find current savings val
            val = await db_connect.collection("userAccounts").find({email: query}).project({savings:1, _id:0}).toArray();

            val = JSON.stringify(val);
            oldval = undefined;

            for (let i = 0; i < val.length; i++){
                newSavingsVal = parseInt(val.charAt(i));

                if (!isNaN(newSavingsVal)){
                    if (oldval == undefined){
                        oldval = val.charAt(i);
                    } else{
                        oldval += val.charAt(i);
                    }
                }
            }

            oldval = parseFloat((parseInt(oldval)/100).toFixed(2));

            newSavingsVal = oldval + givenval;

            //save values
            newCheckingVal = parseInt((newCheckingVal).toFixed(2).replace(".", ""));
            newSavingsVal = parseInt((newSavingsVal).toFixed(2).replace(".", ""));

            let newval = {
                $set: {
                    savings: newSavingsVal,
                    checking: newCheckingVal,
                },
            };

            const result = db_connect.collection("userAccounts").updateOne({email: query}, newval);
            res.json(result);
            console.log("Sucessfully transferred amount!");            
        } else{
            console.log("Failed to transfer amount.");
        }

    } catch(err){
        throw err;
    }
});

//transfer savings -> checking
recordRoutes.route("/savings/checking/:email").put(async (req, res) => {
    try{
        console.log("In savings -> checking!")
        let db_connect = dbo.getDb();
        let query = req.params.email;
        let givenval = req.body.checking;
        let oldval;
        let newSavingsVal;
        let newCheckingVal;

        //get the value in savings currently stored
        let val = await db_connect.collection("userAccounts").find({email: query}).project({savings:1, _id:0}).toArray();

        val = JSON.stringify(val);

        for (let i = 0; i < val.length; i++){
            newSavingsVal = parseInt(val.charAt(i));

            if (!isNaN(newSavingsVal)){
                if (oldval == undefined){
                    oldval = val.charAt(i);
                } else{
                    oldval += val.charAt(i);
                }
            }
        }

        //check that the amount being transferred out doesn't exceed funds
        oldval = parseFloat((parseInt(oldval)/100).toFixed(2));
        givenval = parseFloat((givenval/100).toFixed(2));

        newSavingsVal = oldval - givenval;

        if (newSavingsVal >= 0){

            //find current checking val
            val = await db_connect.collection("userAccounts").find({email: query}).project({checking:1, _id:0}).toArray();

            val = JSON.stringify(val);
            oldval = undefined;

            for (let i = 0; i < val.length; i++){
                newCheckingVal = parseInt(val.charAt(i));

                if (!isNaN(newCheckingVal)){
                    if (oldval == undefined){
                        oldval = val.charAt(i);
                    } else{
                        oldval += val.charAt(i);
                    }
                }
            }

            oldval = parseFloat((parseInt(oldval)/100).toFixed(2));

            newCheckingVal = oldval + givenval;

            //save values
            newCheckingVal = parseInt((newCheckingVal).toFixed(2).replace(".", ""));
            newSavingsVal = parseInt((newSavingsVal).toFixed(2).replace(".", ""));

            let newval = {
                $set: {
                    savings: newSavingsVal,
                    checking: newCheckingVal,
                },
            };

            const result = db_connect.collection("userAccounts").updateOne({email: query}, newval);
            res.json(result);
            console.log("Sucessfully transferred amount!");            
        } else{
            console.log("Failed to transfer amount.");
        }

    } catch(err){
        throw err;
    }
});

 

 
module.exports = recordRoutes;