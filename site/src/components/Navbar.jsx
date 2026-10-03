import { useState } from 'react'

function Navbar(){
    return (
        <div className="bg-gray-900  flex justify-end gap-107 h-10 items-center">
            <div className='flex gap-10'>
                <a className='no-underline  text-xl text-gray-300 transition duration-250 hover:text-gray-50'href='../view/Guess.jsx'>Guess</a>
                <a className='no-underline  text-xl text-gray-300 transition duration-250 hover:text-gray-50'href='../view/Pokedex.jsx'>Pokédex</a>
            </div>
            <div className="mr-17">
                <a className='no-underline text-xl text-gray-300 transition duration-250 hover:text-gray-50'href='../view/Perfil.jsx'>Meu Perfil</a>
            </div>
            
        </div>
    )
}

export default Navbar;