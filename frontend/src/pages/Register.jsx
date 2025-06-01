import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [userId, setUserId] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const addUser = { name, userId, email, phoneNumber, password };
    console.log(addUser);

    const response = await fetch("http://localhost:5000/user/register", {
      method: "POST",
      body: JSON.stringify(addUser),
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const result = await response.json();

    if (!response.ok) {
      if (result.message === "User already exists") {
        alert("User Already Exists");
      }
    } else {
      console.log(result);
      setName("");
      setEmail("");
      setPhoneNumber("");
      setPassword("");
      setUserId("");

      alert("Registered Successfully");
      navigate("/login");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form 
        onSubmit={handleSubmit} 
        className="bg-gray-800 bg-opacity-75 shadow-xl rounded-2xl p-8 w-full max-w-lg border border-gray-100"
      >
        <h2 className="text-2xl font-semibold text-white text-center mb-6">Register</h2>
        <div className="space-y-4">
          {[
            { label: "Name", value: name, setValue: setName, type: "text" },
            { label: "User ID", value: userId, setValue: setUserId, type: "text" },
            { label: "Email", value: email, setValue: setEmail, type: "email" },
            { label: "Password", value: password, setValue: setPassword, type: "password" },
            { label: "Phone Number", value: phoneNumber, setValue: setPhoneNumber, type: "text" },
          ].map(({ label, value, setValue, type }) => (
            <div key={label}>
              <label className="block text-white text-lg mb-1">{label}</label>
              <input
                type={type}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full px-4 py-2 text-gray-900 bg-white rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                placeholder={`Enter your ${label.toLowerCase()}`}
                required
              />
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="w-full mt-6 bg-blue-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all"
        >
          Register
        </button>

        <div className="mt-4 text-center">
          <Link to="/login" className="text-blue-400 hover:underline">
            Already have an account? Login
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Register;