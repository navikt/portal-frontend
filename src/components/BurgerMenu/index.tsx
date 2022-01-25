import Link from 'next/link'
import { useRouter } from 'next/router'
import { useContext, useState } from "react";
import styled from 'styled-components'

import { Close, Employer, Hamburger, Login } from '@navikt/ds-icons'
import Popover, {PopoverOrientering} from 'nav-frontend-popover';
import Lenke from 'nav-frontend-lenker';
import { Button } from '@navikt/ds-react';

import { UserStateContext } from '../../components/ContextProviders/UserStatusContext';
import { UserData } from '../../types/userData';
import { LoginRoute } from '../../types/routes';

const BurgerMenuContainer = styled.div`
    z-index: 10;

    transition: 0.2s ease-in-out;

    background-color: transparent;
    color: #0067c5;

    .hamburger-ikon, .close-ikon {
        width: 28px;
        height: 24px;

        position: relative;
        display: block;
    }

    .closed-burger {
        display: none;
    }
    
    .open {
        font-weight: bold;
    }
`

const PopoverCustomized = styled(Popover)`
    .popover-container {
        padding: 1rem 2rem;   
    }
    .popover-content {
        display: flex;
        flex-direction: row;
    }
    section {
        ul {
            list-style: none;
            padding: 0;
            margin: 1rem;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            a {
                color: #0067c5;
                background: none;
                text-decoration: underline;
                cursor: pointer;
                :hover {
                    text-decoration: none;
                }
            }
            li {
                padding: 1rem 0;
            }
            .popover-link-ikon {
                margin-right: 0.5rem;
            }
        }
    }
`

const Menu = styled.button`
    
`


const BurgerMenu = () => {
	useRouter()

    const [isLoggedIn, changeLoginState] = useState(true)
    const [anker, setAnker] = useState(undefined)
    /* Denne skal brukes når vi får mer forståelse av SSO-løsningen:
    const [maxNumberOfTiles, changeMaxNumberOfTiles] = useState()
    */

    const togglePopover = (event) => {
        if(anker) {
            setAnker(undefined)
            return
        }
        setAnker(event)
    }

    const closePopover = () => {
        if(anker) {
            setAnker(undefined)
        }
    }

    const DropdownMenuContainer = () => {
        return (
            <>
                <PopoverCustomized
                    ankerEl={anker}
                    orientering={PopoverOrientering.Under}
                    onRequestClose={closePopover}
                >
                    <PopoverContent />
                </PopoverCustomized>
            </>
        )
    }
    
    return (
        <BurgerMenuContainer onClick={(event) => togglePopover(event.currentTarget)}>
            <Button variant="secondary" id="menu-container" aria-expanded={!!anker} onClick={togglePopover}>
                <span><Hamburger className={!anker ? "hamburger-ikon" : "closed-burger"}/></span>
                <span><Close className={!!anker ? "close-ikon" : "closed-burger"}/></span>
                <span className="menu-text">Meny</span>
            </Button>
            <DropdownMenuContainer />
        </BurgerMenuContainer>
    )
}






/*------------ Helpers below ------------*/






const PopoverContent = () => {
    const user = useContext<UserData>(UserStateContext)



    return (
        <div className="popover-container">
            <strong>{user.name}</strong>
            <div className="popover-content">
                <section>
                    <ul>
                        <li><Link href="/Dashboard/Privatperson">Privatperson</Link></li>
                        <li><Link href="/Dashboard/Arbeidsgiver">Arbeidsgiver</Link></li>
                        <li><Link href="/Dashboard/Samarbeidspartner">Samarbeidspartner</Link></li>
                        <li><Link href="/Dashboard/Internt">Internt (Kun for innloggede nav brukere)</Link></li>
                    </ul>
                </section>
                
                <section>
                    <ul>
                        <li><Lenke href="#0">Min side</Lenke></li>
                        <li><Lenke href="#0">Mine varsler</Lenke></li>
                        {user.navIdent &&
                            <>
                                <li>
                                    <Lenke href="/Admin">
                                        <Employer className="popover-link-ikon" />
                                        Adminside
                                    </Lenke>
                                </li>

                                <li>
                                    <Lenke href="/oauth2/logout">
                                        <Login className="popover-link-ikon" />
                                        Logg ut
                                    </Lenke>
                                </li>
                            </>
                        }
                        {!user.name &&
                            <li>
                                <Lenke href={LoginRoute.PATH}>
                                    <Login className="popover-link-ikon" />
                                    {LoginRoute.NAME}
                                </Lenke>
                            </li>
                        }
                    </ul>
                </section>
            </div>
        </div>
                
    )
}


export default BurgerMenu