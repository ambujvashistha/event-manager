const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export async function getUsers(name) {
  const url = name ? `${BASE_URL}/users?name=${name}` : `${BASE_URL}/users`;

  const res = await fetch(url);
  return res.json();
}

export async function createUser(data) {
  const res = await fetch(`${BASE_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function createEvent(data) {
  const res = await fetch(`${BASE_URL}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function getEventsForUser(userId) {
  const res = await fetch(`${BASE_URL}/events/user/${userId}`);
  return res.json();
}
