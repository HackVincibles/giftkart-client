import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        if (user) {
            const socketInstance = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
                withCredentials: true,
                transports: ['websocket', 'polling']
            });

            socketInstance.on('connect', () => {
                console.log('Socket connected:', socketInstance.id);
                setConnected(true);
                
                // Authenticate with server
                socketInstance.emit('authenticate', {
                    userId: user._id,
                    userType: (user.role === 'creator' || user.role === 'seller') ? 'seller' : 'user'
                });
            });

            socketInstance.on('disconnect', () => {
                console.log('Socket disconnected');
                setConnected(false);
            });

            setSocket(socketInstance);

            return () => {
                socketInstance.disconnect();
            };
        }
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket, connected }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};
