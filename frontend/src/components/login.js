import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [form, setForm] = useState({
        password: "",
        email: ""
    });

    const navigate = useNavigate();

    async function onSubmit(e) {
        e.preventDefault(); //Don't do the default reaction of reloading the page

        if ( form.email === "" || form.password === ""){
            window.alert(`An error occurred. Please check and ensure all fields are filled.`);
            return;
        }

        console.log("Grabbing mongo entry for user!");

        const response = await fetch(`http://localhost:4000/userAccounts/${form.email}/${form.password}`)
        .catch(error => {
            window.alert(error);
            return;
        });

        const responsePerson = await response.json();


        //check to make sure account exists
        if (responsePerson.length === 0) { 
            window.alert("No account found. Please re-enter information.");
            return;
        }

        console.log("Creating a new session!");

        const sessionResponse = await fetch(`http://localhost:4000/session_set/${form.email}`,
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
         
        //check to see account role and navigate to according page
        if(responsePerson[0].role === 'admin'){
            navigate("/adminHome");
        }else if (responsePerson[0].role === 'employee'){
            navigate("/employee")
        }else{
            navigate("/accountSummary");
        }
    }

    function updateForm(jsonObj) {
        return setForm((prevJsonObj) => { //Take what was in the form previously
            return { ...prevJsonObj, ...jsonObj}; //first unpacks the previous json obj into the three key value pairs  ---- Then updates (adds the new information the user input onto to it) the new json obj
        });
    }

    return (
        <div className="transfer-container">
            <h3>Log In</h3>

            <form onSubmit={onSubmit} className="login-form-group">
                <div className="login-item">
                    <label>Email: </label>
                    <input 
                        type="text" 
                        id="email" 
                        value={form.email} 
                        onChange={(e) => updateForm({ email: e.target.value})}
                    />
                </div>

                <div className="login-item">
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
                        value="Log In"
                        className="login-button"
                    />
                </div>
            </form>
        </div>
    );
}