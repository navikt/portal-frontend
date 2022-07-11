import { toast, ToastContainer } from "react-toastify"
import styled from "styled-components"
import { useContext, useEffect, useState } from "react";
import router from "next/router";

import Layout from '../../../components/Layout';
import { Service, Component } from "../../../types/types";
import CustomNavSpinner from "../../../components/CustomNavSpinner";
import { fetchTypes } from "../../../utils/fetchTypes";

import { BodyShort, Button, Detail, Heading, Modal, Select, TextField } from "@navikt/ds-react";
import { Copy, Delete } from "@navikt/ds-icons";
import { ButtonContainer, DynamicListContainer, HorizontalSeparator } from "..";
import { TitleContext } from "../../../components/ContextProviders/TitleContext";
import { fetchAreas } from "../../../utils/areasAPI";
import { fetchComponents, postComponent } from "../../../utils/componentsAPI";
import { RouterAdminKomponenter } from "../../../types/routes";
import { EndPathComponents, EndPathServices } from "../../../utils/apiHelper";
import { backendPath } from "../..";


const NewComponentContainer = styled.div`
    display: flex;
    flex-direction: column;
    
    @media (min-width: 600px) {
        width: 600px;
    }

    input, select {
        margin: 1rem 0;
    }

    .button-container {
        display: flex;
        flex-flow: row nowrap;
        justify-content: space-between;
    }

`

const ModalContent = styled(Modal.Content)`
    width: 100vw;

    display: flex;
    align-items: center;
    flex-direction: column;
    
    .bottom {
        display: flex;
        flex-wrap: wrap;

        p {
            margin-right: 1rem;
        }
    }
`

export const getServerSideProps = async () => {
    const [resComponents, resServices] = await Promise.all([
        fetch(backendPath + EndPathComponents()),
        fetch(backendPath + EndPathServices())
    ])
    
    const allComponentsProps = await resComponents.json()
    const allServicesProps = await resServices.json()

    return {
        props: {
            allComponentsProps,
            allServicesProps
        }
    }
}


const NewComponent = ({allComponentsProps, allServicesProps}) => {
    const allComponents: Component[] =allComponentsProps
    const allServices: Service[] = allServicesProps
    const [isLoading, setIsLoading] = useState(true)
    const [didComponentCreate, changeDidComponentCreate] = useState(false)
    // const [newlyCreatedComponent, setNewlyCreatedComponent] = useState<Component>(
    //     {
    //         name: "",
    //         team: "",
    //         type: "KOMPONENT",
    //         componentDependencies: [],
    //         monitorlink: "",
    //         pollingUrl: "",
    //         servicesDependentOnThisComponent: []
    //     }
    // )

    const [newComponent, updateNewComponent] = useState<Component>({
        name: "",
        team: "",
        type: "KOMPONENT",
        componentDependencies: [],
        monitorlink: "",
        pollingUrl: "",
        servicesDependentOnThisComponent: []
    })

    




    useEffect(() => {
        setIsLoading(false)
    }, [])



    if(isLoading) {
        return (
            <CustomNavSpinner />
        )
    }

    const { name, team, type, componentDependencies: dependencies, monitorlink, pollingUrl, servicesDependentOnThisComponent } = newComponent





    const handleComponentDataChange = (field: keyof typeof newComponent) => (evt: React.ChangeEvent<HTMLInputElement>) => {
        const updatedNewArea = {
            ...newComponent,
            [field]: evt.target.getAttribute("type") === "number" ? parseInt(evt.target.value) : evt.target.value        }
            
            updateNewComponent(updatedNewArea)
    }

    /*Handlers for adding componentDependencies START*/

    const handleAddComponentDependency = (componentToAdd: Component) => {
        if(dependencies.includes(componentToAdd)) {
            toast.warn("Komponent " + componentToAdd.name + " er allerede lagt til")
            return
        }
        const newComponentsList = [...newComponent.componentDependencies, componentToAdd]
        const updatedComponent: Component = {
            name: name, team: team, type: type, componentDependencies: newComponentsList, monitorlink: monitorlink, pollingUrl: pollingUrl, servicesDependentOnThisComponent
        }
        updateNewComponent(updatedComponent)
        toast.success("Lagt til komponentavhengighet")
    }

    const handleDeleteComponentDependency = (componentToDelete: Component) => {
        const newComponentsList: Component[] = [...newComponent.componentDependencies.filter(component => component != componentToDelete)]
        const updatedComponent: Component = {
            name: name, team: team, type: type, componentDependencies: newComponentsList, monitorlink: monitorlink, pollingUrl: pollingUrl, servicesDependentOnThisComponent
        }
        updateNewComponent(updatedComponent)
        toast.success("Fjernet område fra område")
    }
    /*Handlers for adding componentDependencies END*/


    /*Handlers for connecting to services START*/

    const handleConnectToService = (serviceToConnect: Service) => {
        if(dependencies.includes(serviceToConnect)) {
            toast.warn("Komponent " + serviceToConnect.name + " er allerede lagt til")
            return
        }
        const newServicesList: Service[] = [...newComponent.servicesDependentOnThisComponent, serviceToConnect]
        const updatedComponent: Component = {
            name: name, team: team, type: type, componentDependencies: dependencies, monitorlink: monitorlink, pollingUrl: pollingUrl, servicesDependentOnThisComponent: newServicesList
        }
        updateNewComponent(updatedComponent)
        toast.success("Lagt til komponentavhengighet")
    }

    const handleDeleteConnectionToService = (serviceToDeleteFromConnections: Component) => {
        const newServicesList: Service[] = [...newComponent.servicesDependentOnThisComponent.filter(service => service != serviceToDeleteFromConnections)]
        const updatedComponent: Component = {
            name: name, team: team, type: type, componentDependencies: dependencies, monitorlink: monitorlink, pollingUrl: pollingUrl, servicesDependentOnThisComponent: newServicesList
        }
        updateNewComponent(updatedComponent)
        toast.success("Fjernet tjenestekobling")
    }
    /*Handlers for connecting to services END*/


    const handlePostNewComponent = (event) => {
        event.preventDefault()
        postComponent(newComponent).then((response: Component) => {
            toast.success("Komponent lastet opp")
            redirectToAdminKomponenter()
        }).catch(() => {
            toast.error("Klarte ikke å laste opp komponenten")
        })
    }

    const redirectToAdminKomponenter = () => {
        router.push(RouterAdminKomponenter.PATH)
    }
// SKJUL POPUP VED OPPRETTELSE!
    return (
        <Layout>

            <NewComponentContainer>
                <form onSubmit={event => handlePostNewComponent(event)}>

                    <Detail size="small" spacing>Felter markert med * er obligatoriske</Detail>

                    <TextField type="text" required label="Navn på komponent*" value={name} onChange={handleComponentDataChange("name")} placeholder="Navn" />
                    <TextField type="text" required label="Team*" value={team} onChange={handleComponentDataChange("team")} placeholder="Team" />

                    <TextField type="text" label="PollingUrl" value={pollingUrl} onChange={handleComponentDataChange("pollingUrl")} placeholder="PollingUrl" />
                    <TextField type="text" label="Monitorlink" value={monitorlink} onChange={handleComponentDataChange("monitorlink")} placeholder="Monitorlink" />

                    <HorizontalSeparator />

                    <ComponentDependencies 
                        newComponent={newComponent}
                        allComponents={allComponents}
                        handleAddComponentDependency={(componentToAdd) => handleAddComponentDependency(componentToAdd)}
                        handleDeleteComponentDependency={(componentToAdd) => handleDeleteComponentDependency(componentToAdd)}
                    />

                    <HorizontalSeparator />

                    <ConnectToServiceComponent 
                        newComponent={newComponent}
                        allServices={allServices}
                        handleConnectToService={(serviceToConnect) => handleConnectToService(serviceToConnect)}
                        handleDeleteConnectionToService={(serviceToDeleteFromConnections) => handleDeleteConnectionToService(serviceToDeleteFromConnections)}
                    />

                    <HorizontalSeparator />

                    <ButtonContainer>
                        <Button variant="secondary" type="button" value="Avbryt" onClick={() => router.push(RouterAdminKomponenter.PATH)}>Avbryt</Button>
                        <Button type="submit" value="Legg til i område">Lagre</Button>
                    </ButtonContainer>
                </form>
            </NewComponentContainer>
            <ToastContainer />
        </Layout>
    )
}





/*-----------_Helpers_-------------*/


interface ComponentProps {
    newComponent: Component
    allComponents: Component[]
    handleAddComponentDependency: (componentToAdd) => void
    handleDeleteComponentDependency: (componentToAdd) => void
}



const ComponentDependencies = ({newComponent, allComponents, handleDeleteComponentDependency, handleAddComponentDependency}: ComponentProps) => {
    const availableComponents: Component[] = allComponents.filter(area => !newComponent.componentDependencies.map(a => a.id).includes(area.id))
    const { changeTitle } = useContext(TitleContext)

    const [selectedComponent, changeSelectedComponent] = useState<Component | null>(() => availableComponents.length > 0 ? availableComponents[0] : null)

    useEffect(() => {
        changeTitle("Opprett ny komponent")
        if(availableComponents.length > 0){
            changeSelectedComponent(availableComponents[0])
        }
        else {
            changeSelectedComponent(null)
        }
    }, [allComponents, newComponent.componentDependencies])
    


    const handleUpdateSelectedArea = (event) => {
        const idOfSelectedArea: string = event.target.value
        const newSelectedComponent: Component = availableComponents.find(area => idOfSelectedArea === area.id)
        changeSelectedComponent(newSelectedComponent)
    }

    const addHandler = () => {
        if(!selectedComponent) {
            toast.info("Ingen komponent valgt")
            return
        }
        handleAddComponentDependency(selectedComponent)
    }
    

    return (
        <DynamicListContainer>

            <div className="column">
                <Select label="Legg til komponentavhengigheter" value={selectedComponent !== null ? selectedComponent.id : ""} onChange={handleUpdateSelectedArea}>
                    {availableComponents.length > 0 ?
                        availableComponents.map(component => {
                            return (
                                <option key={component.id} value={component.id}>{component.name}</option>
                            )
                        })
                    :
                        <option key={undefined} value="">Ingen tilgjengelige komponenter</option>
                    }
                </Select>
                <Button variant="secondary" type="button" onClick={addHandler}>Legg til</Button>
            </div>

            
            <div className="column">
                {newComponent.componentDependencies.length > 0 &&
                    <div>
                        <b>Komponentavhengigheter</b>
                        <ul className="new-list">
                            {newComponent.componentDependencies.map(component => {
                                return (
                                    <li key={component.id}>
                                        <BodyShort>
                                            {component.name}
                                            <button className="colored" type="button" onClick={() => handleDeleteComponentDependency(component)}>
                                                <label>{component.name}</label>
                                                <Delete/> Slett
                                            </button>
                                        </BodyShort>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                }
            </div>

        </DynamicListContainer>
    )
}



interface ConnectToServiceI {
    newComponent: Component
    allServices: Service[]
    handleConnectToService: (serviceToConnectTo) => void
    handleDeleteConnectionToService: (serviceToDeleteFromConnections) => void
}

const ConnectToServiceComponent = ({newComponent, allServices, handleConnectToService, handleDeleteConnectionToService}: ConnectToServiceI) => {
    const availableServices: Service[] = allServices.filter(area => !newComponent.servicesDependentOnThisComponent.map(a => a.id).includes(area.id))
    const { changeTitle } = useContext(TitleContext)

    const [selectedService, changeSelectedService] = useState<Service | null>(() => availableServices.length > 0 ? availableServices[0] : null)

    useEffect(() => {
        if(availableServices.length > 0){
            changeSelectedService(availableServices[0])
        }
        else {
            changeSelectedService(null)
        }
    }, [allServices, newComponent.servicesDependentOnThisComponent])
    


    const handleUpdateSelectedService = (event) => {
        const idOfSelectedService: string = event.target.value
        const newSelectedService: Service = availableServices.find(service => idOfSelectedService === service.id)
        changeSelectedService(newSelectedService)
    }

    const addHandler = () => {
        if(!selectedService) {
            toast.info("Ingen tjeneste valgt valgt")
            return
        }
        handleConnectToService(selectedService)
    }
    

    return (
        <DynamicListContainer>

            <div className="column">
                <Select label="Legg til kobling mot tjeneste" value={selectedService !== null ? selectedService.id : ""} onChange={handleUpdateSelectedService}>
                    {availableServices.length > 0 ?
                        availableServices.map(component => {
                            return (
                                <option key={component.id} value={component.id}>{component.name}</option>
                            )
                        })
                    :
                        <option key={undefined} value="">Ingen tilgjengelige komponenter</option>
                    }
                </Select>
                <Button variant="secondary" type="button" onClick={addHandler}>Legg til</Button>
            </div>

            
            <div className="column">
                {newComponent.servicesDependentOnThisComponent.length > 0 &&
                    <div>
                        <b>Kobling mot tjeneste</b>
                        <ul className="new-list">
                            {newComponent.servicesDependentOnThisComponent.map(service => {
                                return (
                                    <li key={service.id}>
                                        <BodyShort>
                                            {service.name}
                                            <button className="colored" type="button" onClick={() => handleDeleteConnectionToService(service)}>
                                                <label>{service.name}</label>
                                                <Delete/> Slett
                                            </button>
                                        </BodyShort>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                }
            </div>

        </DynamicListContainer>
    )
}


export default NewComponent