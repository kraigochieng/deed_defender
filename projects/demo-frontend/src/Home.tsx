// src/components/Home.tsx
import { useWallet } from '@txnlab/use-wallet'
import React, { useState } from 'react'
import ConnectWallet from './components/ConnectWallet'
// import Transact from './components/Transact'
// import AppCalls from './components/AppCalls'
// import MyComponent from './components/MyComponent'
import Form from './components/Form'
interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  const [openWalletModal, setOpenWalletModal] = useState<boolean>(false)
  // const [openDemoModal, setOpenDemoModal] = useState<boolean>(false)
  // const [appCallsDemoModal, setAppCallsDemoModal] = useState<boolean>(false)
  const [formModal, setFormModal] = useState<boolean>(false)

  const { activeAddress } = useWallet()

  const toggleWalletModal = () => {
    setOpenWalletModal(!openWalletModal)
  }

  // const toggleDemoModal = () => {
  //   setOpenDemoModal(!openDemoModal)
  // }

  // const toggleAppCallsModal = () => {
  //   setAppCallsDemoModal(!appCallsDemoModal)
  // }

  const toggleFormModal = () => {
    setFormModal(!formModal)
  }
  return (
    <div className="hero min-h-screen bg-teal-400">
      <div className="hero-content text-center rounded-lg p-6 max-w-md bg-white mx-auto">
        <div className="max-w-md">
          <h1 className="text-4xl">
            Deed Defender
          </h1>
          {/* <p className="py-6">
            This starter has been generated using official AlgoKit React template. Refer to the resource below for next steps.
          </p> */}

          <div className="grid">
            {/* <a
              data-test-id="getting-started"
              className="btn btn-primary m-2"
              target="_blank"
              href="https://github.com/algorandfoundation/algokit-cli"
            >
              Getting started
            </a>

            <div className="divider" /> */}
            <button data-test-id="connect-wallet" className="btn m-2" onClick={toggleWalletModal}>
              Wallet Connection
            </button>

            {/* {activeAddress && (
              <button data-test-id="transactions-demo" className="btn m-2" onClick={toggleDemoModal}>
                Transactions Demo
              </button>
            )}

            {activeAddress && (
              <button data-test-id="appcalls-demo" className="btn m-2" onClick={toggleAppCallsModal}>
                Contract Interactions Demo
              </button>
            )} */}

            {activeAddress && (
              <button data-test-id="my-component-demo" className="btn m-2" onClick={toggleFormModal}>
                Register Land
              </button>
            )}
          </div>

          <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />
          {/* <Transact openModal={openDemoModal} setModalState={setOpenDemoModal} />
          <AppCalls openModal={appCallsDemoModal} setModalState={setAppCallsDemoModal} /> */}
          <Form openModal={formModal} setModalState={setFormModal} />
        </div>
      </div>
    </div>
  )
}

export default Home
