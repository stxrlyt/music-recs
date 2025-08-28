'use client';

import React, {
    createContext, useContext, useEffect, useState, ReactNode,
} from 'react';
import {
    getDefaultSession, 
    handleIncomingRedirect, 
    Session,
} from '@inrupt/solid-client-authn-browser';

interface SolidSessionContextType {
    session: Session;
    isLoggedIn: boolean;
    login: (options: {
        oidcIssuer: string;
        redirectUrl: string;
        clientId: string;
        clientName: string;
    }) => Promise<void>;
    logout: () => Promise<void>;
}

const SolidSessionContext = createContext<SolidSessionContextType | undefined>(undefined);

export function SolidSessionProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<Session>(getDefaultSession());
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        async function init() {
            await handleIncomingRedirect({ restorePreviousSession: true });
            const sess = getDefaultSession();
            setSession(sess);
            setIsLoggedIn(sess.info.isLoggedIn);
            setLoading(false);
        }
        init();
    }, []);

    const login = async ({
        oidcIssuer,
        redirectUrl,
        clientId,
        clientName,
    }: {
        oidcIssuer: string;
        redirectUrl: string;
        clientId: string;
        clientName: string;
    }) => {
        await session.login({oidcIssuer, redirectUrl, clientId, clientName});
    };

    const logout = async () => {
        await session.logout();
        setIsLoggedIn(false);
        localStorage.clear();
    };

    if (loading) {
        return <div>Authenticating...</div>;
    }

    return (
        <SolidSessionContext.Provider
            value={{
                session, isLoggedIn, login, logout
            }}
        >
            {children}
        </SolidSessionContext.Provider>
    );
}

export function useSolidSession(): SolidSessionContextType {
    const context = useContext(SolidSessionContext);

    if(!context){
        if (typeof window === 'undefined'){
            return {
                session: getDefaultSession(),
                isLoggedIn: false,
                login: async () => {},
                logout: async () => {},
            };
        }

        console.warn(
            'useSolidSession must be used within a SolidSessionProvider'
        );
        return {
            session: getDefaultSession(),
            isLoggedIn: false,
            login: async () => {},
            logout: async () => {},
        };
    }
    return context;
}