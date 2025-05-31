import './App.css';
import React, { useState, useEffect } from 'react';

function App() {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState("Food & Groceries");
  const [editMode, setEditMode] = useState(null); // category being edited
  const [editAmount, setEditAmount] = useState('');

  const STORAGE_KEY = "simple_expense_entries";

  const [entries, setEntries] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {
      "Food & Groceries": 0,
      "Travel": 0,
      "Others": 0
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount) return;

    setEntries(prev => ({
      ...prev,
      [type]: Number(prev[type]) + Number(amount)
    }));

    setAmount('');
    setType("Food & Groceries");
  };

  const handleDelete = (category) => {
    setEntries(prev => ({
      ...prev,
      [category]: 0
    }));
  };

  const handleEdit = (category) => {
    setEditMode(category);
    setEditAmount(entries[category]);
  };

  const handleSaveEdit = () => {
    if (!editAmount) return;
    setEntries(prev => ({
      ...prev,
      [editMode]: Number(editAmount)
    }));
    setEditMode(null);
    setEditAmount('');
  };

  return (
    <div className="App">
      <h1>EXPENSE TRACKER</h1>

      <div className="budgetEntryCard">
        <form onSubmit={handleSubmit}>
          <div className="budgetEntry">
            <label>Enter Expense (Rs): </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="selectType">
            <label>Select Type of Expense: </label>
            <select name="expenseType" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="Food & Groceries">Food & Groceries</option>
              <option value="Travel">Travel</option>
              <option value="Others">Others</option>
            </select>
          </div>
          <button type="submit">Submit</button>
        </form>
        <p>Total Expenses: {entries["Food & Groceries"]+ entries["Travel"]+ entries["Others"]}</p>
        <div style={{ marginTop: '30px' }}>
          <h2>Expense Entries</h2>

          {Object.entries(entries).map(([key, value]) => (
            <div key={key} style={{ marginBottom: '10px' }}>
              <strong>{key}</strong>: Rs. {value}{" "}
              <button onClick={() => handleEdit(key)}>Edit</button>
              <button onClick={() => handleDelete(key)}>Delete</button>

              {editMode === key && (
                <div style={{ marginTop: '5px' }}>
                  <input
                    type="number"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                  />
                  <button onClick={handleSaveEdit}>Save</button>
                  <button onClick={() => setEditMode(null)}>Cancel</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
