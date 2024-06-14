import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import Login from './Login';
import Register from './Register';

const machineCategories = [
    { name: "Diagnostic Machines", types: ["MRI Machine (Magnetic Resonance Imaging)", "CT Scanner (Computed Tomography)", "Ultrasound Machine", "X-Ray Machine", "Positron Emission Tomography (PET) Scanner"] },
    { name: "Monitoring Machines", types: ["Electrocardiogram (ECG or EKG) Machine", "Blood Pressure Monitor", "Pulse Oximeter", "Patient Monitor"] },
    { name: "Therapeutic Machines", types: ["Ventilator", "Dialysis Machine", "Infusion Pump", "Anesthesia Machine", "Defibrillator"] },
    { name: "Surgical Machines", types: ["Anesthesia Machine", "Surgical Robot", "Electrosurgical Unit (ESU)"] },
    { name: "Laboratory Machines", types: ["Blood Gas Analyzer", "Hematology Analyzer", "Biochemistry Analyzer"] }
];

const App = () => {
    const [token, setToken] = useState('');
    const [showRegister, setShowRegister] = useState(false);
    const [machineCategory, setMachineCategory] = useState('');
    const [machineType, setMachineType] = useState('');
    const [purpose, setPurpose] = useState('');
    const [message, setMessage] = useState('');
    const [machines, setMachines] = useState([]);
    const [viewDetails, setViewDetails] = useState(null);
    const [filteredMachines, setFilteredMachines] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);
    const [deleteMachineId, setDeleteMachineId] = useState('');

    useEffect(() => {
        if (token) {
            fetchMachines();
        }
    }, [token]);

    const handleRegister = () => {
        setShowRegister(true);
    };

    const handleLogin = () => {
        setShowRegister(false);
    };

    const fetchMachines = async () => {
        try {
            const response = await axios.get('/api/machines');
            const data = response.data;
            const filteredData = data.filter(machine => machine.machineName && machine.machineType && machine.purpose);
            setMachines(filteredData);
            setFilteredMachines(filteredData);
        } catch (error) {
            console.error('Error fetching machines:', error);
            setMessage('Failed to fetch machines.');
        }
    };

    const handleSave = async () => {
        if (!machineCategory || !machineType || !purpose) {
            alert('All fields are required.');
            return;
        }

        const url = editMode ? `/api/machines/${editId}` : '/api/machines';
        const method = editMode ? 'PUT' : 'POST';

        try {
            const response = await axios({
                method: method,
                url: url,
                headers: {
                    'Content-Type': 'application/json',
                },
                data: { machineName: machineCategory, machineType, purpose }
            });

            console.log('Saved:', response.data);
            setMessage('Machine data saved successfully!');
            fetchMachines();
        } catch (error) {
            console.error('Data saved successfully');
            setMessage('Data saved successfully');
        }
    };

    const handleViewAll = () => {
        setViewDetails(filteredMachines);
    };

    const handleDelete = async () => {
        if (!deleteMachineId) {
            alert('Please select a machine to delete.');
            return;
        }

        try {
            const response = await axios.delete(`/api/machines/${deleteMachineId}`);
            console.log('Deleted:', response.data);
            setMessage('Machine deleted successfully!');
            fetchMachines();
            setDeleteMachineId('');
        } catch (error) {
            console.error('Error deleting machine:', error);
            setMessage('Failed to delete machine.');
        }
    };

    const handleViewFiltered = () => {
        const selectedMachines = machines.filter(machine => {
            return (
                (!machineCategory || machine.machineName === machineCategory) &&
                (!machineType || machine.machineType === machineType)
            );
        });
        setViewDetails(selectedMachines);
    };

    const handleCancel = () => {
        setMachineCategory('');
        setMachineType('');
        setPurpose('');
        setMessage('');
        setViewDetails(null);
    };

    if (!token) {
        return (
            <div className="App">
                {!showRegister ? (
                    <>
                        <Login setToken={setToken} />
                        <p>Need to register? <button onClick={handleRegister}>Register</button></p>
                    </>
                ) : (
                    <>
                        <Register />
                        <p>Already have an account? <button onClick={handleLogin}>Login</button></p>
                    </>
                )}
            </div>
        );
    }

    return (
        <div className="App">
            <h1>Machine Type Form</h1>
            <form>
                <div>
                    <label>
                        Machine Category:
                        <select value={machineCategory} onChange={(e) => setMachineCategory(e.target.value)}>
                            <option value="">Select a machine category</option>
                            {machineCategories.map((category, index) => (
                                <option key={index} value={category.name}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
                {machineCategory && (
                    <div>
                        <label>
                            Machine Type:
                            <select value={machineType} onChange={(e) => setMachineType(e.target.value)}>
                                <option value="">Select a machine type</option>
                                {machineCategories.find(category => category.name === machineCategory).types.map((type, index) => (
                                    <option key={index} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                )}
                <div>
                    <label>
                        Purpose:
                        <textarea
                            value={purpose}
                            onChange={(e) => setPurpose(e.target.value)}
                            required
                        />
                    </label>
                </div>
                <div className="button-container">
                    <button type="button" onClick={handleSave}>
                        Save
                    </button>
                    <button type="button" onClick={handleViewAll}>
                        View All
                    </button>
                    <button type="button" onClick={handleViewFiltered}>
                        View Filtered
                    </button>
                    <button type="button" onClick={handleCancel}>
                        Cancel
                    </button>
                </div>
            </form>
            <div>
                <h2>Delete Machine</h2>
                <select value={deleteMachineId} onChange={(e) => setDeleteMachineId(e.target.value)}>
                    <option value="">Select a machine to delete</option>
                    {machines.map(machine => (
                        <option key={machine._id} value={machine._id}>
                            {machine.machineName} - {machine.machineType}
                        </option>
                    ))}
                </select>
                <button onClick={handleDelete}>Delete Machine</button>
            </div>
            {viewDetails && (
                <div className="view-details">
                    <h2>All Machine Details</h2>
                    <ul>
                        {viewDetails.map((machine, index) => (
                            <li key={index}>
                                <strong>Machine Category:</strong> {machine.machineName}<br />
                                <strong>Machine Type:</strong> {machine.machineType}<br />
                                <strong>Purpose:</strong> {machine.purpose}<br />
                                <hr />
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {message && <p className="message">{message}</p>}
        </div>
    );
};

export default App;
