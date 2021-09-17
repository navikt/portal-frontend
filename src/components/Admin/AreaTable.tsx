import styled from 'styled-components'
import { useEffect, useState } from "react";
import Dropdown from 'react-dropdown';

import { Bag, Collapse, Expand } from '@navikt/ds-icons'
import { Input, Select } from 'nav-frontend-skjema';
import { Hovedknapp  } from 'nav-frontend-knapper';
import NavFrontendSpinner from "nav-frontend-spinner";
import { Close } from '@navikt/ds-icons'

import { postAdminAreas } from 'utils/postAreas'
import { deleteArea } from 'utils/deleteArea'
import { Area, Service, Tile } from 'types/navServices';
import { getIconsFromGivenCode } from 'utils/servicesOperations';
import { putServiceToArea } from 'utils/putServiceToArea'
import { Element } from 'nav-frontend-typografi';


const CustomTBody = styled.tbody `
    :hover {
        cursor: pointer;
    }
`

const IconContainer = styled.section`
	color: var(--navBla);
    font-size: 2rem;
`;

const SpinnerCentered = styled.div`
    position: absolute;
    top: 40%;
`

const CloseCustomized = styled(Close)`
    color: red;
    :hover {
        color: grey;
        border: 1px solid;
        cursor: pointer;
    }
`

const TileDropdownRow = styled.tr`
    td {
        border: 0px transparent !important;
        background-color: white !important;
    }
    select {
        transform: translateY(-2px);
        min-width: 100px;
    }
`

const ServicesInAreaList = styled.ul`
    padding: 0;
    li {
        list-style: none;
    }
`

const getBag = () => {
    return <IconContainer><Bag /></IconContainer>
}

export interface Props {
    adminTiles: Tile[]
    setAdminTiles: Function
    isLoading: boolean
    setIsLoading: Function
    allServices: Service[]
}

const AreaTable = ({adminTiles: adminTiles, setAdminTiles, isLoading, setIsLoading, allServices}: Props) => { 
    const [expanded, toggleExpanded] = useState<boolean[]>(Array(adminTiles.length).fill(false))
    const [selectedService, changeCurrentSelectedService] = useState(allServices[0].id)
    const [newAdminArea, updateNewAdminArea] = useState<Area>({
        id: "",
        name: "",
        beskrivelse: "",
        rangering: 0,
        ikon: ""
    })

    if (isLoading) {
        return (
            <SpinnerCentered>
                <NavFrontendSpinner type="XXL" />
            </SpinnerCentered>
        ) 
    }


	const options = [
		// <Bag />, <Folder />, <BagFilled />
        'Bag', 'Folder', 'Pengebag'
	];
	
	const defaultOption = 'Ikon...'

    const handleAreaDataChange = (field: keyof typeof newAdminArea) => (evt: React.ChangeEvent<HTMLInputElement>) => {
        const newArea = {
            ...newAdminArea,
            [field]: evt.target.getAttribute("type") === "number" ? parseInt(evt.target.value) : evt.target.value        }
        updateNewAdminArea(newArea)
    }


    const handlePostAdminArea = (areaToAdd: Area) => {
        setIsLoading(true)
        const newlist = adminTiles.filter(tile => tile.area.id === areaToAdd.id)
        if(newlist.length > 0) {
            alert("Denne IDen er allerede brukt. Velg en annen")
            setIsLoading(false)
            return
        }
        if(postAdminAreas(areaToAdd)) {
            const newAreas = [...adminTiles]
            const newTile:Tile = {services:[], status:'', area:areaToAdd}
            newAreas.push(newTile)
            setAdminTiles(newAreas)
            setIsLoading(false)
            return
        }
        //TODO bedre error-visning trengs
        setIsLoading(false)
        alert("Område ble ikke lagt til")
    }

    const handleDeleteArea = (areaToDelete) => {
        if(deleteArea(areaToDelete)) {
            const newTiles = adminTiles.filter(tile => 
                tile.area.id != areaToDelete.id
            )
            setAdminTiles(newTiles)
            return
        }
        //TODO bedre error-visning trengs
        alert("Område ble ikke slettet")
    }

    const handlePutServiceToArea = async (tileId, serviceId) => {
        setIsLoading(true)
        putServiceToArea(tileId, serviceId).then((response: any) => {
            if (response.status >= 200 || response.status <= 210) {
                alert("Tjenesten har blitt lagt til i området")
            } else {
                alert("Tjenesten kunne ikke bli lagt til")
            }
        })
        setIsLoading(false)
    }

    const toggleAreaExpanded = (index: number) => {
        const newArray = [...expanded]
        newArray[index] = !newArray[index]
        toggleExpanded(newArray)
    }

    const changeSelectedService = (e) => {
        changeCurrentSelectedService(e.target.value)
    }

    const { id, name, beskrivelse, rangering} = newAdminArea

    return (
        <table className="tabell tabell--stripet">
            <thead>
                <tr>
                    <th><span>ID</span></th>
                    <th><span>Navn</span></th>
                    <th><span>Beskrivelse</span></th>
                    <th aria-sort="descending" role="columnheader"><span>Rangering</span></th>
                    <th><span>Ikon</span></th>
                    <th><span>Slett</span></th>
                    <th></th>
                </tr>
            </thead>
                {adminTiles.map( (tile, index) => {
                    let area = tile.area
                    return (
                        <CustomTBody key={area.id}>
                            <tr onClick={() => toggleAreaExpanded(index)}>
                                <td><span>{area.id}</span></td>
                                <td><span>{area.name}</span></td>
                                <td><span>{area.beskrivelse}</span></td>
                                <td><span>{area.rangering}</span></td>
                                <td><span><IconContainer>{getIconsFromGivenCode(area.ikon)}</IconContainer></span></td>
                                <td><span><CloseCustomized onClick={() => handleDeleteArea(area)} /></span></td>
                                <td><span>{expanded[index] ? <Collapse /> : <Expand />}</span></td>
                            </tr>
                            {expanded[index] && 
                                (tile.services.length === 0 ?
                                <TileDropdownRow onClick={() => toggleAreaExpanded(index)}>
                                    <td colSpan={7}>Ingen tjenester er knyttet til området. Nedenfor kan du velge en ny tjeneste</td>
                                </TileDropdownRow>
                                :
                                <TileDropdownRow onClick={() => toggleAreaExpanded(index)}>
                                    <td colSpan={7}>
                                        <ServicesInAreaList>
                                                <Element>Tjenester i område: {tile.area.name}</Element>
                                                {tile.services.map(service => {
                                                    return (
                                                        <li key={service.id}>{service.name}</li>
                                                    )
                                                })}
                                        </ServicesInAreaList>
                                    </td>
                                </TileDropdownRow>)
                            }
                            {expanded[index] && 
                                <TileDropdownRow key="input">
                                    <td>
                                        <Select value={selectedService} onChange={changeSelectedService}>
                                            {allServices.map(service => {
                                                return (
                                                    <option key={service.id} value={service.id}>{service.name}</option>
                                                )
                                            })}
                                        </Select>
                                    </td>

                                    <td>
                                        <Hovedknapp disabled={!selectedService} onClick={() => handlePutServiceToArea(tile.area.id, selectedService)} >Legg til</Hovedknapp>                                            
                                    </td>
                                    <td colSpan={6} onClick={() => toggleAreaExpanded(index)}></td>
                                </TileDropdownRow>
                            }
                        </CustomTBody>
                    )
                })}
            <tbody>
                <tr key="input">
                    <td>
                        <Input type="text" value={id} onChange={handleAreaDataChange("id")} placeholder="ID"/>
                    </td>
                    <td>
                        <Input type="text" value={name} onChange={handleAreaDataChange("name")} placeholder="Navn"/>
                    </td>
                    <td>
                        <Input type="text" value={beskrivelse} onChange={handleAreaDataChange("beskrivelse")} placeholder="Beskrivelse"/>
                    </td>
                    <td>
                        <Input type="number" value={rangering} onChange={handleAreaDataChange("rangering")} />
                    </td>
                    <td>
                        <Dropdown
                            options={options}
                            onChange={getBag}
                            value={defaultOption}
                            placeholder="Select an option"
                        />
                    </td>
                    <td colSpan={2}><Hovedknapp disabled={!id || !name || !beskrivelse || !rangering} onClick={() => handlePostAdminArea(newAdminArea)}>Legg til</Hovedknapp></td>
                </tr>

            </tbody>
        </table>
    )
} 

export default AreaTable