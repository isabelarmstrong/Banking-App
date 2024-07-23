import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

/*
firstName: req.body.firstName,
lastName: req.body.lastName,
role: req.body.role,
password: req.body.password,
email: req.body.email,
phone: req.body.phone,
checking: req.body.checking,
savings: req.body.savings
*/

export default function Register() {
    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        role: "",
        password: "",
        email: "",
        phone: "",
        checking: 0,
        savings: 0
    });

    const navigate = useNavigate();

    async function onSubmit(e) {
        e.preventDefault(); //Don't do the default reaction of reloading the page

        if (form.firstName === "" || form.lastName === "" || form.email === "" || form.password === "" || form.phone === ""){
            window.alert(`An error occurred. Please check and ensure all fields are filled.`);
            return;
        }


        console.log("Creating mongo entry for user!");

        const newPerson = {...form};
        await fetch("http://localhost:4000/userAccounts/add", {
            method: "POST",  
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newPerson), 
        }).catch(error => {
            window.alert(error.message);
            return;
        });


        setForm({firstName: "", lastName: "", password: "", email: "", phone: "",}); //reset the form to add another person

        
        console.log("Creating a new session!");

        const response = await fetch(`http://localhost:4000/session_set/${form.email}`,
            {
                method: "GET",
                credentials: 'include'
            }
        ).catch(error => {
            window.alert(error);
            return;
        });

        console.log("Checking response!");

        if (!response.ok){
            const message = `An error occurred: ${response.statusText}`;
            window.alert(message);
            return;
        }

        navigate("/accountSummary");
    }

    function updateForm(jsonObj) {
        return setForm((prevJsonObj) => { //Take what was in the form previously
            return { ...prevJsonObj, ...jsonObj}; //first unpacks the previous json obj into the three key value pairs  ---- Then updates (adds the new information the user input onto to it) the new json obj
        });
    }

    return (
        <div>
            <h3>Create Account</h3>

            <form onSubmit={onSubmit}>
                <div>
                    <label>First Name: </label>
                    <input 
                        type="text" 
                        id="firstName" 
                        value={form.firstName} 
                        onChange={(e) => updateForm({ firstName: e.target.value})}
                    />
                </div>

                <div>
                    <label>Last Name: </label>
                    <input 
                        type="text" 
                        id="lastName" 
                        value={form.lastName} 
                        onChange={(e) => updateForm({ lastName: e.target.value})}
                    />
                </div>

                <div>
                    <label>Phone Number: </label>
                    <input 
                        type="text" 
                        id="phone" 
                        value={form.phone} 
                        onChange={(e) => updateForm({ phone: e.target.value})}
                    />
                </div>

                <div>
                    <label>Email: </label>
                    <input 
                        type="text" 
                        id="email" 
                        value={form.email} 
                        onChange={(e) => updateForm({ email: e.target.value})}
                    />
                </div>

                <div>
                    <label>Password: </label>
                    <input 
                        type="text" 
                        id="password" 
                        value={form.password} 
                        onChange={(e) => updateForm({ password: e.target.value})}
                    />
                </div>

                <div>
                    <input
                        type="submit"
                        value="Create Account"
                    />
                </div>
            </form>
        </div>
    );
}