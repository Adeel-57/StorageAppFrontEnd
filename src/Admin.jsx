import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Admin = () => {
  const [users, setUsers] = useState([]);
  const BASE_URL = "http://localhost:4000";
  const navigate  = useNavigate()

  const fetchAllUsers = async () => {
    const response = await fetch(`${BASE_URL}/user/users`, {
      method: "GET",
      credentials:"include"
    });
    const data = await response.json();
    if(data.error){
    navigate("/")
    }
    setUsers(data);
  };
  useEffect(() => {
    fetchAllUsers();
  }, []);
  
  const onLogout = async(user) =>{
    const response = await fetch(`${BASE_URL}/user/logoutAll/${user._id}`, {
      method: "POST",
    });
    const data = await response.json();
    fetchAllUsers()
  }
  const ondelete = (user) =>{}

  return (
    <div className="table-wrapper">
      <table className="admin-user-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={index}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td className={user.isLoggedIn ? "online" : "offline"}>
                {user.isLoggedIn ? "LoggedIn" : "LoggedOut"}
              </td>
              <td>
                <button
                  className="logout-btn"
                  onClick={() => onLogout(user)}
                  disabled={!user.isLoggedIn}
                >
                  Logout
                </button>
                <button className="delete-btn" onClick={() => onDelete(user)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Admin;
