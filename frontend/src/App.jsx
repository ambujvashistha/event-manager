import { useEffect, useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezonePlugin from "dayjs/plugin/timezone";

import {
  getUsers,
  createUser,
  createEvent,
  getEventsForUser,
  deleteEvent,
  editEvent,
} from "./api";

dayjs.extend(utc);
dayjs.extend(timezonePlugin);

const TIMEZONES = ["UTC", "Asia/Kolkata", "America/New_York", "Europe/London"];

function App() {
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);

  const [name, setName] = useState("");
  const [timezone, setTimezone] = useState("Asia/Kolkata");

  const [selectedUsers, setSelectedUsers] = useState([]);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const [activeUserId, setActiveUserId] = useState("");
  const [error, setError] = useState("");
  const [editingEventId, setEditingEventId] = useState(null);
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");

  useEffect(() => {
    async function loadUsers() {
      const data = await getUsers();
      setUsers(data);
    }
    loadUsers();
  }, []);

  async function loadUsers() {
    const data = await getUsers();
    setUsers(data);
  }

  async function loadEvents(userId) {
    setActiveUserId(userId);
    if (!userId) {
      setEvents([]);
      return;
    }
    const data = await getEventsForUser(userId);
    setEvents(data);
  }

  async function handleCreateUser() {
    if (!name) return setError("Name is required");
    setError("");

    await createUser({ name, timezone });
    setName("");
    loadUsers();
  }
  async function handleDeleteEvent(eventId) {
    await deleteEvent(eventId);

    if (activeUserId) {
      loadEvents(activeUserId);
    }
  }

  function startEdit(ev) {
    setEditingEventId(ev._id);

    setEditStart(
      dayjs(ev.startUTC).tz(displayTimezone).format("YYYY-MM-DDTHH:mm")
    );
    setEditEnd(dayjs(ev.endUTC).tz(displayTimezone).format("YYYY-MM-DDTHH:mm"));
  }

  async function handleSaveEdit(eventId) {
    const res = await editEvent(eventId, {
      start: editStart,
      end: editEnd,
      timezone: displayTimezone,
    });

    if (res?.error) {
      setError(res.error);
    } else {
      setEditingEventId(null);
      loadEvents(activeUserId);
    }
  }

  function cancelEdit() {
    setEditingEventId(null);
  }

  async function handleCreateEvent() {
    if (!start || !end || selectedUsers.length === 0) {
      return setError("Select users and valid time range");
    }

    setError("");

    const res = await createEvent({
      profileIds: selectedUsers,
      start,
      end,
      timezone,
    });

    if (res?.error) {
      setError(res.error);
    } else {
      setStart("");
      setEnd("");
      setSelectedUsers([]);
      loadEvents(activeUserId);
    }
  }

  const activeUser = users.find((u) => u._id === activeUserId);
  const displayTimezone = activeUser?.timezone || "UTC";

  return (
    <div className="container">
      <h1>Event Management System</h1>

      {error && <div className="error">{error}</div>}

      <div className="layout">
        <div className="left">
          <div className="card">
            <h2>Create User</h2>

            <input
              placeholder="User name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
            >
              {TIMEZONES.map((tz) => (
                <option key={tz}>{tz}</option>
              ))}
            </select>

            <button onClick={handleCreateUser}>Add User</button>
          </div>

          <div className="card">
            <h2>Create Event</h2>

            <div className="checkboxes">
              {users.map((u) => (
                <label key={u._id}>
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(u._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers([...selectedUsers, u._id]);
                      } else {
                        setSelectedUsers(
                          selectedUsers.filter((id) => id !== u._id)
                        );
                      }
                    }}
                  />
                  {u.name}
                </label>
              ))}
            </div>

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
          </div>
        </div>

        {/* RIGHT */}
        <div className="right">
          <div className="card">
            <h2>Events</h2>

            <select onChange={(e) => loadEvents(e.target.value)}>
              <option value="">Select user</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name}
                </option>
              ))}
            </select>

            <ul className="event-list">
              {events.map((ev) => (
                <li key={ev._id} className="event-item">
                  {editingEventId === ev._id ? (
                    <div>
                      <input type="datetime-local" value={editStart} onChange={(e) => setEditStart(e.target.value)} />
                      <input type="datetime-local" value={editEnd} onChange={(e) => setEditEnd(e.target.value)} />
                      <button onClick={() => handleSaveEdit(ev._id)}> Save </button>
                      <button onClick={cancelEdit}>Cancel</button>
                    </div>
                  ) : (
                    <>
                      <div>
                        <strong>
                          {dayjs(ev.startUTC) .tz(displayTimezone) .format("DD MMM YYYY, hh:mm A")}
                          {" → "}
                          {dayjs(ev.endUTC) .tz(displayTimezone) .format("DD MMM YYYY, hh:mm A")}
                        </strong>

                        <div className="muted">Timezone: {displayTimezone}</div>
                      </div>

                      <div className="event-actions">
                        <button style={{margin: 5}} onClick={() => startEdit(ev)}>Edit</button>
                        <button style={{margin: 5}} onClick={() => handleDeleteEvent(ev._id)}> Delete </button>
                      </div>
                    </>
                  )}
                </li>
              ))}

              {events.length === 0 && (
                <p className="muted">No events for this user</p>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
