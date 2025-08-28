'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useSolidSession } from '@/context/solidsession';
import toast, { Toaster } from 'react-hot-toast';

export default function LoginPage() {
    const [IDp, setIDp] = useState('');
    const [loading, setLoading] = useState(false);
    const {session, isLoggedIn} = useSolidSession();
    const router = useRouter();

    useEffect(() => {
        if(isLoggedIn){
            router.replace('/');
        }
    }, [isLoggedIn, router]);

    useEffect(() => {
        setIDp('https://login.inrupt.com'); // setting default
    }, []);

    async function handleLogin() {
        if(!IDp) { // if provider is empty, give an error statement
            toast.error('Please enter an Identity Provider URL');
            return;
        }
        
        setLoading(true);
        try {
            await session.login({
                oidcIssuer: IDp,
                redirectUrl: window.location.origin + '/callback',
                clientName: 'Recommus',
            });
        } catch (error: any){
            toast.error(error.message || 'An error occurred while logging in');
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <h1 className="text-center text-lg font-bold">
                    Welcome to MuseRec!
                </h1>
                <h2 className="text-center text-sm">
                    Please input your OIDC provider to start.
                </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <form className="space-y-6">
                    <div>
                        <label 
                            htmlFor="oidc_provider" 
                            className="block text-sm font-medium leading-6 text-gray-900"
                        >
                            OIDC Provider
                        </label>
                        <div className="mt-2">
                            <input
                                placeholder="https://login.inrupt.com"
                                id="oidc_provider"
                                name="oidc_provider"
                                type="text"
                                autoComplete="off"
                                required
                                value={IDp}
                                onChange={(e) => setIDp(e.target.value)}
                                className="block w-full rounded-md border-0 py-3 px-3 text-gray-900 shadow-lg ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="flex w-full justify-center rounded-md bg-indigo-600 px-6 py-3 text-base font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                            Sign in
                        </button>
                    </div>
                </form>
            </div>
            <Toaster position="top-right" />
        </div>
    );
}