import React from 'react'
import logo from '../../assets/img/logo-blue.svg'
export default function Home() {
  return (
    <div>
      <div style={{ border: '5px solid #0065ea', padding: '10px', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', width: 'fit-content' }}>
        <img src={logo} alt="logo" style={{ width: '100px', height: '100px' }} />
      </div>
      <h1>Bienvenido a tú tienda</h1>
      <p>Esta es la página de inicio de tu tienda.</p>
    </div>
  )
}
