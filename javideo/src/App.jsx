import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Card from './pages/Card';
import Admin from './pages/Admin';
import Loading from './pages/Loading';

function App() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate data loading delay for demonstration
        const timeout = setTimeout(() => {
            setLoading(false);
        }, 2000);

        // Clean up timeout
        return () => clearTimeout(timeout);
    }, []);

    return (
        <div className='main'>
            {loading ? (
                <Loading />
            ) : (
                <>
                    {/* <Header></Header> */}
                    <Routes>
                        <Route path="" element={<Header />} />
                        <Route path="/card" element={<Card />} />
                        <Route path="/igcode" element={<Admin />} />
                    </Routes>
                </>
            )}
        </div>
    );
}

export default App;
