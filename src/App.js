import './App.css';
import React, { useState, useEffect } from 'react';

function App() {
  // const [amount, setAmount] = useState('');
  // const [type, setType] = useState("Food & Groceries");
  // const [editMode, setEditMode] = useState(null); // category being edited
  // const [editAmount, setEditAmount] = useState('');
  const [events, setEvents] = useState([]);

  // Temporary state for new event inputs
  const [event, setEvent] = useState({
    eventName: "",
    eventExpense: "",
    eventPayee: ""
  });

  const STORAGE_KEY = "simple_expense_entries";

  const [entries, setEntries] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {
      "Food & Groceries": 0,
      "Travel": 0,
      "Others": 0
    };
  });

  // useEffect(() => {
  //   localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  // }, [entries]);

const handleChange = (e) => {
    const { name, value } = e.target;
    setEvent((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

// Add new event to the events list
const addEvent = () => {
  if (!event.eventName || !event.eventExpense || !event.eventPayee) {
    alert("Please fill all fields");
    return;
  }

  setEvents((prev) => [...prev, event]);

  // Reset event form
  setEvent({
    eventName: "",
    eventExpense: "",
    eventPayee: ""
  });
};


  //   setAmount('');
  //   setType("Food & Groceries");
  // };

  // const handleDelete = (category) => {
  //   setEntries(prev => ({
  //     ...prev,
  //     [category]: 0
  //   }));
  // };

  // const handleEdit = (category) => {
  //   setEditMode(category);
  //   setEditAmount(entries[category]);
  // };

  // const handleSaveEdit = () => {
  //   if (!editAmount) return;
  //   setEntries(prev => ({
  //     ...prev,
  //     [editMode]: Number(editAmount)
  //   }));
  //   setEditMode(null);
  //   setEditAmount('');
  // };

  return (
    <div className="p-4">
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
      />

      <input
        type="text"
        name="eventPayee"
        value={event.eventPayee}
        onChange={handleChange}
        placeholder="Who paid?"
        className="border p-2 mb-2 block w-full"
      />

      <button
        onClick={addEvent}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Add Event
      </button>

      <h2 className="text-xl mt-4">Events List</h2>
      <ul className="list-disc pl-6">
        {events.map((e, i) => (
          <li key={i}>
            {e.eventName} — ₹{e.eventExpense} (paid by {e.eventPayee})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
