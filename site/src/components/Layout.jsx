import { Outlet } from 'react-router'
import Navbar from './Navbar'
import Footer from './Rodape'

function Layout() {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 bg-yellow-200">
                <Outlet />
            </main>
            <Footer />
        </div>
    )
}

export default Layout;