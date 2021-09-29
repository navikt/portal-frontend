import styled from 'styled-components'

import Layout from 'components/Layout';
import Admin from 'components/Admin';
import MenuSelector from 'components/Admin/MenuSelector';
import { useState } from 'react';
import { ToastContainer } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

const AdminContainer = styled.div`
    //margin-top:30px;
`

 const AdminPage = () => {
    const [selectedMenu, changeSelectedMenu] = useState("Områder")
    const [adminMenu, setAdminMenu] = useState(["Dashbord", "Områder", "Tjenester"])

    const onClickChangeSelectedMenu = (newMenu: string) => {
        changeSelectedMenu(newMenu)
    }

    return (
        <Layout>
            <AdminContainer>
                <MenuSelector currentSelectedMenu = {selectedMenu} onClickSelectedMenu={onClickChangeSelectedMenu} adminMenu={adminMenu}/>
                <Admin selectedMenu={selectedMenu} adminMenu={adminMenu}/>
            </AdminContainer>
            <ToastContainer/>
        </Layout>
    )
}

export default AdminPage