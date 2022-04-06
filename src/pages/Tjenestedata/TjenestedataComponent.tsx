import Link from 'next/link'
import styled from 'styled-components'
import { SetStateAction, useContext, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';


import { BodyShort, Heading, Panel, Popover } from '@navikt/ds-react';
import { Innholdstittel } from 'nav-frontend-typografi';
import CustomNavSpinner from '../../components/CustomNavSpinner';

import { Component, HistoryOfSpecificServiceDayEntry, HistoryOfSpecificServiceMonths, Service } from '../../types/navServices';
import { UserStateContext } from '../../components/ContextProviders/UserStatusContext';
import { RouterTjenestedata } from '../../types/routes';
import { IncidentCard } from '../../components/Incidents';
import { useLoader } from '../../utils/useLoader';
import { fetchAreasContainingService } from '../../utils/areasAPI';
import { handleAndSetStatusIcon } from '../../components/PortalServiceTile';
import { fetchServiceHistory } from '../../utils/servicesAPI';


const ErrorParagraph = styled.p`
    color: #ff4a4a;
    font-weight: bold;
    padding: 10px;
    border-radius: 5px;
`;

const CategoryContainer = styled.div`
    width: 100%;
    padding: 0;

    display: flex;
    flex-direction: column;

    .title-container {
        svg {
            margin-right: .6rem;
        }
        margin-bottom: 2rem;
    }

    .info-hover-text, .arrow {
        visibility: hidden;
    }

    .no-status-wrapper {
        :hover {
            .info-hover-text, .arrow {
                visibility: visible;
            }
        }
    }

    .no-status-wrapper {
        position: relative;
        display: inline-block;
        
        .info-hover-text {
            position: absolute;
            background: white;
            
            z-index: 100;
            border-radius: 4px;

            top: -.7rem;
            padding: .7rem;

            width: 200px;
        }
        
        .arrow {
            position: absolute;
            top: 25%;
            right: 0;

            border-top: 10px solid transparent;
            border-bottom: 10px solid transparent;
            border-right: 10px solid white;
        }
    }

    button {
        margin: 32px 0 40px 0;
    }

    .top-row {
        margin-bottom: 3rem;

        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 50px;

        .navds-panel{width: 100%;}
        .navds-panel:first-child {
            -moz-box-shadow: 0 0 10px rgba(0,0,0, 0.2);
            -webkit-box-shadow: 0 0 10px rgba(0,0,0, 0.2);
            box-shadow: 0 0 10px rgba(0,0,0, 0.2);
        }
        .navds-panel:last-child {border: none; background: none; height: max-content;}

        @media(min-width: 825px) {
            flex-direction: row;
        }
    }
    
    @media (min-width: 650px) {
        padding: 0rem 2rem;
    }
`


const ServiceContainer = styled.div`
    min-width: 100px;
    min-height: 75px;

    padding: 1rem;
    /* background-color: var(--navds-semantic-color-canvas-background-light); */
    border-radius: 10px;

    display: flex;
    flex-direction: column;
    justify-content: center;


    /* Padding på alle sub-elementer for å ha spacing */
    & > * {
        padding: 1rem 0;
    }

`

const ServiceWrapper = styled.div`
    width: 100%;
`

const TjenestedataContent: React.FC<{service: Service}> = ({service}) => {
    const [showHistory, changeShowHistory] = useState(false)

    const {data: areasContainingService, isLoading, reload} = useLoader(() => fetchAreasContainingService(service.id), [])

    const router = useRouter()

    if(isLoading) {
        return (
            <CustomNavSpinner />
        )
    }

    if (!service) {
        return <ErrorParagraph>Kunne ikke hente tjenesten. Hvis problemet vedvarer, kontakt support.</ErrorParagraph>
    }

    return (
        <CategoryContainer>
            <div className="title-container"><Innholdstittel>{handleAndSetStatusIcon(service.status, true)}{service.name}</Innholdstittel></div>

            {/* <div>
                <Button variant="secondary" onClick={() => router.push(RouterOpprettVarsling.PATH)}><Bell/> Bli varslet ved avvik</Button> 
            </div> */}


            <div className="top-row">
                <Panel>
                    <ServiceContainer>
                        <ServiceWrapper>
                            <ServiceData service={service} />
                        </ServiceWrapper>
                    </ServiceContainer>
                </Panel>
                
                <IncidentCard descriptionOfIncident="Beskrivelse" status={service.status} timeframe='Tidsrom' titleOfIncident='Tittel' logLink='Loglenke' />
            </div>
            
            <ServiceIncidentHistory service={service} />

        </CategoryContainer>
    )
}







/*------------------------------------------ Helpers for Root: below ------------------------------------------*/




const ServiceDataContainer = styled.div`
    &, .classified {
        display: flex;
        flex-direction: column;
    }    

    .separator {
        width: 100%;
        height: 1px;
        background-color: var(--navds-global-color-gray-400);
        margin: 16px 0;
    }

    a {
        /* color: var(--navds-semantic-color-link); */
        color: black;
    }
`





const ServiceData: React.FC<{service: Service}> = ({service}) => {
    const { navIdent } = useContext(UserStateContext)

    const regex = new RegExp(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi)


    const { type, serviceDependencies, componentDependencies, id, monitorlink, team, areasContainingThisService } = service

    return (
        <>
        {navIdent &&
            <ServiceDataContainer>
                <BodyShort spacing><b>Team</b></BodyShort>
                <BodyShort>{team}</BodyShort>

                <span className="separator" />

                    
                <BodyShort spacing><b>Avhengigheter til tjenester</b></BodyShort>

                <div>
                    {serviceDependencies.length > 0
                    ?
                        <ServicesAndComponentsList serviceDependencies={serviceDependencies} />
                    :
                        <BodyShort>Ikke definert</BodyShort>
                    }
                </div>


                <span className="separator" />


                <BodyShort spacing><b>Avhengigheter til komponenter</b></BodyShort>

                {componentDependencies.length > 0 
                ?

                    <ServicesAndComponentsList componentDependencies={componentDependencies} />


                :
                    <BodyShort>Ikke definert</BodyShort>
                }

                <span className="separator" />







                <BodyShort spacing><b>Områder som inneholder tjenesten</b></BodyShort>
                <ul>
                    {areasContainingThisService.map((area, index) => {
                        if(areasContainingThisService.length != index+1) {
                            return (
                                <li key={area.id}>{area.name}, </li>
                            )
                        } return (
                            <li key={area.id}>{area.name}</li>
                        )
                    })}
                </ul>

                <span className="separator" />

                <BodyShort spacing><b>Monitorlenke</b></BodyShort>
                <BodyShort>{regex.test(monitorlink) ? <a href={monitorlink}>{monitorlink}</a> : "Ikke definert"}</BodyShort>
            </ServiceDataContainer>
        }
        </>
    )
}





/*------------------------------------------  ------------------------------------------*/



const PublicDataContainer = styled.div`
    display: flex;
    flex-flow: column;
    justify-content: center;
`


const ServiceIncidentHistory: React.FC<{service: Service}>= ({service}) => {
    const [isLast90Days, setIsLast90Days] = useState<boolean>(true)
    // TODO: Henting av tjenestehistorikkdata som driftsmeldinger og diverse
    const { data, isLoading, reload } = useLoader(() => fetchServiceHistory(service.id), [])

    const router = useRouter()

    useEffect(() => {
        router.query.history == ("90dager" || undefined) ? setIsLast90Days(true) : setIsLast90Days(false)
    },[router])

    if(isLoading || isLast90Days == undefined) {
        return <CustomNavSpinner />
    }


    return (
        <PublicDataContainer>
            <span>
                <Heading size="medium" level="2" spacing>Historikk</Heading>
            </span>

            <TabHistory setIsLast90Days={setIsLast90Days} isLast90Days={isLast90Days} />
            <HistoryOfService service={service} isLast90Days={isLast90Days} serviceHistory={data.history} />

        </PublicDataContainer>
    )
}






const TabMenu = styled.ul`
    list-style: none;
    padding: 0;
    width: 100%;

    span:first-child {
        padding: 1rem 1rem 1rem 0;
    }

    span:not(:first-child) {
        padding: 1rem;
    }

    li {

        display: inline-block;

        :hover {
            cursor: pointer;
        }

        &.inactive {
            border-bottom: transparent 3px solid;
            
            :hover {
                border-bottom: var(--navds-global-color-blue-500) 3px solid;
            }
        }
        &.active {
            border-bottom: var(--navds-semantic-color-focus) 3px solid;
        }

        :focus, :active {
            background-color: transparent;
            outline: var(--navds-semantic-color-focus) 3px solid;
            box-shadow: 0 0 0 0;
            outline-offset: 3px;
        }

        a {
            text-decoration: none;
            color: black;
        }
    }
`

interface History {
    setIsLast90Days: React.Dispatch<SetStateAction<boolean>>,
    isLast90Days: boolean
}

const TabHistory = ({setIsLast90Days, isLast90Days}: History) => {
    const router = useRouter();
    const { id } = router.query

    return (
        <TabMenu>
            <span>
                <li className={isLast90Days ? "active" : "inactive"} onClick={() => setIsLast90Days(true)}>
                    <Link href={`${id}/?history=90dager`}>
                        Siste 90 dager
                    </Link>
                </li>
            </span>
            <span>
                <li className={!isLast90Days ? "active" : "inactive"} onClick={() => setIsLast90Days(false)}>
                    <Link href={`${id}/?history=månedlig`}>
                        Måned for måned
                    </Link>
                </li>
            </span>
        </TabMenu>
    )
}






const HistoryContainer = styled.div`
`

const DailyOverview = styled.div`
    height: 92px;
    background: white;
    padding: 20px;

    border-radius: 4px;

    width: min-content;

    display: flex;
    flex-direction: row;
    gap: 8px;

    .entry {
        display: block;
        position: relative;

        height: 100%;
        width: 8px;
        border-radius: 2px;
        
        &.ok {
            background: var(--navds-global-color-green-500);
        }
        &.issue {
            background: var(--navds-global-color-orange-500);
        }
        &.down {
            background: var(--navds-global-color-red-500);
        }
    }
`

const MonthlyOverview = styled.div`
    display: flex;
    gap: 16px;
`

const HistoryOfService: React.FC<{service: Service, isLast90Days: boolean, serviceHistory: HistoryOfSpecificServiceMonths[]}> = ({service, isLast90Days, serviceHistory}) => {
    let numberOfDaysInView = 0
    

    return (
        <HistoryContainer id="history">
            {isLast90Days
            ?
                <DailyOverview>
                    {serviceHistory.map(currentMonth => 
                        currentMonth.entries.map((dailyEntry, index) => {
                            if(numberOfDaysInView < 90) {
                                numberOfDaysInView ++

                                return (
                                    <DailyEntryComponent key={index} dailyEntry={dailyEntry} />
                                )
                            }
                            
                            return null

                        })
                    )}
                </DailyOverview>
            :
                <MonthlyOverview>
                    {serviceHistory.map((currentMonth, index) => {
                        // MIDLERTIDIG for å stoppe loop til max tre måneder tilbake per page
                        if(index > 2) {
                            return
                        }
                        return (
                            <MonthlyCalendarStatuses key={index} currentMonth={currentMonth} />
                        )
                    })}
                </MonthlyOverview>
            }
        </HistoryContainer>
    )
}







/* ------------------ HELPERS ------------------ */



const ServiceAndComponentDependencies = styled.ul`
    display: flex;
    flex-flow: row wrap;
    
    padding: 0;
    list-style: none;
    
    li {
        margin: .5rem 1rem;

        a {
            display: flex;
            align-items: center;

            svg {
                margin-right: 5px;
            }
        }
    }
`

const ServicesAndComponentsList: React.FC<{componentDependencies?: Component[], serviceDependencies?: Service[]}> = ({componentDependencies, serviceDependencies}) => {

    if(componentDependencies) {
        return (
            <ServiceAndComponentDependencies>
                {componentDependencies.map(component => {
                    return (
                        <li key={component.id}>
                            <Link href={RouterTjenestedata.PATH + component.id}>
                                <a>
                                    {handleAndSetStatusIcon(component.status)} {component.name}
                                </a>
                            </Link>
                        </li>
                    )
                })}
            </ServiceAndComponentDependencies>
        )
    }

    return (
        <ServiceAndComponentDependencies>
            {serviceDependencies.map(service => {
                return (
                    <li key={service.id}>
                        <Link href={RouterTjenestedata.PATH + service.id} >
                            <a>
                                {handleAndSetStatusIcon(service.status)} {service.name}
                            </a>
                        </Link>
                    </li>
                )
            })}
        </ServiceAndComponentDependencies>
    )
}




/* HELPERS FOR DAILY ENTRIES*/
const DailyEntry = styled.div`
    .navds-popover__content {
        svg {
            margin-right: 8px;
        }
    }
`

const DailyEntryComponent: React.FC<{dailyEntry: HistoryOfSpecificServiceDayEntry}> = ({dailyEntry}) => {
    const popoverRef = useRef(null);
    const [infoEntryVisible, changeInfoEntryVisible] = useState(false)
    const [infoContent, changeInfoContent] = useState("")
    const [infoStatusIconOnHover, setInfoStatusIconOnHover] = useState<JSX.Element>()


    const toggleEntryInfoOnHover = (status, information) => {
        if(information){
            changeInfoContent(information)
        }
        else{
            changeInfoContent("Statusinformasjon eksisterer ikke")
        }
        setInfoStatusIconOnHover(handleAndSetStatusIcon(status))
        changeInfoEntryVisible(true)
    }

    const { serviceId, date, status, information } = dailyEntry


    return (
        <DailyEntry>
            <Popover
                open={infoEntryVisible}
                onClose={() => changeInfoEntryVisible(false)}
                anchorEl={popoverRef.current}
                placement="top"
            >
                <Popover.Content>{infoStatusIconOnHover}{infoContent}</Popover.Content>
            </Popover>
            <span
                className={`entry ${status.toLowerCase()}`}
                onMouseEnter={() => toggleEntryInfoOnHover(status, information)}
                onMouseLeave={() => changeInfoEntryVisible(false)} ref={popoverRef}
            />
        </DailyEntry>
    )
}

// ----------------------




const MonthlyStatusContainer = styled.div``

const DaysInMonth = styled.div`
    width: 311px;
    height: 224px;

    padding: 20px;
    border-radius: 4px;
    background: white;

    display: grid;
    grid-template-columns: 32px 32px 32px 32px 32px 32px 32px;
    grid-gap: 8px;

    .empty-field {
        display: block;
        height: 32px;
    }
`

const Day = styled.div`
    border-radius: 4px;
    height: 32px;

    &.down {
        background: var(--navds-global-color-red-500);
    }

    &.issue {
        background: var(--navds-global-color-orange-500);
    }

    &.ok {
        background: var(--navds-global-color-green-500);
    }

    .navds-popover__content {
        display: flex;
        flex-direction: column;

        svg {
            margin-right: 8px;
        }
    }
`

interface MonthlyProps {
    currentMonth: HistoryOfSpecificServiceMonths
}

const MonthlyCalendarStatuses = ({currentMonth}: MonthlyProps) => {
    const [month, updateMonth] = useState<[]>([])
    const [weekInMonth, setWeekInMonth] = useState<number[]>([0, 1, 2, 3, 4, 5, 6])
    
    const firstDay = new Date(currentMonth.entries[0].date)    
    const firstDayOfMonth = firstDay.getDay()
    
    return (
        <MonthlyStatusContainer>
            <div className="calendar-header">
                {currentMonth.month}
            </div>

            <DaysInMonth>
                {currentMonth.entries.map((day, index) => {
                    const dateConverted = new Date(day.date)
                    if(index < firstDayOfMonth) {
                        return <div className="empty-field"/>
                    }

                    if (index < 31)
                        return (
                            <DayComponent key={index} day={day} />
                    )
                })}
            </DaysInMonth>
        </MonthlyStatusContainer>
    )
}






const DayComponent: React.FC<{day: HistoryOfSpecificServiceDayEntry}> = ({day}) => {
    const popoverRef = useRef(null);
    const [infoEntryVisible, changeInfoEntryVisible] = useState(false)
    const [infoContent, changeInfoContent] = useState("")
    const [infoStatusIconOnHover, setInfoStatusIconOnHover] = useState<JSX.Element>()

    const toggleEntryInfoOnHover = (status, information) => {
        if(information){
            changeInfoContent(information)
        }
        else{
            changeInfoContent("Statusinformasjon eksisterer ikke")
        }
        setInfoStatusIconOnHover(handleAndSetStatusIcon(status))
        changeInfoEntryVisible(true)
    }

    const { date, serviceId, status, information} = day

    let statusMessage;

    switch (status) {
        case "OK":
            statusMessage = "Ingen nedetid"
            break;
        case "ISSUE":
            statusMessage = "Avvik på tjeneste"
            break;
        case "DOWN":
            statusMessage = "Tjeneste var nede"
            break;
        default:
            break;
    }

    return (
        <Day className={status.toLowerCase()} onMouseEnter={() => toggleEntryInfoOnHover(status, information)} onMouseLeave={() => changeInfoEntryVisible(false)} ref={popoverRef}>
        
            <Popover
                open={infoEntryVisible}
                onClose={() => changeInfoEntryVisible(false)}
                anchorEl={popoverRef.current}
                placement="top"
            >
                <Popover.Content>
                    <Heading spacing size="medium" level="2">
                        {infoStatusIconOnHover}{statusMessage}
                    </Heading>
                    {infoContent}
                </Popover.Content>
            </Popover>
        </Day>
    )
}


export default TjenestedataContent