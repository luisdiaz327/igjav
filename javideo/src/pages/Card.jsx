import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { useParams, useLocation } from 'react-router-dom';
import '../css/card.css';
import Loading from './Loading';


function Card() {
  const [searchResults, setSearchResults] = useState([]);
  const location = useLocation();
  const searchTerm = new URLSearchParams(location.search).get("searchTerm");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading delay for demonstration
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 2000);

    // Clean up timeout
    return () => clearTimeout(timeout);
  }, []);

  const firebaseConfig = {
    // Your Firebase config...
    apiKey: "AIzaSyBlLJyeXHATLU2f0ZwSPROh9P5q8_xNiPU",
    authDomain: "javcode-5ec35.firebaseapp.com",
    projectId: "javcode-5ec35",
    storageBucket: "javcode-5ec35.appspot.com",
    messagingSenderId: "110374044061",
    appId: "1:110374044061:web:93976a599d9ac1ba1daf74",
    measurementId: "G-KGDTGPY0JR"
  };

  initializeApp(firebaseConfig);

  const db = getFirestore();

  useEffect(() => {
    // console.log("Fetching data...");
    const fetchCodes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "javcode"));
        const docs = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        // console.log("Fetched data:", docs); // Log the fetched data
        const filteredResults = docs.filter(code =>
          code.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          code.code.toLowerCase().includes(searchTerm.toLowerCase())
        );
        // console.log("Filtered results:", filteredResults); // Log the filtered results
        setSearchResults(filteredResults);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (searchTerm) {
      fetchCodes();
    }
  }, [db, searchTerm]);

  // console.log("Search Term:", searchTerm);
  // console.log("Search Results:", searchResults);

  const renderResults = () => {
    if (searchResults.length === 0) {
      return <div>Not Found</div>;
    }
    return searchResults.map(result => (
      <div key={result.id}>
        <div className="center">
          <div className="article-card">
            <div className="content">
              <p className="date">{result.code}</p>
              <a href={result.title} className="title" target="_blank" rel="noopener noreferrer">Download</a>
            </div>
            <img src="https://i.ibb.co/JzFB9ws/Free.jpg" alt="Code" />
          </div>
        </div>
      </div>
    ));
  };

  return (
    <>
      {loading ? (
        <Loading />
      ) : (

        <div className='backhome'>
          <div className="abc">
            <h2>Search Results</h2>
            <button className='button-24' onClick={() => window.history.back()}>Close</button>
          </div>
          <div className='def'>
            {renderResults()}
          </div>
        </div>
      )}
    </>
  );
}

export default Card;
