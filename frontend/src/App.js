import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

function App() {
  const [userId, setUserId] = useState("");
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
  });

  const [workoutForm, setWorkoutForm] = useState({
    workout_type: "",
    duration: "",
    notes: "",
    workout_date: "",
  });

  const [weightForm, setWeightForm] = useState({
    weight: "",
    entry_date: "",
  });

  const [users, setUsers] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [weights, setWeights] = useState([]);

  const API_BASE = "https://fitness-tracker-t55t.onrender.com";

  const selectedUser = useMemo(
    () => users.find((user) => String(user.id) === String(userId)),
    [users, userId],
  );

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/users`);
      const data = await res.json();
      setUsers(data);

      if (!userId && data.length > 0) {
        setUserId(String(data[0].id));
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const fetchWorkouts = async (selectedUserId) => {
    if (!selectedUserId) {
      setWorkouts([]);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/workouts/${selectedUserId}`);
      const data = await res.json();
      setWorkouts(data);
    } catch (err) {
      console.error("Error fetching workouts:", err);
    }
  };

  const fetchWeights = async (selectedUserId) => {
    if (!selectedUserId) {
      setWeights([]);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/weights/${selectedUserId}`);
      const data = await res.json();
      setWeights(data);
    } catch (err) {
      console.error("Error fetching weight entries:", err);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchWorkouts(userId);
      fetchWeights(userId);
    }
  }, [userId]);

  const handleCreateUser = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_BASE}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userForm),
      });

      const data = await res.json();

      setUserForm({ name: "", email: "" });
      await fetchUsers();

      if (data.id) {
        setUserId(String(data.id));
      }
    } catch (err) {
      console.error("Error creating user:", err);
    }
  };

  const handleCreateWorkout = async (e) => {
    e.preventDefault();

    try {
      await fetch(`${API_BASE}/workouts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: Number(userId),
          workout_type: workoutForm.workout_type,
          duration: Number(workoutForm.duration),
          notes: workoutForm.notes,
          workout_date: workoutForm.workout_date,
        }),
      });

      setWorkoutForm({
        workout_type: "",
        duration: "",
        notes: "",
        workout_date: "",
      });

      fetchWorkouts(userId);
    } catch (err) {
      console.error("Error creating workout:", err);
    }
  };

  const handleCreateWeight = async (e) => {
    e.preventDefault();

    try {
      await fetch(`${API_BASE}/weights`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: Number(userId),
          weight: Number(weightForm.weight),
          entry_date: weightForm.entry_date,
        }),
      });

      setWeightForm({
        weight: "",
        entry_date: "",
      });

      fetchWeights(userId);
    } catch (err) {
      console.error("Error creating weight entry:", err);
    }
  };

  const handleDeleteWorkout = async (id) => {
    try {
      await fetch(`${API_BASE}/workouts/${id}`, {
        method: "DELETE",
      });
      fetchWorkouts(userId);
    } catch (err) {
      console.error("Error deleting workout:", err);
    }
  };

  const handleDeleteWeight = async (id) => {
    try {
      await fetch(`${API_BASE}/weights/${id}`, {
        method: "DELETE",
      });
      fetchWeights(userId);
    } catch (err) {
      console.error("Error deleting weight entry:", err);
    }
  };

  const latestWeight = weights.length > 0 ? weights[0].weight : "—";
  const totalWorkoutMinutes = workouts.reduce(
    (sum, workout) => sum + Number(workout.duration),
    0,
  );

  return (
    <div className="app">
      <header className="hero">
        <h1>Fitness Tracker</h1>
        <p>Track users, workouts, and weight progress in one place.</p>
      </header>

      <section className="summary-grid">
        <div className="summary-card">
          <h3>Selected User</h3>
          <p>{selectedUser ? selectedUser.name : "No user selected"}</p>
        </div>
        <div className="summary-card">
          <h3>Total Workouts</h3>
          <p>{workouts.length}</p>
        </div>
        <div className="summary-card">
          <h3>Total Minutes</h3>
          <p>{totalWorkoutMinutes}</p>
        </div>
        <div className="summary-card">
          <h3>Latest Weight</h3>
          <p>{latestWeight}</p>
        </div>
      </section>

      <section className="grid">
        <div className="card">
          <h2>Create User</h2>
          <form onSubmit={handleCreateUser} className="form">
            <input
              type="text"
              placeholder="Name"
              value={userForm.name}
              onChange={(e) =>
                setUserForm({ ...userForm, name: e.target.value })
              }
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={userForm.email}
              onChange={(e) =>
                setUserForm({ ...userForm, email: e.target.value })
              }
              required
            />
            <button type="submit">Create User</button>
          </form>
        </div>

        <div className="card">
          <h2>Select User</h2>
          <select
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="select"
          >
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.id} - {user.name} ({user.email})
              </option>
            ))}
          </select>
        </div>

        <div className="card">
          <h2>Add Workout</h2>
          <form onSubmit={handleCreateWorkout} className="form">
            <input
              type="text"
              placeholder="Workout Type"
              value={workoutForm.workout_type}
              onChange={(e) =>
                setWorkoutForm({
                  ...workoutForm,
                  workout_type: e.target.value,
                })
              }
              required
            />
            <input
              type="number"
              placeholder="Duration (minutes)"
              value={workoutForm.duration}
              onChange={(e) =>
                setWorkoutForm({
                  ...workoutForm,
                  duration: e.target.value,
                })
              }
              required
            />
            <input
              type="text"
              placeholder="Notes"
              value={workoutForm.notes}
              onChange={(e) =>
                setWorkoutForm({
                  ...workoutForm,
                  notes: e.target.value,
                })
              }
            />
            <input
              type="date"
              value={workoutForm.workout_date}
              onChange={(e) =>
                setWorkoutForm({
                  ...workoutForm,
                  workout_date: e.target.value,
                })
              }
              required
            />
            <button type="submit">Add Workout</button>
          </form>
        </div>

        <div className="card">
          <h2>Add Weight Entry</h2>
          <form onSubmit={handleCreateWeight} className="form">
            <input
              type="number"
              step="0.1"
              placeholder="Weight"
              value={weightForm.weight}
              onChange={(e) =>
                setWeightForm({
                  ...weightForm,
                  weight: e.target.value,
                })
              }
              required
            />
            <input
              type="date"
              value={weightForm.entry_date}
              onChange={(e) =>
                setWeightForm({
                  ...weightForm,
                  entry_date: e.target.value,
                })
              }
              required
            />
            <button type="submit">Add Weight</button>
          </form>
        </div>
      </section>

      <section className="grid bottom-grid">
        <div className="card">
          <h2>Workouts</h2>
          {workouts.length === 0 ? (
            <p className="empty">No workouts yet.</p>
          ) : (
            <ul className="list">
              {workouts.map((workout) => (
                <li key={workout.id} className="list-item">
                  <div>
                    <strong>{workout.workout_type}</strong>
                    <p>
                      {workout.duration} min | {workout.notes || "No notes"} |{" "}
                      {new Date(workout.workout_date).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    className="danger-btn"
                    onClick={() => handleDeleteWorkout(workout.id)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <h2>Weight History</h2>
          {weights.length === 0 ? (
            <p className="empty">No weight entries yet.</p>
          ) : (
            <ul className="list">
              {weights.map((entry) => (
                <li key={entry.id} className="list-item">
                  <div>
                    <strong>{entry.weight} lbs</strong>
                    <p>{new Date(entry.entry_date).toLocaleDateString()}</p>
                  </div>
                  <button
                    className="danger-btn"
                    onClick={() => handleDeleteWeight(entry.id)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

export default App;
