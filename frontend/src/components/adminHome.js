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


export default function adminHome() {
    return (
        <div>
            <h3>Admin Home</h3>

            <div>
                <a href="/register">Register New User</a>
                <a href="/adminRights">View current users</a>
            </div>
        </div>
    );
}