import React, { useEffect, useState } from "react";
 
const Record = (props) => {
  const [form, setForm] = useState(props.record.role);

  useEffect(() => {
    setForm(props.record.role);
  }, [props.record.role]);

  const setNewRole = (e) => {
    setForm(e.target.value);
  }
  
  return (
  <tr>
    <td>{props.record.firstName}</td>
    <td>{props.record.lastName}</td>
    <td>
      <select name="role" id="roles" value={form} onChange={setNewRole}>
          <option value="customer">Customer</option>
          <option value="employee">Employee</option>
          <option value="admin">Administrator</option>
      </select>
    </td>
    <td>
    <button onClick={() => props.updateRecord(props.record.email, form)}>
        Save
      </button>
    </td>
  </tr>
);
};
 
export default function ChangeRoles() {
 const [records, setRecords] = useState([]);
 
 
 // This method fetches the records from the database.
 useEffect(() => {
   async function getRecords() {
     const response = await fetch(`http://localhost:4000/userAccounts/`);
 
     if (!response.ok) {
       const message = `An error occurred: ${response.statusText}`;
       window.alert(message);
       return;
     }
 
     const records = await response.json();
     setRecords(records);
   }
 
   getRecords();
 
   return;
 }, [records.length]);
 
 // This method will update a record
 async function updateRecord(email, role) {
   const response = await fetch(`http://localhost:4000/changeRole/${email}/${role}`, {
      method: "PUT",  
      headers: {
          "Content-Type": "application/json",
      }, 
    });

    if(!response.ok){
      const message = `An error occurred: ${response.statusText}`;
      window.alert(message);
      return;
   }

    //update the records
    const updateResponse = await fetch(`http://localhost:4000/userAccounts/`);
    if(!updateResponse.ok){
        const message = `An error occurred: ${updateResponse.statusText}`;
        window.alert(message);
        return;
    }

    const responseRecords = await updateResponse.json();
    setRecords(responseRecords);
 }
 
 // This method will map out the records on the table
 function recordList() {
   return records.map((record) => {
     return (
       <Record
         record={record}
         updateRecord={updateRecord}
         key={record.email}
       />
     );
   });
 }
 
 // This following section will display the table with the records of individuals.
 return (
   <div>
     <h3>Change account Rights</h3>
     <table className="table table-striped" style={{ marginTop: 20 }}>
       <thead>
         <tr>
           <th>First name</th>
           <th>Last name</th>
           <th>Position</th>
         </tr>
       </thead>
       <tbody>{recordList()}</tbody>
     </table>
   </div>
 );
}