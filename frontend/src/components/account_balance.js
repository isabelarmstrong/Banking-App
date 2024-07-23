import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

//One react component for the entire table (Records)
//Another react component for each row of the result set (Record)

const Record = (props) => (
    
    <tr>
        <td>{props.record.checking}</td>
        <td>{props.record.savings}</td>
    </tr>
);

export default function AccountSummary() {
    const [records, setRecords] = useState([]);

    const [form, setForm] = useState({
        account: "",
        dollar: "",
        cents: "00",
        action: "",
    })

    const navigate = useNavigate();

    useEffect(() => { //Retrieve results from backend
        async function getRecords() {

            const sessionResponse = await fetch(`http://localhost:4000/session_get/`,
                {
                    method: "GET",
                    credentials: 'include'
                }
            ).catch(error => {
                window.alert(error);
                return;
            });

            const email = await sessionResponse.json();
            if (email === ""){
                navigate("/");
            }

            //get user if logged in
            const response = await fetch(`http://localhost:4000/userAccounts/${email}`);
            if(!response.ok){
                const message = `An error occurred: ${response.statusText}`;
                window.alert(message);
                return;
            }

            const responseRecords = await response.json();
            setRecords(responseRecords);

            return;
        }

        getRecords();
        return;
    },[records.length]);

    function recordList(){
        return records.map((record) => {
            return (
                <Record 
                    record={record}
                />
            );
        });
    }

    async function onLogOut(e) {
        e.preventDefault(); //Don't do the default reaction of reloading the page

        const sessionResponse = await fetch(`http://localhost:4000/session_delete`,
            {
                method: "GET",
                credentials: 'include'
            }
        ).catch(error => {
            window.alert(error);
            return;
        });

        console.log("Checking response!");

        if (!sessionResponse.ok){
            const message = `An error occurred: ${sessionResponse.statusText}`;
            window.alert(message);
            return;
        }
         
        navigate("/");
        
    }

    async function onSubmit(e) {
        e.preventDefault(); //Don't do the default reaction of reloading the page

        if (form.account === "" || form.action === "" || form.dollar === "" || form.cents === ""){
            window.alert("An error occurred. Please check to make sure all fields are filled.");
            return;
        }

        //get email
        const sessionResponse = await fetch(`http://localhost:4000/session_get/`,
            {
                method: "GET",
                credentials: 'include'
            }
        ).catch(error => {
            window.alert(error);
            return;
        });

        const email = await sessionResponse.json();

        //edit mongo entry
        const newPerson = {...form};
        await fetch(`http://localhost:4000/${form.account}/${form.action}/${email}`, {
            method: "PUT",  
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newPerson), 
        }).catch(error => {
            window.alert(error);
            return;
        });

        setForm({account: "", action: "", dollar: "", cents: "00"}); //clear form for further use

        //update account balances

        const response = await fetch(`http://localhost:4000/userAccounts/${records.email}`);
            if(!response.ok){
                const message = `An error occurred: ${response.statusText}`;
                window.alert(message);
                return;
            }

            const responseRecords = await response.json();
            setRecords(responseRecords);
    }

    function updateForm(jsonObj) {
        return setForm((prevJsonObj) => { //Take what was in the form previously
            return { ...prevJsonObj, ...jsonObj}; //first unpacks the previous json obj into the three key value pairs  ---- Then updates (adds the new information the user input onto to it) the new json obj
        });
    }

    return (
        <div>
            <div>
                    <input
                        type="submit"
                        value="Log Out"
                        onClick={(e) => onLogOut(e)}
                    />
            </div>
            <h3>Record List</h3>
            <table style={{marginTop: 20}}>
                <thead>
                    <tr>
                        <th>Checking</th>
                        <th>Savings</th>
                    </tr>
                </thead>
                <tbody>{recordList()}</tbody>
            </table>

            <form onSubmit={onSubmit}>
                <h4>Select which account:</h4>
                <div>
                    <input
                        id="accountChecking"
                        type="radio"
                        value="checking"
                        checked={form.account === "checking"}
                        onChange={(e) => updateForm({ account: e.target.value})}
                    />
                    <label htmlFor="accountChecking">Checking</label>

                    <input
                        id="accountSavings"
                        type="radio"
                        value="savings"
                        checked={form.account === "savings"}
                        onChange={(e) => updateForm({ account: e.target.value})}
                    />
                    <label htmlFor="accountSavings">Savings</label>
                </div>

                <h4>Select an action:</h4>
                <div>
                    
                    <input
                        id="actionDeposit"
                        type="radio"
                        value="deposit"
                        checked={form.action === "deposit"}
                        onChange={(e) => updateForm({ action: e.target.value})}
                    />
                    <label htmlFor="actionDeposit">Deposit</label>

                    <input
                        id="actionWithdraw"
                        type="radio"
                        value="withdraw"
                        checked={form.action === "withdraw"}
                        onChange={(e) => updateForm({ action: e.target.value})}
                    />
                    <label htmlFor="actionWithdraw">Withdraw</label>
                </div>

                <div>
                    <label>Amount: </label>
                    <input 
                        type="text" 
                        id="dollars" 
                        value={form.dollar} 
                        onChange={(e) => updateForm({ dollar: e.target.value})}
                    />
                    .
                    <input
                        type="text" 
                        id="cents" 
                        value={form.cents} 
                        onChange={(e) => updateForm({ cents: e.target.value})}
                    />
                </div>

                <div>
                    <input
                        type="submit"
                        value="Commit"
                    />
                </div>
            </form>
        </div>
    );
}