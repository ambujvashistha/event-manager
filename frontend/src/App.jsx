import { useEffect, useState } from "react";
import { getUsers, createUser, createEvent, getEventsForUser } from "./api";

function App() {
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);

  const [name, setName] = useState("");
  const [timezone, setTimezone] = useState("Asia/Kolkata");

  const [selectedUsers, setSelectedUsers] = useState([]);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  async function loadUsers() {
    const data = await getUsers();
    setUsers(data);
  }

  async function loadEventsForUser(userId) {
    if (!userId) {
      setEvents([]);
      return;
    }
    const data = await getEventsForUser(userId);
    setEvents(data);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleCreateUser() {
    if (!name) return;

    await createUser({ name, timezone });
    setName("");
    loadUsers();
  }

  async function handleCreateEvent() {
    if (!start || !end || selectedUsers.length === 0) return;

    await createEvent({
      profileIds: selectedUsers,
      start,
      end,
      timezone,
    });

    setStart("");
    setEnd("");
    setSelectedUsers([]);
  }
  return (
    <div style={{ padding: 20 }}>
      <h2>Create User</h2>

      <input
        placeholder="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        placeholder="timezone"
        value={timezone}
        onChange={(e) => setTimezone(e.target.value)}
      />

      <button onClick={handleCreateUser}>Add User</button>

      <hr />

      <h2>Create Event</h2>

      {users.map((u) => (
        <label key={u._id} style={{ display: "block" }}>
          <input
            type="checkbox"
            checked={selectedUsers.includes(u._id)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedUsers([...selectedUsers, u._id]);
              } else {
                setSelectedUsers(selectedUsers.filter((id) => id !== u._id));
              }
            }}
          />
          {u.name}
        </label>
      ))}

      <input
        type="datetime-local"
        value={start}
        onChange={(e) => setStart(e.target.value)}
      />

      <input
        type="datetime-local"
        value={end}
        onChange={(e) => setEnd(e.target.value)}
      />

      <button onClick={handleCreateEvent}>Create Event</button>

      <hr />

      <h2>View Events</h2>

      <select onChange={(e) => loadEventsForUser(e.target.value)}>
        <option value="">Select user</option>
        {users.map((u) => (
          <option key={u._id} value={u._id}>
            {u.name}
          </option>
        ))}
      </select>

      <ul>
        {events.map((ev) => (
          <li key={ev._id}>
            {new Date(ev.startUTC).toUTCString()} →{" "}
            {new Date(ev.endUTC).toUTCString()}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
