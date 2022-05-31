import { useRouter } from 'next/router';
import Head from 'next/head'
import { useEffect, useState } from 'react';

import DashboardFromId from './Dashboard/[dashboardId]';
import { RouterInternt, RouterPrivatperson } from '../types/routes';
import CustomNavSpinner from '../components/CustomNavSpinner';
import { UserData } from '../types/userData';
import { checkLoginInfoAndState } from '../utils/checkLoginInfoAndState';



export const backendPath = process.env.NEXT_PUBLIC_BACKENDPATH


export default function Home() {
    const router = useRouter()
    const [atHomePage] = useState(false)
    const [userData, setUserData] = useState<UserData>(undefined)

    useEffect(() => {
        (async function () {
            const user: UserData = await checkLoginInfoAndState()
            setUserData(user)
            if(user.navIdent && router.isReady && router.asPath == "/") {
                router.push(RouterInternt.PATH)   
            }

            else if (router.isReady && router.asPath == "/") {
                router.push(RouterPrivatperson.PATH)
            }
        })()
    }, [router])

    if(router.isReady) {
        return <CustomNavSpinner />
    }


    return (
        <>
            <Head>
                <link rel="icon" href="/sp/favicon.ico" />
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
                <meta name="title" content="Navstatus" />
                <meta name="description" content="Status Nav digitale tjenester er en oversiktsside for Navs ulike tjenester til borgere, arbeidsgivere og samarbeidspartnere." />
                <meta property="image" content="https://www.nav.no/dekoratoren/media/nav-logo-red.svg" />
                <meta property="url" content="https://status.nav.no" />
                <meta property="type" content="website" />


                {/* <!-- Open Graph / Facebook --> */}
                <meta property="og:site_name" content="Status Nav digitale tjenester" />
                <meta property="og:title" content="Status Nav digitale tjenester" />
                <meta property="og:description" content="Status Nav digitale tjenester er en oversiktsside for Navs ulike tjenester til borgere, arbeidsgivere og samarbeidspartnere." />
                <meta property="og:image" content="https://www.nav.no/dekoratoren/media/nav-logo-red.svg" />
                <meta property="og:url" content="https://portal.labs.nais.io/Dashboard/Privatperson" />
                <meta property="og:type" content="website" />


                {/* <!-- Twitter --> */}
                <meta property="twitter:card" content="summary_large_image" />
                <meta property="twitter:url" content="https://portal.labs.nais.io/Dashboard/Privatperson" />
                <meta property="twitter:title" content="Navstatus" />
                <meta property="twitter:description" content="Status Nav digitale tjenester er en oversiktsside for Navs ulike tjenester til borgere, arbeidsgivere og samarbeidspartnere." />
                <meta property="twitter:image" content="https://www.nav.no/dekoratoren/media/nav-logo-red.svg" />
            </Head>
            {atHomePage &&
                <DashboardFromId/>
            }
        </>
    )
}

