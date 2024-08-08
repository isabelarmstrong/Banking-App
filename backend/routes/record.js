const express = require("express");
const encrypt = require('crypto');

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
        let pass = encrypt.createHash('sha256').update(req.params.password).digest('hex');

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

        password = encrypt.createHash('sha256').update(req.body.password).digest('hex');

        let myobj = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        role: req.body.role,
        password: password,
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

/*--------------------------------------Leslie's Update--------------------------*/
/*--------------------------------------Leslie's Update--------------------------*/
// deposit into investments by email
recordRoutes.route("/investments/deposit/:email").put(async (req, res) => {
    try{
        console.log("In update investments!")
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
        let val = await db_connect.collection("userAccounts").find({email: query}).project({investments:1, _id:0}).toArray();

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
                investments: newval,
            },
        };

        const result = db_connect.collection("userAccounts").updateOne({email: query}, newval);
        res.json(result);
        console.log("Deposited!")
    } catch(err){
        throw err;
    }
});

//withdraw from investments
recordRoutes.route("/investments/withdraw/:email").put(async (req, res) => {
    try{
        console.log("In update investment(withdraw)!")
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
        let val = await db_connect.collection("userAccounts").find({email: query}).project({investments:1, _id:0}).toArray();

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
                    investments: newval,
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

//transfer checking -> investments
recordRoutes.route("/checking/investments/:email").put(async (req, res) => {
    try {
        console.log("In checking -> investments!");
        let db_connect = dbo.getDb();
        let query = req.params.email;
        let transferAmount = req.body.investments; // Expect this to be in cents

        // Retrieve current checking and investments values
        let user = await db_connect.collection("userAccounts").findOne({ email: query });

        if (!user) {
            return res.status(404).send("User not found");
        }

        let checkingBalance = user.checking || 0;
        let investmentsBalance = user.investments || 0;

        // Check that the transfer amount is valid
        if (typeof transferAmount !== 'number' || transferAmount <= 0) {
            return res.status(400).send("Invalid transfer amount");
        }

        if (checkingBalance < transferAmount) {
            return res.status(400).send("Insufficient funds");
        }

        // Calculate new balances
        let newCheckingBalance = checkingBalance - transferAmount;
        let newInvestmentsBalance = investmentsBalance + transferAmount;

        // Update the balances in the database
        let result = await db_connect.collection("userAccounts").updateOne(
            { email: query },
            {
                $set: {
                    checking: newCheckingBalance,
                    investments: newInvestmentsBalance,
                },
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).send("User not found");
        }

        res.status(200).json({ message: "Successfully transferred amount" });
        console.log("Successfully transferred amount!");
        
    } catch (err) {
        console.error(err);
        res.status(500).send("An error occurred");
    }
});


//transfer savings -> checking
recordRoutes.route("/savings/investments/:email").put(async (req, res) => {
    try {
        console.log("In savings -> investments!");

        let db_connect = dbo.getDb();
        let email = req.params.email;
        let transferAmount = req.body.investments; // Expect this to be in cents

        // Retrieve current savings and investments values
        let user = await db_connect.collection("userAccounts").findOne({ email: email });

        if (!user) {
            return res.status(404).send("User not found");
        }

        let savingsBalance = user.savings || 0;
        let investmentsBalance = user.investments || 0;

        // Validate transfer amount
        if (typeof transferAmount !== 'number' || transferAmount <= 0) {
            return res.status(400).send("Invalid transfer amount");
        }

        if (savingsBalance < transferAmount) {
            return res.status(400).send("Insufficient funds");
        }

        // Calculate new balances
        let newSavingsBalance = savingsBalance - transferAmount;
        let newInvestmentsBalance = investmentsBalance + transferAmount;

        // Update the balances in the database
        let result = await db_connect.collection("userAccounts").updateOne(
            { email: email },
            {
                $set: {
                    savings: newSavingsBalance,
                    investments: newInvestmentsBalance,
                },
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).send("User not found");
        }

        res.status(200).json({ message: "Successfully transferred amount" });
        console.log("Successfully transferred amount!");

    } catch (err) {
        console.error(err);
        res.status(500).send("An error occurred");
    }
});


//transfer investments -> checking
recordRoutes.route("/investments/checking/:email").put(async (req, res) => {
    try {
        console.log("In investments -> checking!");

        let db_connect = dbo.getDb();
        let email = req.params.email;
        let transferAmount = req.body.checking; // Amount to transfer from investments to checking (in cents)

        // Retrieve current investments and checking values
        let user = await db_connect.collection("userAccounts").findOne({ email: email });

        if (!user) {
            return res.status(404).send("User not found");
        }

        let investmentsBalance = user.investments || 0;
        let checkingBalance = user.checking || 0;

        // Validate transfer amount
        if (typeof transferAmount !== 'number' || transferAmount <= 0) {
            return res.status(400).send("Invalid transfer amount");
        }

        if (investmentsBalance < transferAmount) {
            return res.status(400).send("Insufficient funds in investments");
        }

        // Calculate new balances
        let newInvestmentsBalance = investmentsBalance - transferAmount;
        let newCheckingBalance = checkingBalance + transferAmount;

        // Update the balances in the database
        let result = await db_connect.collection("userAccounts").updateOne(
            { email: email },
            {
                $set: {
                    investments: newInvestmentsBalance,
                    checking: newCheckingBalance,
                },
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).send("User not found");
        }

        res.status(200).json({ message: "Successfully transferred amount" });
        console.log("Successfully transferred amount!");

    } catch (err) {
        console.error(err);
        res.status(500).send("An error occurred");
    }
});


//transfer investments -> savings
recordRoutes.route("/investments/savings/:email").put(async (req, res) => {
    try {
        console.log("In investments -> savings!");

        let db_connect = dbo.getDb();
        let email = req.params.email;
        let transferAmount = parseInt(req.body.transferAmount); // Amount to transfer from investments to savings (in cents)

        // Retrieve current investments and savings values
        let user = await db_connect.collection("userAccounts").findOne({ email: email });

        if (!user) {
            return res.status(404).send("User not found");
        }

        let investmentsBalance = user.investments || 0;
        let savingsBalance = user.savings || 0;

        // Validate transfer amount
        if (typeof transferAmount !== 'number' || transferAmount <= 0) {
            return res.status(400).send("Invalid transfer amount");
        }

        if (investmentsBalance < transferAmount) {
            return res.status(400).send("Insufficient funds in investments");
        }

        // Calculate new balances
        let newInvestmentsBalance = investmentsBalance - transferAmount;
        let newSavingsBalance = savingsBalance + transferAmount;

        // Update the balances in the database
        let result = await db_connect.collection("userAccounts").updateOne(
            { email: email },
            {
                $set: {
                    investments: newInvestmentsBalance,
                    savings: newSavingsBalance,
                },
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).send("User not found");
        }

        res.status(200).json({ message: "Successfully transferred amount" });
        console.log("Successfully transferred amount!");

    } catch (err) {
        console.error(err);
        res.status(500).send("An error occurred");
    }
});

/*
recordRoutes.put('/:fromAccount/:toAccount/:email').put(async (req, res) => {
    try {
        const { fromAccount, toAccount, email } = req.params;
        const amountInCents = req.body.amount; // Amount in cents

        if (!fromAccount || !toAccount || !email || !amountInCents) {
            return res.status(400).json({ error: 'Missing required parameters.' });
        }

        let db_connect = dbo.getDb();

        // Get current balances
        const user = await db_connect.collection('userAccounts').findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        let fromAccountBalance = user[fromAccount];
        let toAccountBalance = user[toAccount];

        if (fromAccount === toAccount) {
            return res.status(400).json({ error: 'From and To accounts cannot be the same.' });
        }

        if (fromAccountBalance < amountInCents) {
            return res.status(400).json({ error: 'Insufficient funds.' });
        }

        // Update balances
        const updatedFromAccountBalance = fromAccountBalance - amountInCents;
        const updatedToAccountBalance = toAccountBalance + amountInCents;

        // Update the database
        const result = await db_connect.collection('userAccounts').updateOne(
            { email },
            {
                $set: {
                    [`${fromAccount}`]: updatedFromAccountBalance,
                    [`${toAccount}`]: updatedToAccountBalance
                }
            }
        );

        res.json({ success: true, result });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

*/


//Transfers money from checking/savings/investments to the other checkings/savings/investments within an account associated
// with an email address. Does not transfer to other user accounts. Like before, the transfer cannot
// exceed funds. If the withdrawal is successful return a successful message. Otherwise return a failure messages.
recordRoutes.route("/transfer/:emailAddress").put(async (req, res) => {
    try {
        // Connect to the database
        let db_connect = dbo.getDb();
        const fromAccount = req.body.fromAccount;
        const toAccount = req.body.toAccount;
        const transferAmount = req.body.transferAmount;
        const emailAddress = req.params.emailAddress;

        // Validate account types
        const validAccountTypes = ["savings", "checking", "investments"];
        if (!validAccountTypes.includes(fromAccount) || !validAccountTypes.includes(toAccount)) {
            return res.send("Invalid account type. Valid account types are savings and checking.");
        }

        // Ensure the fromAccount and toAccount are different
        if (fromAccount === toAccount) {
            return res.send("fromAccount and toAccount must be different");
        }

        // Validate amount
        if (typeof transferAmount !== "number" || transferAmount <= 0) {
            return res.send("Amount must be a positive integer representing total cents");
        }

        // Retrieve the current balances
        const result = await db_connect.collection("records").findOne({ emailAddress: emailAddress });
        if (!result) {
            return res.send("Account not found");
        }

        let fromBalance = result[fromAccount + 'Account'] || 0;
        let toBalance = result[toAccount + 'Account'] || 0;

        // Check if the transfer is possible
        if (fromBalance < transferAmount) {
            return res.send("Insufficient funds for the transfer");
        }

        // Calculate new balances
        let newFromBalance = fromBalance - transferAmount;
        let newToBalance = toBalance + transferAmount;

        // Update the account balances
        const updateResult = await db_connect.collection("records").updateOne(
            { emailAddress: emailAddress },
            {
                $set: {
                    [fromAccount + 'Account']: newFromBalance,
                    [toAccount + 'Account']: newToBalance
                }
            }
        );

        if (updateResult.matchedCount === 0) {
            return res.send("Account not found");
        }

        //res.json(result);
        res.status(200).send(`Transferred ${transferAmount} cents from ${fromAccount} to ${toAccount}. New ${fromAccount} balance: ${newFromBalance} cents. New ${toAccount} balance: ${newToBalance} cents.`);
    } catch (err) {
       throw err;
    }
});

//create the transaction history record //add
recordRoutes.route("/transactionHistory/add").post(async (req, res) => {
    try {
        console.log("Adding a new transaction to the history!!");
        let db_connect = dbo.getDb();

        // Build the transaction object
        let newTransaction = {
            action: req.body.action,
            amount: req.body.amount,
            fromAccount: req.body.fromAccount,
            date: new Date().toLocaleDateString(), 
            time: new Date().toLocaleTimeString(),
        };

        if (req.body.action === "transfer") {
            newTransaction.toAccount = req.body.toAccount;
        }

        // Update the user's document by pushing the new transaction to the transactions array
        const result = await db_connect.collection("accountHistory").updateOne(
            { emailAddress: req.body.emailAddress },
            { $push: { transactions: newTransaction } },
            { upsert: true } // Create the document if it doesn't exist
        );

        res.json(result);
    } catch (err) {
        console.error("Error adding transaction history:", err);
        res.status(500).json({ error: "An error occurred while adding transaction history" });
    }
});


//retrieving a specific user's transaction history
recordRoutes.route("/transactionHistory/:emailAddress").get(async (req, res) => {
    try {
        let db_connect = dbo.getDb();
        const userHistory = await db_connect.collection("accountHistory").findOne({ emailAddress: req.params.emailAddress });
        
        if (userHistory) {
            // Sort the transactions array by date and time in descending order
            userHistory.transactions.sort((a, b) => {
                let dateA = new Date(`${a.date} ${a.time}`);
                let dateB = new Date(`${b.date} ${b.time}`);
                return dateB - dateA; // Sort in descending order
            });
            res.json(userHistory);
        } else {
            res.status(404).json({ error: "User not found" });
        }
    } catch (err) {
        console.error("Error retrieving transaction history:", err);
        res.status(500).json({ error: "An error occurred while retrieving transaction history" });
    }
});


//clear the record(for testing purposes)
recordRoutes.route("/transactionHistory/clear").post(async (req, res) => {
    try {
        let db_connect = dbo.getDb();
        const result = await db_connect.collection("accountHistory").updateOne(
            { emailAddress: req.body.emailAddress },
            { $set: { transactions: [] } }
        );

        if (result.matchedCount === 0) {
            res.status(404).json({ error: "User not found" });
        } else {
            res.json({ message: "Transaction history cleared" });
        }
    } catch (err) {
        console.error("Error clearing transaction history:", err);
        res.status(500).json({ error: "An error occurred while clearing transaction history" });
    }
});

/*--------------------------------------End of Leslie's Update--------------------------*/


//Transfers money from user to another user.
recordRoutes.route("/transfer-to-another-account").put(async (req, res) => {
    try {
        let db_connect = dbo.getDb();
        const fromEmail = req.body.fromEmail; // Email of the sender
        const toEmail = req.body.toEmail; // Email of the receiver
        const fromAccount = req.body.fromAccount; // Account type of the sender (checking/savings/investments)
        const toAccount = req.body.toAccount; // Account type of the receiver (checking/savings/investments)
        const transferAmount = req.body.transferAmount; // Amount to be transferred

        // Validate account types
        const validAccountTypes = ["savings", "checking", "investments"];
        if (!validAccountTypes.includes(fromAccount) || !validAccountTypes.includes(toAccount)) {
            return res.status(400).send("Invalid account type. Valid account types are savings, checking, and investments.");
        }

        // Validate amount
        if (typeof transferAmount !== "number" || transferAmount <= 0) {
            return res.status(400).send("Amount must be a positive number.");
        }

        // Retrieve the sender's account details
        const sender = await db_connect.collection("userAccounts").findOne({ email: fromEmail });
        if (!sender) {
            return res.status(404).send("Sender account not found.");
        }

        // Retrieve the receiver's account details
        const receiver = await db_connect.collection("userAccounts").findOne({ email: toEmail });
        if (!receiver) {
            return res.status(404).send("Receiver account not found.");
        }

        // Check if the sender has sufficient funds
        let senderBalance = sender[fromAccount] || 0;
        if (senderBalance < transferAmount) {
            return res.status(400).send("Insufficient funds for the transfer.");
        }

        // Calculate new balances for the sender
        let newSenderBalance = senderBalance - transferAmount;

        // Calculate new balances for the receiver
        let receiverBalance = receiver[toAccount] || 0;
        let newReceiverBalance = receiverBalance + transferAmount;

        // Update the sender's account balance
        await db_connect.collection("userAccounts").updateOne(
            { email: fromEmail },
            {
                $set: {
                    [fromAccount]: newSenderBalance
                }
            }
        );

        // Update the receiver's account balance
        await db_connect.collection("userAccounts").updateOne(
            { email: toEmail },
            {
                $set: {
                    [toAccount]: newReceiverBalance
                }
            }
        );

        res.status(200).send(`Transferred ${transferAmount} from ${fromEmail}'s ${fromAccount} to ${toEmail}'s ${toAccount}.`);
    } catch (err) {
        console.error(err);
        res.status(500).send("An error occurred during the transfer.");
    }
});



 

 
module.exports = recordRoutes;