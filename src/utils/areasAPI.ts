import { Area } from "../types/navServices";
import { EndPathArea, EndPathAreaContainingServices, EndPathAreas, EndPathDashboardWithArea, EndPathPutAreasToDashboard, EndPathServiceToArea, EndPathSpecificArea } from "./apiHelper";

export class ResponseError extends Error {
    public constructor (message: string, public response: Response) {
        super(message)
    }
}




export const fetchAreas = async (): Promise<Area[]> => {
    let response;
    let endPath = EndPathAreas()

    response = await fetch(endPath);


    if (response.ok) {
        return response.json()
    }
    throw new ResponseError("Failed to fetch from server", response)
}



export const postAdminArea = async (adminArea): Promise<Object[]> =>{
    let response;
    let endPath = EndPathAreas()

    response = await fetch(endPath,
    {
        method: "POST",
        body: JSON.stringify({
            name: adminArea.name,
            description: adminArea.description,
            icon: adminArea.icon,
            services: adminArea.services
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        },
        mode: 'cors', // no-cors, *cors, same-origin,
        credentials: 'same-origin', // include, *same-origin, omit

    });

    if (response.ok) {
        return response.json()
    }
    throw new ResponseError("Failed to post to server", response)
}



export const updateArea = async (area: Area): Promise<void> =>{
    let response;
    let endPath = EndPathSpecificArea(area.id)


    response = await fetch(endPath, {
            method: "PUT",
            body: JSON.stringify({
                id: area.id,
                name: area.name,
                description: area.description,
                icon: area.icon,
                services: area.services
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            },
            mode: 'cors', // no-cors, *cors, same-origin,
            credentials: 'same-origin', // include, *same-origin, omit
        });
    

    if (response.ok) {
        return response
    }
    throw new ResponseError("Failed to post to server", response)
}




export const deleteArea = async (area: Area): Promise<void> =>{
    let response;
    let endPath = EndPathSpecificArea(area.id)

    response = await fetch(endPath,
    {
        method: "DELETE",
        body: JSON.stringify({
            id: area.id,
            name: area.name,
            description: area.description,
            icon: area.icon
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        },
        mode: 'cors', // no-cors, *cors, same-origin,
        credentials: 'same-origin', // include, *same-origin, omit

    });

    if (response.ok) {
        return response
    }
    throw new ResponseError("Failed to post to server", response)
}





export const fetchAreasContainingService = async (serviceId: string): Promise<Area[]> => {
    let response;
    let endPath = EndPathAreaContainingServices(serviceId)


    response = await fetch(endPath);


    if (response.ok) {
        return response.json()
    }
    throw new ResponseError("Failed to fetch from server", response)
}




export const fetchAreasInDashboard = async (dashboardId: string): Promise<Area[]> => {
    let response;
    let endPath = EndPathDashboardWithArea(dashboardId)

    response = await fetch(endPath);
    
    if (response.ok) {
        return response.json()
    }
    throw new ResponseError("Failed to fetch from server", response)
}





export const putAreasToDashboard = async (dashboardId: string, areasToPut: string[]): Promise<Object[]> =>{
    let response;
    let endPath = EndPathPutAreasToDashboard(dashboardId)
    
    response = await fetch(endPath,
    {
        method: "PUT",
        body: JSON.stringify(
            areasToPut
        ),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        },
        mode: 'cors', // no-cors, *cors, same-origin,
        credentials: 'same-origin', // include, *same-origin, omit

    });
    
    if (response.ok) {
        return response
    }
    throw new ResponseError("Failed to post to server", response)
}



export const deleteServiceFromArea = async (areaId, serviceId): Promise<void> =>{
    let response;
    let endPath = EndPathArea() + "/"+ areaId + "/" + serviceId

    response = await fetch(endPath,
    {
        method: "DELETE",
        body: JSON.stringify({
            areaId: areaId,
            serviceId: serviceId,
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        },
        mode: 'cors', // no-cors, *cors, same-origin,
        credentials: 'same-origin', // include, *same-origin, omit

    });
    
    if (response.ok) {
        return response
    }
    throw new ResponseError("Failed to post to server", response)
}


export const putServiceToArea = async (areaId, serviceId): Promise<Object[]> =>{
    let response;
    let endPath = EndPathServiceToArea(areaId, serviceId)

    response = await fetch(endPath,
    {
        method: "PUT",
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        },
        mode: 'cors', // no-cors, *cors, same-origin,
        credentials: 'same-origin', // include, *same-origin, omit

    });

    if (response.ok) {
        return response
    }
    throw new ResponseError("Failed to post to server", response)
}