import React, { useState, useEffect, useCallback } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";

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

const Admin = () => {
    const [code, setCode] = useState("");
    const [title, setTitle] = useState("");

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


    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        const docRef = await addDoc(collection(db, "javcode"), {
            code: code,
            title: title,
        });
        setCode("");
        setTitle("");
        setShowDetails(false);
        setSearchTerm("");
        // Set the ID of the document same as its code
        await docRef.update({ id: docRef.id });
    }, [db, code, title]);


    return (
        <>
            <form onSubmit={handleSubmit}>
                <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Code"
                /> <br />
                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Link"
                /> <br />
                <button type="submit">Submit</button>
            </form> 

        </>
    );
};

export default Admin;
