import './App.css';
import Select from "react-select";
import React, { useState, useEffect } from 'react';

function App() {
  // const [amount, setAmount] = useState('');
  // const [type, setType] = useState("Food & Groceries");
  // const [editMode, setEditMode] = useState(null); // category being edited
  // const [tripparticipants, setTripparticipants] = useState([]);
  
  // Trip-level participants
// Trip-level participants
  const [participantInput, setParticipantInput] = useState("");


    // Participants
  const [participants, setParticipants] = useState(() => {
    const savedData = localStorage.getItem("tripData");
    if (savedData) {
      return JSON.parse(savedData).participants || [];
    }
    return [];
  });

  // Events
  const [events, setEvents] = useState(() => {
    const savedData = localStorage.getItem("tripData");
    if (savedData) {
      return JSON.parse(savedData).events || [];
    }
    return [];
  });
  // Events


  // Temporary event form state
  const [event, setEvent] = useState({
    eventName: "",
    eventExpense: "",
    eventPayee: "",
    eventParticipants: [],
  });

  // --- Local Storage Sync ---
  useEffect(() => {
  const savedData = localStorage.getItem("tripData");
  if (savedData) {
    const parsed = JSON.parse(savedData);
    setParticipants(parsed.participants || []);
    setEvents(parsed.events || []);
  }
}, []);

useEffect(() => {
  const dataToSave = {
    participants,
    events,
  };
  localStorage.setItem("tripData", JSON.stringify(dataToSave));
}, [participants, events]);


  // Handle text/number inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEvent((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle multi-select participants
  const handleParticipantsChange = (selected) => {
    const selectedValues = selected ? selected.map((opt) => opt.value) : [];
    setEvent((prev) => ({
      ...prev,
      eventParticipants: selectedValues,
    }));
  };

  // Add participant
  const addParticipants = () => {
    if (!participantInput.trim()) return;
    if (!participants.includes(participantInput)) {
      setParticipants((prev) => [...prev, participantInput]);
    }
    setParticipantInput("");
  };

  // Refresh participants (clear list)
  const refreshParticipants = () => {
    setParticipants([]);
  };

  // Add new event
  const addEvent = () => {
    if (!event.eventName || !event.eventExpense || !event.eventPayee) {
      alert("Please fill all fields");
      return;
    }
    setEvents((prev) => [...prev, event]);
    setEvent({
      eventName: "",
      eventExpense: "",
      eventPayee: "",
      eventParticipants: [],
    });
  };

  // Delete an event
  const deleteEvent = (index) => {
    setEvents((prev) => prev.filter((_, i) => i !== index));
  };

  // Master Reset
  const masterReset = () => {
    if (window.confirm("Are you sure you want to reset everything?")) {
      setParticipants([]);
      setEvents([]);
      localStorage.removeItem("participants");
      localStorage.removeItem("events");
    }
  };

  // ---- Calculations ----

  // Net balances: positive => should receive, negative => owes
  const calculateBalances = () => {
    const balances = {};

    // Initialize with all known participants
    participants.forEach((p) => (balances[p] = 0));

    events.forEach((ev) => {
      const total = parseFloat(ev.eventExpense);
      const payee = ev.eventPayee;
      const people = ev.eventParticipants || [];

      if (!Number.isFinite(total) || total <= 0) return;
      if (!payee || people.length === 0) return;

      // Ensure keys exist even if someone wasn't in the initial list
      if (!(payee in balances)) balances[payee] = 0;
      people.forEach((p) => {
        if (!(p in balances)) balances[p] = 0;
      });

      const share = total / people.length;

      // Every participant owes their share
      people.forEach((p) => {
        balances[p] -= share;
      });

      // Payee gets credited full amount
      balances[payee] += total;
    });

    return balances;
  };

  // Direct debts (event-by-event): debtor -> payee
  const calculateDirectDebts = () => {
    const debts = {}; // debts[debtor][creditor] = amount

    events.forEach((ev) => {
      const total = parseFloat(ev.eventExpense);
      const payee = ev.eventPayee;
      const people = ev.eventParticipants || [];

      if (!Number.isFinite(total) || total <= 0) return;
      if (!payee || people.length === 0) return;

      const share = total / people.length;

      people.forEach((person) => {
        if (person === payee) return; // payee doesn't owe themselves
        if (!debts[person]) debts[person] = {};
        debts[person][payee] = (debts[person][payee] || 0) + share;
      });
    });

    return debts;
  };

  const balances = calculateBalances();
  const directDebts = calculateDirectDebts();
  return (
  <div className="p-4">
      {/* Master Reset */}
      <button
        type="button"
        onClick={masterReset}
        className="bg-red-700 text-white px-4 py-2 rounded mb-4"
      >
        🔄 Master Reset (New Trip)
      </button>

      {/* Participants Section */}
      <h2 className="text-xl mb-2">Add Participants</h2>
      <input
        type="text"
        name="Participant"
        placeholder="Participant name"
        value={participantInput}
        onChange={(e) => setParticipantInput(e.target.value)}
        className="border p-2 mb-2 block w-full"
      />
      <button
        type="button"
        onClick={addParticipants}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Add Participant
      </button>

      <button
        type="button"
        onClick={refreshParticipants}
        className="bg-red-500 text-white px-4 py-2 rounded ml-2"
      >
        Clear Participants
      </button>

      <h2 className="text-xl mt-4">Trip Participants</h2>
      <ul className="list-disc pl-6 mb-6">
        {participants.map((p, i) => (
          <li key={i}>{p}</li>
        ))}
      </ul>

      {/* Event Form */}
      <h2 className="text-xl mb-2">Add Event</h2>
      <input
        type="text"
        name="eventName"
        value={event.eventName}
        onChange={handleChange}
        placeholder="Event name"
        className="border p-2 mb-2 block w-full"
      />

      <input
        type="number"
        name="eventExpense"
        value={event.eventExpense}
        onChange={handleChange}
        placeholder="Expense amount"
        className="border p-2 mb-2 block w-full"
        min="0"
        step="0.01"
      />

      {/* Payee Dropdown (single) */}
      <label className="block mb-2">Who Paid?</label>
      <Select
        isClearable
        options={participants.map((p) => ({ value: p, label: p }))}
        value={
          event.eventPayee
            ? { value: event.eventPayee, label: event.eventPayee }
            : null
        }
        onChange={(selected) =>
          setEvent((prev) => ({
            ...prev,
            eventPayee: selected ? selected.value : "",
          }))
        }
        className="mb-4"
      />

      {/* Participants Dropdown (multi) */}
      <label className="block mb-2">Select Participants:</label>
      <Select
        isMulti
        options={participants.map((p) => ({ value: p, label: p }))}
        value={event.eventParticipants.map((p) => ({ value: p, label: p }))}
        onChange={handleParticipantsChange}
        className="mb-4"
      />

      <button
        onClick={addEvent}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Add Event
      </button>

      {/* Events List */}
      <h2 className="text-xl mt-6">Events List</h2>
      <ul className="list-disc pl-6">
        {events.map((e, i) => (
          <li key={i} className="mb-2">
            <strong>{e.eventName}</strong> — ₹{e.eventExpense} (paid by{" "}
            {e.eventPayee}) <br />
            Participants:{" "}
            {e.eventParticipants.length > 0
              ? e.eventParticipants.join(", ")
              : "No participants"}
            <button
              onClick={() => deleteEvent(i)}
              className="ml-4 bg-red-500 text-white px-2 py-1 rounded"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      {/* Net Balances */}
      <h2 className="text-xl mt-6">Final Balances</h2>
      <ul className="list-disc pl-6">
        {Object.entries(balances).map(([person, balance]) => (
          <li key={person}>
            {person}:{" "}
            {balance > 0
              ? `should receive ₹${balance.toFixed(2)}`
              : balance < 0
              ? `owes ₹${(-balance).toFixed(2)}`
              : "No Balance"}
          </li>
        ))}
      </ul>

      {/* Event-by-Event Debts (Who owes whom) */}
      <h2 className="text-xl mt-6">Who Owes Whom</h2>
      <ul className="list-disc pl-6">
        {Object.keys(directDebts).length === 0 ? (
          <li>No Transactions 🎉</li>
        ) : (
          Object.entries(directDebts).flatMap(([debtor, creditors]) =>
            Object.entries(creditors).map(([creditor, amount]) => (
              <li key={`${debtor}->${creditor}`}>
                {debtor} owes {creditor} ₹{amount.toFixed(2)}
              </li>
            ))
          )
        )}
      </ul>
    </div>
  );
}

export default App;
