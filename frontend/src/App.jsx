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

function getEventTitle(event) {
  const attendeeNames = event.profileIds?.map((profile) => profile.name).filter(Boolean) || [];

  if (attendeeNames.length === 0) return "Scheduled Session";
  if (attendeeNames.length === 1) return `${attendeeNames[0]}'s Session`;
  if (attendeeNames.length === 2) return attendeeNames.join(" & ");

  return `${attendeeNames[0]} +${attendeeNames.length - 1} attendees`;
}

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
      <header className="topbar">
        <div className="brand">
          <h1>Event Management System</h1>
        </div>

        <nav className="topnav" aria-label="Primary">
          <button type="button" className="nav-link nav-link-active">
            Events
          </button>
          <button type="button" className="nav-link">
            Schedule
          </button>
          <button type="button" className="nav-link">
            Guests
          </button>
          <button type="button" className="header-cta">
            Create Event
          </button>
        </nav>
      </header>

      {error && <div className="error">{error}</div>}

      <div className="layout">
        <div className="left">
          <div className="card">
            <h2>Create User</h2>
            <label className="field">
              <span className="field-label">Full Name</span>
              <input
                placeholder="e.g. Sarah Jenkins"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>

            <label className="field">
              <span className="field-label">Timezone</span>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz}>{tz}</option>
                ))}
              </select>
            </label>

            <button onClick={handleCreateUser}>Add User</button>
          </div>

          <div className="card">
            <h2>Create Event</h2>
            <div className="field">
              <span className="field-label">Attendee Multi-Select</span>
              <div className="checkboxes">
                {users.map((u) => (
                  <label key={u._id} className="checkbox-pill">
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
                    <span>{u.name}</span>
                  </label>
                ))}
                {users.length === 0 && (
                  <p className="muted">Add a user first to schedule events.</p>
                )}
              </div>
            </div>

            <div className="datetime-grid">
              <label className="field">
                <span className="field-label">Start</span>
                <input
                  type="datetime-local"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                />
              </label>

              <label className="field">
                <span className="field-label">End</span>
                <input
                  type="datetime-local"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                />
              </label>
            </div>

            <button onClick={handleCreateEvent}>Create Event</button>
          </div>
        </div>

        <div className="right">
          <div className="events-shell">
            <div className="events-header">
              <h2>Active Events</h2>

              <label className="filter">
                <span className="filter-label">Showing For:</span>
                <select value={activeUserId} onChange={(e) => loadEvents(e.target.value)}>
                  <option value="">Select User</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <ul className="event-list">
              {events.map((ev) => (
                <li key={ev._id} className="event-item">
                  {editingEventId === ev._id ? (
                    <div className="event-edit">
                      <div className="datetime-grid">
                        <input
                          type="datetime-local"
                          value={editStart}
                          onChange={(e) => setEditStart(e.target.value)}
                        />
                        <input
                          type="datetime-local"
                          value={editEnd}
                          onChange={(e) => setEditEnd(e.target.value)}
                        />
                      </div>
                      <div className="event-actions">
                        <button onClick={() => handleSaveEdit(ev._id)}>Save</button>
                        <button className="secondary-button" onClick={cancelEdit}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="event-details">
                        <div className="event-thumb" aria-hidden="true">
                          {dayjs(ev.startUTC).format("DD")}
                        </div>
                        <div>
                          <strong className="event-title">
                            {getEventTitle(ev)}
                          </strong>
                          <div className="event-time">
                            {dayjs(ev.startUTC)
                              .tz(displayTimezone)
                              .format("DD MMM YYYY, hh:mm A")}
                            {" - "}
                            {dayjs(ev.endUTC)
                              .tz(displayTimezone)
                              .format("hh:mm A")}
                          </div>
                          <div className="muted">Timezone: {displayTimezone}</div>
                        </div>
                      </div>

                      <div className="event-actions">
                        <button className="secondary-button" onClick={() => startEdit(ev)}>
                          Edit
                        </button>
                        <button className="secondary-button danger-button" onClick={() => handleDeleteEvent(ev._id)}>
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}

              {events.length === 0 && (
                <li className="empty-state">
                  <p className="muted">
                    {activeUserId
                      ? "No events for this user."
                      : "Select a user to view scheduled events."}
                  </p>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
