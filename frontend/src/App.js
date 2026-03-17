import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function App() {
  const [userId, setUserId] = useState("");
  const [userForm, setUserForm] = useState({ name: "", email: "" });
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

  const [editingWorkoutId, setEditingWorkoutId] = useState(null);
  const [editingWeightId, setEditingWeightId] = useState(null);

  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingWorkouts, setLoadingWorkouts] = useState(false);
  const [loadingWeights, setLoadingWeights] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const API_BASE = "https://fitness-tracker-t55t.onrender.com";

  const selectedUser = useMemo(
    () => users.find((user) => String(user.id) === String(userId)),
    [users, userId],
  );

  const chartData = useMemo(() => {
    return [...weights]
      .slice()
      .reverse()
      .map((entry) => ({
        date: new Date(entry.entry_date).toLocaleDateString(),
        weight: Number(entry.weight),
      }));
  }, [weights]);

  const clearAlerts = () => {
    setMessage("");
    setError("");
  };

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/users`);
      if (!res.ok) throw new Error("Could not load users");

      const data = await res.json();
      setUsers(data);

      setUserId((prevUserId) => {
        if (!prevUserId && data.length > 0) {
          return String(data[0].id);
        }
        return prevUserId;
      });
    } catch (err) {
      setError(err.message || "Error fetching users");
    } finally {
      setLoadingUsers(false);
    }
  }, [API_BASE]);

  const fetchWorkouts = async (selectedUserId) => {
    if (!selectedUserId) {
      setWorkouts([]);
      return;
    }

    setLoadingWorkouts(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/workouts/${selectedUserId}`);
      if (!res.ok) throw new Error("Could not load workouts");

      const data = await res.json();
      setWorkouts(data);
    } catch (err) {
      setError(err.message || "Error fetching workouts");
    } finally {
      setLoadingWorkouts(false);
    }
  };

  const fetchWeights = async (selectedUserId) => {
    if (!selectedUserId) {
      setWeights([]);
      return;
    }

    setLoadingWeights(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/weights/${selectedUserId}`);
      if (!res.ok) throw new Error("Could not load weight entries");

      const data = await res.json();
      setWeights(data);
    } catch (err) {
      setError(err.message || "Error fetching weight entries");
    } finally {
      setLoadingWeights(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (userId) {
      fetchWorkouts(userId);
      fetchWeights(userId);
    }
  }, [userId]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    clearAlerts();

    try {
      const res = await fetch(`${API_BASE}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userForm),
      });

      if (!res.ok) throw new Error("Could not create user");

      const data = await res.json();
      setUserForm({ name: "", email: "" });
      setMessage("User created successfully");
      await fetchUsers();

      if (data.id) {
        setUserId(String(data.id));
      }
    } catch (err) {
      setError(err.message || "Error creating user");
    }
  };

  const handleCreateWorkout = async (e) => {
    e.preventDefault();
    clearAlerts();

    try {
      const res = await fetch(`${API_BASE}/workouts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: Number(userId),
          workout_type: workoutForm.workout_type,
          duration: Number(workoutForm.duration),
          notes: workoutForm.notes,
          workout_date: workoutForm.workout_date,
        }),
      });

      if (!res.ok) throw new Error("Could not add workout");

      setWorkoutForm({
        workout_type: "",
        duration: "",
        notes: "",
        workout_date: "",
      });

      setMessage("Workout added");
      fetchWorkouts(userId);
    } catch (err) {
      setError(err.message || "Error creating workout");
    }
  };

  const handleCreateWeight = async (e) => {
    e.preventDefault();
    clearAlerts();

    try {
      const res = await fetch(`${API_BASE}/weights`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: Number(userId),
          weight: Number(weightForm.weight),
          entry_date: weightForm.entry_date,
        }),
      });

      if (!res.ok) throw new Error("Could not add weight entry");

      setWeightForm({
        weight: "",
        entry_date: "",
      });

      setMessage("Weight entry added");
      fetchWeights(userId);
    } catch (err) {
      setError(err.message || "Error creating weight entry");
    }
  };

  const handleUpdateWorkout = async (id, updatedWorkout) => {
    clearAlerts();

    try {
      const res = await fetch(`${API_BASE}/workouts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedWorkout),
      });

      if (!res.ok) throw new Error("Could not update workout");

      setMessage("Workout updated");
      setEditingWorkoutId(null);
      fetchWorkouts(userId);
    } catch (err) {
      setError(err.message || "Error updating workout");
    }
  };

  const handleUpdateWeight = async (id, updatedWeight) => {
    clearAlerts();

    try {
      const res = await fetch(`${API_BASE}/weights/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedWeight),
      });

      if (!res.ok) throw new Error("Could not update weight");

      setMessage("Weight entry updated");
      setEditingWeightId(null);
      fetchWeights(userId);
    } catch (err) {
      setError(err.message || "Error updating weight");
    }
  };

  const handleDeleteWorkout = async (id) => {
    clearAlerts();

    try {
      const res = await fetch(`${API_BASE}/workouts/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Could not delete workout");

      setMessage("Workout deleted");
      fetchWorkouts(userId);
    } catch (err) {
      setError(err.message || "Error deleting workout");
    }
  };

  const handleDeleteWeight = async (id) => {
    clearAlerts();

    try {
      const res = await fetch(`${API_BASE}/weights/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Could not delete weight entry");

      setMessage("Weight entry deleted");
      fetchWeights(userId);
    } catch (err) {
      setError(err.message || "Error deleting weight entry");
    }
  };

  const latestWeight = weights.length > 0 ? weights[0].weight : "—";
  const totalWorkoutMinutes = workouts.reduce(
    (sum, workout) => sum + Number(workout.duration),
    0,
  );

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <h1 className="brand">FitTrack</h1>
          <p className="sidebar-text">Your fitness dashboard</p>
        </div>

        <div className="sidebar-card">
          <p className="sidebar-label">Selected User</p>
          <h3>{selectedUser ? selectedUser.name : "No user selected"}</h3>
          <p className="sidebar-text">
            {selectedUser ? selectedUser.email : "Create a user to begin"}
          </p>
        </div>

        <div className="sidebar-card">
          <label className="field-label">Choose User</label>
          <select
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="select"
          >
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
        </div>
      </aside>

      <main className="main-content">
        <header className="hero">
          <div>
            <p className="eyebrow">Fitness Tracker</p>
            <h2>Track workouts, weight, and progress in one place</h2>
          </div>
          <div className="hero-badge">Live App</div>
        </header>

        {message && <div className="alert success">{message}</div>}
        {error && <div className="alert error">{error}</div>}

        <section className="stats-grid">
          <div className="stat-card">
            <span>Total Users</span>
            <strong>{users.length}</strong>
          </div>
          <div className="stat-card">
            <span>Total Workouts</span>
            <strong>{workouts.length}</strong>
          </div>
          <div className="stat-card">
            <span>Total Minutes</span>
            <strong>{totalWorkoutMinutes}</strong>
          </div>
          <div className="stat-card">
            <span>Latest Weight</span>
            <strong>{latestWeight}</strong>
          </div>
        </section>

        <section className="content-grid">
          <div className="card">
            <h3>Create User</h3>
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
            <h3>Add Workout</h3>
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
            <h3>Add Weight Entry</h3>
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

          <div className="card chart-card">
            <div className="card-header">
              <h3>Weight Progress</h3>
              <span>{weights.length} entries</span>
            </div>
            {loadingWeights ? (
              <p className="muted">Loading chart...</p>
            ) : chartData.length === 0 ? (
              <p className="muted">No weight data yet.</p>
            ) : (
              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={["dataMin - 2", "dataMax + 2"]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke="#2563eb"
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </section>

        <section className="bottom-grid">
          <div className="card">
            <div className="card-header">
              <h3>Workouts</h3>
              <span>
                {loadingWorkouts ? "Loading..." : `${workouts.length} total`}
              </span>
            </div>
            {loadingWorkouts ? (
              <p className="muted">⏳ Loading workouts...</p>
            ) : workouts.length === 0 ? (
              <p className="muted">No workouts yet.</p>
            ) : (
              <ul className="list">
                {workouts.map((workout) => (
                  <li key={workout.id} className="list-item">
                    {editingWorkoutId === workout.id ? (
                      <div className="form" style={{ width: "100%" }}>
                        <input
                          type="text"
                          defaultValue={workout.workout_type}
                          onChange={(e) =>
                            (workout.workout_type = e.target.value)
                          }
                        />
                        <input
                          type="number"
                          defaultValue={workout.duration}
                          onChange={(e) => (workout.duration = e.target.value)}
                        />
                        <input
                          type="text"
                          defaultValue={workout.notes}
                          onChange={(e) => (workout.notes = e.target.value)}
                        />
                        <input
                          type="date"
                          defaultValue={workout.workout_date?.slice(0, 10)}
                          onChange={(e) =>
                            (workout.workout_date = e.target.value)
                          }
                        />
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            onClick={() =>
                              handleUpdateWorkout(workout.id, workout)
                            }
                          >
                            Save
                          </button>
                          <button
                            className="danger-btn"
                            onClick={() => setEditingWorkoutId(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div>
                          <strong>{workout.workout_type}</strong>
                          <p>
                            {workout.duration} min ·{" "}
                            {workout.notes || "No notes"} ·{" "}
                            {new Date(
                              workout.workout_date,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            onClick={() => setEditingWorkoutId(workout.id)}
                          >
                            Edit
                          </button>
                          <button
                            className="danger-btn"
                            onClick={() => {
                              if (window.confirm("Delete this workout?")) {
                                handleDeleteWorkout(workout.id);
                              }
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card">
            <div className="card-header">
              <h3>Weight History</h3>
              <span>
                {loadingWeights ? "Loading..." : `${weights.length} total`}
              </span>
            </div>
            {loadingWeights ? (
              <p className="muted">⏳ Loading weight history...</p>
            ) : weights.length === 0 ? (
              <p className="muted">No weight entries yet.</p>
            ) : (
              <ul className="list">
                {weights.map((entry) => (
                  <li key={entry.id} className="list-item">
                    {editingWeightId === entry.id ? (
                      <div className="form" style={{ width: "100%" }}>
                        <input
                          type="number"
                          step="0.1"
                          defaultValue={entry.weight}
                          onChange={(e) => (entry.weight = e.target.value)}
                        />
                        <input
                          type="date"
                          defaultValue={entry.entry_date?.slice(0, 10)}
                          onChange={(e) => (entry.entry_date = e.target.value)}
                        />
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            onClick={() => handleUpdateWeight(entry.id, entry)}
                          >
                            Save
                          </button>
                          <button
                            className="danger-btn"
                            onClick={() => setEditingWeightId(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div>
                          <strong>{entry.weight} lbs</strong>
                          <p>
                            {new Date(entry.entry_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button onClick={() => setEditingWeightId(entry.id)}>
                            Edit
                          </button>
                          <button
                            className="danger-btn"
                            onClick={() => {
                              if (window.confirm("Delete this weight entry?")) {
                                handleDeleteWeight(entry.id);
                              }
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {loadingUsers && (
          <p className="muted footer-note">⏳ Loading users...</p>
        )}
      </main>
    </div>
  );
}

export default App;
