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

export const useRooms = () => {
  const { data, error, mutate } = useSWR(`/api/rooms`, fetcher);
  return {
    rooms: data ? data.rooms : {},
    isLoading: !error && !data,
    isError: error || data?.error,
    mutate,
  };
};

export const useBookings = (date) => {
  const { data, error, mutate } = useSWR(`/api/bookings?date=${date}`, fetcher);
  return {
    bookings: data ? data.bookings : {},
    isLoading: !error && !data,
    isError: error || data?.error,
    mutate,
  };
};
