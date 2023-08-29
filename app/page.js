'use client'
import React, { useState } from 'react'

const Home = () => {

  const [username, setUsername] = useState('');

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('https://ghmp-d7e7a0e5943b.herokuapp.com/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      if (response.ok) {
        console.log('User added successfully');
        window.location.href = 'https://ghmp-d7e7a0e5943b.herokuapp.com/join';
      } else {
        console.error('Error adding user');
      }
    } catch (error) {
      console.error('An error occurred', error);
    }
  };

  return (
    <div className="min-h-screen bg-black w-full flex flex-col justify-center items-center font-mono">
      <h1 className="mb-6 text-3xl text-blue-400">Grace Has Mid Pussy Draft Order Hoorah</h1>
      <img className="animate-bounce h-20 w-20" src="/tony.png" />
      <div className="flex flex-col items-center justify-center w-80 h-80 bg-blue-400 rounded-lg">
        <h2 className=" text-xl text-black my-8">Enter Username</h2>
        <textarea onChange={handleUsernameChange} className="h-10 resize-none rounded-lg bg-white text-black pt-2 px-2" />
        <button onClick={handleSubmit} className="rounded-lg hover:bg-gray-700 bg-black text-blue-400 text-center px-4 py-2 my-8">Join</button>
      </div>
    </div>
  )
}

export default Home;
