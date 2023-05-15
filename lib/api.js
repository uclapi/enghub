import { request } from "./helpers";

export const cancelBooking = async (bookingId) =>
  request(`/api/bookings/${bookingId}`, {
    method: "DELETE",
  });

export const book = async (datetime, roomId) =>
  request("/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ datetime, room_id: roomId }),
  });

export const addAdmin = async (email) =>
  request("/api/admins", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

export const updateRoom = async (
  roomId,
  { capacity, active, adminOnly, bookBySeat, group, description }
) =>
  request(`/api/rooms/${roomId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      active,
      capacity,
      description,
      admin_only: adminOnly,
      book_by_seat: bookBySeat,
      restricted_to_group: group,
    }),
  });

export const addRoom = async (buildingId, roomName) =>
  request(`/api/rooms`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ building_id: buildingId, name: roomName }),
  });
