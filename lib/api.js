import { request } from "./helpers";

export const cancelBooking = async (bookingId) =>
  request(`/api/bookings/${bookingId}`, {
    method: "DELETE",
  });

export const book = async (datetime, roomName) =>
  request("/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ datetime, room_name: roomName }),
  });

export const addAdmin = async (email) =>
  request("/api/admins", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

export const updateRoomCapacity = async (roomName, capacity) =>
  request(`/api/rooms/${roomName}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ capacity }),
  });

export const updateRoomActiveState = async (roomName, state) =>
  request(`/api/rooms/${roomName}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ active: state }),
  });
