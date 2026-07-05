import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications } from '../store/appSlice.js';

export const useSocket = () => {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user) return undefined;
    const socketUrl =
      import.meta.env.VITE_SOCKET_URL || `${window.location.protocol}//${window.location.hostname || 'localhost'}:5000`;
    const socket = io(socketUrl);
    socket.emit('join', user.id);
    socket.on('notification:new', () => dispatch(fetchNotifications()));
    return () => socket.disconnect();
  }, [dispatch, user]);
};
