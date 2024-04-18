// src/components/Home.tsx
import { useWallet } from '@txnlab/use-wallet'
import React, { useState } from 'react'
import ConnectWallet from './components/ConnectWallet'
// import Transact from './components/Transact'
// import AppCalls from './components/AppCalls'
// import MyComponent from './components/MyComponent'
import Form from './components/Form'
import VerifyLandModal from './components/VerifyLandModal'


interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  const [openWalletModal, setOpenWalletModal] = useState<boolean>(false)
  // const [openDemoModal, setOpenDemoModal] = useState<boolean>(false)
  // const [appCallsDemoModal, setAppCallsDemoModal] = useState<boolean>(false)
  const [formModal, setFormModal] = useState<boolean>(false)
  const [verifyLandModal, setVerifyLandModal] = useState<boolean>(false)

  const { activeAddress } = useWallet()

  const toggleWalletModal = () => {
    setOpenWalletModal(!openWalletModal)
  }

  const toggleFormModal = () => {
    setFormModal(!formModal)
  }

  const toggleVerifyLandModal = () => {
    setVerifyLandModal(!verifyLandModal)
  }
  return (
    <div className="hero min-h-screen bg-teal-400">
      <div className="hero-content text-center rounded-lg p-6 max-w-md bg-white mx-auto">
        <div className="max-w-md">
          <h1 className="text-4xl">
            Deed Defender
          </h1>
          <div className="grid">
            <button data-test-id="connect-wallet" className="btn m-2" onClick={toggleWalletModal}>
              Wallet Connection
            </button>

            {activeAddress && (
              <button data-test-id="my-component-demo" className="btn m-2" onClick={toggleFormModal}>
                Register Land
              </button>
            )}

            {activeAddress && (
              <button data-test-id="my-component-demo" className="btn m-2" onClick={toggleVerifyLandModal}>
                Verify Land
              </button>
            )}
          </div>

          <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />
          <Form openModal={formModal} setModalState={setFormModal} />
          <VerifyLandModal openModal={verifyLandModal} setModalState={setVerifyLandModal} />
          
        </div>
      </div>
    </div>
  )
}

export default Home
