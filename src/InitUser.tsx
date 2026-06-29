'use client'
import { useSession } from 'next-auth/react'
import useGetMe from './hooks/useMehooks';


export default function InitUser() {
    const {status} = useSession();
    useGetMe(status === "authenticated"); // hooks ko hamesha comppnent ki lif cycle me hona chahiye
    return null;
}

