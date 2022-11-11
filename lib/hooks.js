import useSWR from "swr";
import { fetcher } from "./helpers";

export const useMyBookings = () => {
  const { data, error, mutate } = useSWR(`/api/my_bookings`, fetcher);
  return {
    bookings: data ? data.bookings : [],
    isLoading: !error && !data,
    isError: error || data?.error,
    mutate,
  };
};

export const useRooms = (buildingId) => {
  const { data, error, mutate } = useSWR(
    `/api/rooms?buildingId=${buildingId}`,
    fetcher
  );

  return {
    rooms: data ? data.rooms : [],
    isLoading: !error && !data,
    isError: error || data?.error,
    mutate,
  };
};

export const useRoom = (roomId) => {
  const { data, error, mutate } = useSWR(`/api/rooms/${roomId}`, fetcher);
  return {
    rooms: data ?? null,
    isLoading: !error && !data,
    isError: error || data?.error,
    mutate,
  };
};

export const useBuildings = () => {
  const { data, error, mutate } = useSWR(`/api/buildings`, fetcher);
  return {
    buildings: data ? data.buildings : [],
    isLoading: !error && !data,
    isError: error || data?.error,
    mutate,
  };
};

export const useBookings = (buildingId, date) => {
  const { data, error, mutate } = useSWR(
    `/api/bookings?date=${date}&buildingId=${buildingId}`,
    fetcher
  );
  return {
    bookings: data ? data.bookings : {},
    isLoading: !error && !data,
    isError: error || data?.error,
    mutate,
  };
};
