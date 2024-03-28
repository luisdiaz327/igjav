import React, { useState, useEffect, useCallback, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";
import Card from '../pages/Card';
import '../css/header.css'
import { useNavigate } from 'react-router-dom';



function Header() {
  // const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const Navigate = useNavigate();

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

  const [searchTerm, setSearchTerm] = useState("");
  const [codes, setCodes] = useState([]);
  const [filteredCodes, setFilteredCodes] = useState([]);
  const [showDetails, setShowDetails] = useState(false);

  const searchInput = useRef(null); // Define searchInput using useRef


  const getCodes = async () => {
    const querySnapshot = await getDocs(collection(db, "javcode"));
    const docs = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setCodes(docs);
  };

  useEffect(() => {
    getCodes();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = codes.filter((code) => {
        return code.title.toLowerCase().includes(searchTerm.toLowerCase());
      });
      setFilteredCodes(filtered);
      console.log("filteredCodes:", filtered); // Add this line
    }
  }, [searchTerm, codes]);


  const handleSearch = (e) => {
    e.preventDefault();
    const searchTerm = searchInput.current.value.trim().toLowerCase();
    if (searchTerm !== '') {
      Navigate(`/card?searchTerm=${searchTerm}`);
    } else {
      alert('Please enter a search term.');
    }
  };

  useEffect(() => {
    if (searchTerm) {
      const filtered = codes.filter((code) => {
        return (
          code.title.toLowerCase().includes(searchTerm) ||
          code.code.toLowerCase().includes(searchTerm) // Include code search
        );
      });
      setFilteredCodes(filtered);
    } else {
      // If search term is empty, reset filteredCodes
      // alert('get free codes @.');
      setFilteredCodes([]);
    }
  }, [searchTerm, codes]);


  return (
    <>
      <div className="header-box">

        <div className="search-box">

          <form onSubmit={handleSearch}>
            <input className="input-div" ref={searchInput} type="text" placeholder="search code" />
            <button className="search-btn" type="submit">search</button>
          </form>

          {filteredCodes.length > 0 && (
            <div>
              {filteredCodes.map((code) => (
                <div key={code.id}>
                  <h3>{code.title}</h3>
                  <p>{code.code}</p>
                </div>
              ))}
            </div>
          )}

          {/* Display a message if no data found */}
          {filteredCodes.length === 0 && searchTerm && (
            <p>No matching codes found.</p>
          )}

        </div>

        {showResults && (
          <Card searchTerm={searchTerm} onBack={handleBack} />
        )}

      </div>

    </>

  );
}

export default Header;
