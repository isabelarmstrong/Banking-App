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
        console.log("In transfer checking -> investments!");
        let db_connect = dbo.getDb();
        let email = req.params.email;
        let dollarAmount = req.body.dollar;
        let centAmount = req.body.cents;
        let transferAmount;

        if (isNaN(dollarAmount) || isNaN(centAmount)) {
            return res.status(400).json({ message: "Invalid dollar or cents value" });
        }

        dollarAmount = dollarAmount.toString();
        centAmount = centAmount.toString();

        transferAmount = dollarAmount + centAmount;

        transferAmount = parseInt(transferAmount);

        // Fetch current checking and savings values
        let userAccount = await db_connect.collection("userAccounts").findOne({ email: email });

        if (!userAccount) {
            return res.status(404).json({ message: "User not found" });
        }

        let checkingBalance = userAccount.checking;
        let investmentsBalance = userAccount.investments;

        // Check if the amount to transfer is valid
        if (checkingBalance >= transferAmount) {
            let newCheckingBalance = checkingBalance - transferAmount;
            let newInvestmentsBalance = investmentsBalance + transferAmount;

            // Update values in the database
            let result = await db_connect.collection("userAccounts").updateOne(
                { email: email },
                {
                    $set: {
                        checking: newCheckingBalance,
                        investments: newInvestmentsBalance
                    }
                }
            );

            if (result.modifiedCount > 0) {
                res.json({ message: "Successfully transferred amount!" });
                console.log("Successfully transferred amount!");
            } else {
                res.status(500).json({ message: "Failed to update account" });
            }
        } else {
            res.status(400).json({ message: "Insufficient funds" });
            console.log("Failed to transfer amount: Insufficient funds.");
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});


//transfer savings -> investments
recordRoutes.route("/savings/investments/:email").put(async (req, res) => {
    try {
        console.log("In transfer savings -> investments!");
        let db_connect = dbo.getDb();
        let email = req.params.email;
        let dollarAmount = req.body.dollar;
        let centAmount = req.body.cents;
        let transferAmount;

        if (isNaN(dollarAmount) || isNaN(centAmount)) {
            return res.status(400).json({ message: "Invalid dollar or cents value" });
        }

        dollarAmount = dollarAmount.toString();
        centAmount = centAmount.toString();

        transferAmount = dollarAmount + centAmount;

        transferAmount = parseInt(transferAmount);

        // Fetch current checking and savings values
        let userAccount = await db_connect.collection("userAccounts").findOne({ email: email });

        if (!userAccount) {
            return res.status(404).json({ message: "User not found" });
        }

        let investmentsBalance = userAccount.investments;
        let savingsBalance = userAccount.savings;

        // Check if the amount to transfer is valid
        if (savingsBalance >= transferAmount) {
            let newSavingsBalance = savingsBalance - transferAmount;
            let newInvestmentsBalance = investmentsBalance + transferAmount;

            // Update values in the database
            let result = await db_connect.collection("userAccounts").updateOne(
                { email: email },
                {
                    $set: {
                        investments: newInvestmentsBalance,
                        savings: newSavingsBalance
                    }
                }
            );

            if (result.modifiedCount > 0) {
                res.json({ message: "Successfully transferred amount!" });
                console.log("Successfully transferred amount!");
            } else {
                res.status(500).json({ message: "Failed to update account" });
            }
        } else {
            res.status(400).json({ message: "Insufficient funds" });
            console.log("Failed to transfer amount: Insufficient funds.");
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});


//transfer investments -> checking
recordRoutes.route("/investments/checking/:email").put(async (req, res) => {
    try {
        console.log("In transfer investments -> checking!");
        let db_connect = dbo.getDb();
        let email = req.params.email;
        let dollarAmount = req.body.dollar;
        let centAmount = req.body.cents;
        let transferAmount;

        if (isNaN(dollarAmount) || isNaN(centAmount)) {
            return res.status(400).json({ message: "Invalid dollar or cents value" });
        }

        dollarAmount = dollarAmount.toString();
        centAmount = centAmount.toString();

        transferAmount = dollarAmount + centAmount;

        transferAmount = parseInt(transferAmount);

        // Fetch current checking and savings values
        let userAccount = await db_connect.collection("userAccounts").findOne({ email: email });

        if (!userAccount) {
            return res.status(404).json({ message: "User not found" });
        }

        let checkingBalance = userAccount.checking;
        let investmentsBalance = userAccount.investments;

        // Check if the amount to transfer is valid
        if (investmentsBalance >= transferAmount) {
            let newInvestmentsBalance = investmentsBalance - transferAmount;
            let newCheckingBalance = checkingBalance + transferAmount;

            // Update values in the database
            let result = await db_connect.collection("userAccounts").updateOne(
                { email: email },
                {
                    $set: {
                        checking: newCheckingBalance,
                        investments: newInvestmentsBalance
                    }
                }
            );

            if (result.modifiedCount > 0) {
                res.json({ message: "Successfully transferred amount!" });
                console.log("Successfully transferred amount!");
            } else {
                res.status(500).json({ message: "Failed to update account" });
            }
        } else {
            res.status(400).json({ message: "Insufficient funds" });
            console.log("Failed to transfer amount: Insufficient funds.");
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});


//transfer investments -> savings
recordRoutes.route("/investments/savings/:email").put(async (req, res) => {
    try {
        console.log("In transfer investments -> savings!");
        let db_connect = dbo.getDb();
        let email = req.params.email;
        let dollarAmount = req.body.dollar;
        let centAmount = req.body.cents;
        let transferAmount;

        if (isNaN(dollarAmount) || isNaN(centAmount)) {
            return res.status(400).json({ message: "Invalid dollar or cents value" });
        }

        dollarAmount = dollarAmount.toString();
        centAmount = centAmount.toString();

        transferAmount = dollarAmount + centAmount;

        transferAmount = parseInt(transferAmount);

        // Fetch current checking and savings values
        let userAccount = await db_connect.collection("userAccounts").findOne({ email: email });

        if (!userAccount) {
            return res.status(404).json({ message: "User not found" });
        }

        let savingsBalance = userAccount.savings;
        let investmentsBalance = userAccount.investments;

        // Check if the amount to transfer is valid
        if (investmentsBalance >= transferAmount) {
            let newInvestmentsBalance = investmentsBalance - transferAmount;
            let newSavingsBalance = savingsBalance + transferAmount;

            // Update values in the database
            let result = await db_connect.collection("userAccounts").updateOne(
                { email: email },
                {
                    $set: {
                        savings: newSavingsBalance,
                        investments: newInvestmentsBalance
                    }
                }
            );

            if (result.modifiedCount > 0) {
                res.json({ message: "Successfully transferred amount!" });
                console.log("Successfully transferred amount!");
            } else {
                res.status(500).json({ message: "Failed to update account" });
            }
        } else {
            res.status(400).json({ message: "Insufficient funds" });
            console.log("Failed to transfer amount: Insufficient funds.");
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
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
            toAccount: req.body.toAccount,
            date: new Date().toLocaleDateString(), 
            time: new Date().toLocaleTimeString(),
        };

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