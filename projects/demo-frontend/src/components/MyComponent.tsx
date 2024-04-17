import { Provider, useWallet } from '@txnlab/use-wallet'
import { TransactionSignerAccount } from '@algorandfoundation/algokit-utils/types/account'
import { AppDetails } from '@algorandfoundation/algokit-utils/types/app-client'
import { getAlgodConfigFromViteEnvironment, getIndexerConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'
import * as algokit from '@algorandfoundation/algokit-utils'
import { useEffect, useState } from 'react'
import { MyRadAppClient } from '../contracts/MyRadApp'
import { ABIReturn, OnSchemaBreak, OnUpdate } from '@algorandfoundation/algokit-utils/types/app'
import { useSnackbar } from 'notistack'
import { ABIValue } from 'algosdk'
interface MyComponentInterface {
  openModal: boolean
  setModalState: (value: boolean) => void
}

const MyComponent = ({ openModal, setModalState }: MyComponentInterface) => {
    async function testing() {
        const address = "IWKHBJVHTHIHWCXXSXWO5XXKD7ZNHRSYGLXLCHWJSKMXN32KUYY7B3MCII";
        const accountAppLocalStates = await indexer.lookupAccountByID(address).do();
        console.log(accountAppLocalStates)
      }
    
    useEffect(()=> {
        testing()
    }, [])
    // App states
  const [loading, setLoading] = useState<boolean>(false)
  const [num1, setNum1] = useState<number>(0)
  const [num2, setNum2] = useState<number>(0)

  const [result, setResult] = useState<(bigint & ABIReturn) | undefined >()

  const { signer, activeAddress } = useWallet()
  // Components
  const { enqueueSnackbar } = useSnackbar()

//   const isKmd = (provider: Provider) => provider.metadata.name.toLowerCase() === 'kmd'
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
    const response = await appClient.add({ a: num1, b: num2 }).catch((e: Error) => {
      enqueueSnackbar(`Error calling the contract: ${e.message}`, { variant: 'error' })
      setLoading(false)
      return
    })


    console.log(response?.return)
    setResult(response?.return)

    enqueueSnackbar(`Response from the contract: ${response?.return}`, { variant: 'success' })
    
    setLoading(false)
  }

//   async function fetchData() {
//     try {
//         const response = await fetch("/health")
//         const data = await response.text()
//         console.log(data)
//       } catch(e) {
//         console.error(e)
//       }
//   }

//   fetchData()
  
  return (
    <dialog id="appcalls_modal" className={`modal ${openModal ? 'modal-open' : ''} bg-slate-200`}>
        <form method="dialog" className="modal-box">
            <input
                type="number"
                placeholder="Number 1"
                className="input input-bordered w-full"
                value={num1}
                min={0}
                onChange={(e) => {
                    setNum1(Number(e.target.value))
                }}
            />
            <input
                type="number"
                placeholder="Number 2"
                className="input input-bordered w-full"
                value={num2}
                min={0}
                onChange={(e) => {
                    setNum2(Number(e.target.value))
                }}
            />
            <div className="modal-action ">
                <button className={`btn`} onClick={sendAppCall}>
                    {loading ? <span className="loading loading-spinner" /> : 'Add'}
                </button>
                <button className="btn" onClick={() => setModalState(!openModal)}>
                    Close
                </button>
            </div>
            <div>
            {
                result ? 
                <p>The result is {result.toString()}</p> :
                <p>No result</p>
            }
            </div>
        </form>
        {/* <p>Active Address</p>
        <p>{JSON.stringify(activeAddress)}</p> */}
        
    </dialog>
  )
}
export default MyComponent
