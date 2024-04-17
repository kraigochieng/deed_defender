import { Provider, useWallet } from '@txnlab/use-wallet'
import { TransactionSignerAccount } from '@algorandfoundation/algokit-utils/types/account'
import { AppDetails } from '@algorandfoundation/algokit-utils/types/app-client'
import { getAlgodConfigFromViteEnvironment, getIndexerConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'
import * as algokit from '@algorandfoundation/algokit-utils'
import { ChangeEvent, useState } from 'react'
import { MyRadAppClient } from '../contracts/MyRadApp'
import { ABIReturn, OnSchemaBreak, OnUpdate } from '@algorandfoundation/algokit-utils/types/app'
import { useSnackbar } from 'notistack'
import { ABIValue } from 'algosdk'
import '../styles/form.css'

interface MyComponentInterface {
  openModal: boolean
  setModalState: (value: boolean) => void
}

const Form = ({ openModal, setModalState }: MyComponentInterface) => {
  const [loading, setLoading] = useState<boolean>(false)

  const [form, setForm] = useState({
    landNumber:"",
    titleDeed:""
  })

  function handleChange(event: ChangeEvent<HTMLInputElement>){
    
    const {value, name} =event.target

    setForm(prevForm =>({
      ...prevForm,
      [name] : value
    }))
  }

  function handleSubmit(event: ChangeEvent<HTMLFormElement>){
    event.preventDefault()
  }

  const { signer, activeAddress } = useWallet()
  const { enqueueSnackbar } = useSnackbar()

  const algodConfig = getAlgodConfigFromViteEnvironment()
  const algodClient = algokit.getAlgoClient({
    server: algodConfig.server,
    port: algodConfig.port,
    token: algodConfig.token,
  })
  const indexerConfig = getIndexerConfigFromViteEnvironment()
  const indexer = algokit.getAlgoIndexerClient({
    server: indexerConfig.server,
    port: indexerConfig.port,
    token: indexerConfig.token,
  })

  const sendAppCall = async () => {
    setLoading(true)

    // Please note, in typical production scenarios,
    // you wouldn't want to use deploy directly from your frontend.
    // Instead, you would deploy your contract on your backend and reference it by id.
    // Given the simplicity of the starter contract, we are deploying it on the frontend
    // for demonstration purposes.
    const appDetails = {
      resolveBy: 'creatorAndName',
      sender: { signer, addr: activeAddress } as TransactionSignerAccount,
      creatorAddress: activeAddress,
      findExistingUsing: indexer,
    } as AppDetails

    // Creating an App Client
    const appClient = new MyRadAppClient(appDetails, algodClient)

    // Adding parameters tgo created client
    const deployParams = {
      onSchemaBreak: OnSchemaBreak.AppendApp,
      onUpdate: OnUpdate.AppendApp,
    }

    // Deploying the contarct
    await appClient.deploy(deployParams).catch((e: Error) => {
      enqueueSnackbar(`Error deploying the contract: ${e.message}`, { variant: 'error' })
      setLoading(false)
      return
    })

    // Actual execution 
    // const response = await appClient.add({ a: num1, b: num2 }).catch((e: Error) => {
    //   enqueueSnackbar(`Error calling the contract: ${e.message}`, { variant: 'error' })
    //   setLoading(false)
    //   return
    // })
    

    // console.log(response?.return)
    // setResult(response?.return)

    // enqueueSnackbar(`Response from the contract: ${response?.return}`, { variant: 'success' })
    
    setLoading(false)
  }

  return (
    <dialog id="appcalls_modal" className={`modal ${openModal ? 'modal-open' : ''} bg-slate-200`}>

        <form onSubmit ={handleSubmit} className = 'form'>
          <h1>Deed Defender</h1>
          <div>
            <label>Land Number:</label>
            <input className = 'form--input' placeholder = 'Land Number'
            onChange = {handleChange}
            value = {form.landNumber}
            name = "landNumber"
          />
          </div>
          <div>
            <label>Title Deed:</label>
            <input className = 'form--input' placeholder = 'Title Deed'
              onChange = {handleChange}
              value = {form.titleDeed}
              name = "titleDeed"
          />
          </div>
          <div className = 'form--submit'>
            <button className = 'form--submit--btn'>Submit</button>
          </div>
        </form>
        
    </dialog>
  )
}
export default Form
