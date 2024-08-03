import React from "react";
import { useNavigate } from "react-router-dom";

/*
to do for admin: 
    Access all screens
        Only employee and Admin should be able to access registration
    elevate/demote rights (adminRights.js) ---- DONE
        Need to make a route to be able to target changing role ---- DONE
    Clean UI
*/


export default function AdminHome() {
    const navigate = useNavigate();

    async function onLogOut(e) {
        e.preventDefault();

        // Commented out API call
        
        const sessionResponse = await fetch(`http://localhost:4000/session_delete`, {
            method: "GET",
            credentials: 'include'
        }).catch(error => {
            window.alert(error);
            return;
        });

        if (!sessionResponse.ok) {
            const message = `An error occurred: ${sessionResponse.statusText}`;
            window.alert(message);
            return;
        }
        

        // Navigate to home page for testing
        navigate("/");
    }
    
    return (
        <div className="employee-wrapper">
            <div className="employee-container">
                <div>
                    <input className="logout-button" type="submit" value="Log Out" onClick={(e) => onLogOut(e)} />
                </div>

                <h3>Admin Home</h3>

                <div className="employee-button-container">
                    <button className="admin-button" type="submit"onClick={() => navigate("/register")}>Register new user</button>
                    <button className="admin-button" type="submit" onClick={() => navigate("/changeRoles")}>View current users</button>
                    <button className="admin-button" type="submit" onClick={() => navigate("/accountLookUp")}>Look up an account</button>
                    <button className="admin-button" type="submit" onClick={() => navigate("/transferFunds")}>Transfer balances between accounts</button>
                </div>
            </div>
        </div>
    );
}