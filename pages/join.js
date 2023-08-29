import React, { useState, useEffect, useRef } from 'react';
import '../app/globals.css';
import io from 'socket.io-client';

const socket = io('http://localhost:3001', {
  withCredentials: true
});



const join = () => {

  const [draftOrder, setDraftOrder] = useState([]);
  const [isToggled, setIsToggled] = useState(false);
  const [usernames, setUsernames] = useState([]);
  const [countdown, setCountdown] = useState(10);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [displayMessage, setDisplayMessage] = useState("");

  const audioRef = useRef();

  // DRAFT PRESENTATION 

  const revealDraftOrder = () => {
    let isMessageShown = false; // a flag to check if the message is displayed
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        if (prevIndex === -1 && !isMessageShown) { // if it's the first index and message is not yet shown
          audioRef.current.Dababy.play();
          setDisplayMessage("and the first pick goes to...");
          isMessageShown = true;
          return -1; // keeping the index to -1 so the first name doesn't display immediately
        } else if (prevIndex === -1 && isMessageShown) { // if it's the first index and message is already shown
          setDisplayMessage(""); // clear the message
          return 0;
        }
        if (prevIndex === 8) {
          audioRef.current.nfl.pause();
          audioRef.current.bad.play();
          audioRef.current.end.play();
        }
        if (prevIndex === 7) {
          audioRef.current.bruh.play();
        }
        if(prevIndex === 0) {
          audioRef.current.good.play();
        }


        if (prevIndex >= draftOrder.length - 1) {
          clearInterval(timer);
          console.log(currentIndex);
          setDisplayMessage(`Congrats ${draftOrder[0]}!`);
          audioRef.current.good.play();
          return draftOrder.length - 1;
        }
        return prevIndex + 1;
      });
    }, 3000);

  };

  // COUNTDOWN HANDLING 

  const startCountdown = () => {
    setIsToggled(true);
    audioRef.current.nfl.play();
    audioRef.current.nfl.volume = 0.5;
    const timer = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown <= 1) {
          clearInterval(timer);
          audioRef.current.gunshot.play();
          revealDraftOrder();
          return 0;
        }
        return prevCountdown - 1;
      });
    }, 1000);
  }

  //SOCKET CONNECTION

  useEffect(() => {
    socket.on('connect', () => {
      console.log("connected to the server");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    fetch('https://ghmp-d7e7a0e5943b.herokuapp.com/join')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => setUsernames(data))
      .catch(error => console.error('There was a problem fetching usernames:', error));
  }, []);

  useEffect(() => {
    if (draftOrder.length) {
      startCountdown();
    }
  }, [draftOrder]);

  useEffect(() => {
    socket.on('draft-order', (order) => {
      console.log("received draft order")
      setDraftOrder(order);
    });

    socket.on('update-usernames', (updatedUsernames) => {
      setUsernames(updatedUsernames);
    });

    return () => {
      socket.off('draft-order');

      socket.off('update-usernames');
    };
  }, []);

  //GET NEWLY ARRANGED DRAFT ORDER

  const startDraft = async () => {
    try {
      await fetch('http://localhost:3001/start-draft', { method: 'POST' });
    } catch (error) {
      console.error("Error Starting Draft:", error)
    }
  }


  return (
    <>
      <audio ref={(el) => audioRef.current = { ...audioRef.current, 'good': el }} src="good.mp3" preload="auto" />
      <audio ref={(el) => audioRef.current = { ...audioRef.current, 'end': el }} src="end.mp3" preload="auto" />
      <audio ref={(el) => audioRef.current = { ...audioRef.current, 'bad': el }} src="bad.mp3" preload="auto" />
      <audio ref={(el) => audioRef.current = { ...audioRef.current, 'Dababy': el }} src="Dababy.mp3" preload="auto" />
      <audio ref={(el) => audioRef.current = { ...audioRef.current, 'nfl': el }} src="nfl.mp3" preload="auto" />
      <audio ref={(el) => audioRef.current = { ...audioRef.current, 'bruh': el }} src="bruh.mp3" preload="auto" />
      <audio ref={(el) => audioRef.current = { ...audioRef.current, 'gunshot': el }} src="gunshot.mp3" preload="auto" />

      <div className="w-full min-h-screen bg-custom bg-center bg-cover bg-no-repeat">
        <div className="w-full h-36 px-4 sm:px-16 bg-black/60 border-2 border-white text-black mb-4 sm:mb-0">
          <h1 className="text-xl sm:text-2xl my-4 text-white">Players ({usernames.length})</h1>
          <ul className="flex flex-wrap justify-center sm:justify-start text-lg sm:text-xl text-blue-500 space-x-4 text-white list-none">
            {usernames.map(username => <li key={username}>{username}</li>)}
          </ul>
        </div>
        <button onClick={startDraft} className="rounded-lg absolute top-2 right-2 sm:right-20 sm:top-8 px-4 py-2 text-lg bg-green-600 border-2 border-gray-500 hover:bg-green-500">Start</button>
      </div>

      <div className="text-center mt-6 absolute top-44 w-full text-xl sm:text-2xl">
        {isToggled && countdown > 0 && <div className="countdown bg-black/60 rounded-full text-6xl text-shadow w-1/5 mx-auto">{countdown}</div>}
        {displayMessage && <div className="text-white bg-black/60 p-2 w-2/5 mx-auto mt-4">{displayMessage}</div>}
        {isToggled && countdown === 0 && draftOrder.slice(0, currentIndex + 1).map((username, index) => (
          <div className="text-white bg-black/60 mx-auto sm:w-2/5 p-2" key={username}>{index + 1}. {username}</div>
        ))}
      </div>

      <img className="hidden sm:block absolute right-8 bottom-16 animate-bounce h-20 w-20" src="/tony.png" />
      <h2 className="text-center sm:absolute mt-4 sm:bottom-48 sm:left-4 text-lg p-2 text-white border-2 bg-black/80">Randomness</h2>

      <pre className="text-xs sm:text-sm px-2 mt-4 sm:absolute sm:bottom-2 sm:left-4 border-2 border-white bg-black/80"><code>
        {`
const shuffleArray = (array) => {
  for (let i = array.length -1; i> 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
`}
      </code></pre>

    </>)

}

module.exports = join;
