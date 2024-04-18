import { Provider, useWallet } from '@txnlab/use-wallet'
import { TransactionSignerAccount } from '@algorandfoundation/algokit-utils/types/account'
import { AppDetails } from '@algorandfoundation/algokit-utils/types/app-client'
import { APP_SPEC } from '../contracts/Deed Defender'
import { getAlgodConfigFromViteEnvironment, getIndexerConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'
import * as algokit from '@algorandfoundation/algokit-utils'
import { ChangeEvent, useState } from 'react'
import { DeedDefenderClient } from '../contracts/Deed Defender'
import { ABIReturn, OnSchemaBreak, OnUpdate } from '@algorandfoundation/algokit-utils/types/app'
import { useSnackbar } from 'notistack'
import { ABIValue } from 'algosdk'
import '../styles/form.css'

interface MyComponentInterface {
  openModal: boolean
  setModalState: (value: boolean) => void
}

const VerifyLandModal = ({ openModal, setModalState }: MyComponentInterface) => {

  // App State 
  const [loading, setLoading] = useState<boolean>(false)

  const [form, setForm] = useState({
    idNumber: "",
    landNumber: "",
    titleDeed: ""
  })

  type verificationType = {
    idNumber: string,
    landNumberVerification: string,
    titleDeedVerification: string,
    blockChainResponse: (string & ABIReturn) | undefined
  }

  const [verification, setVerification] = useState<verificationType>({
    idNumber: "",
    landNumberVerification: "",
    titleDeedVerification: "",
    blockChainResponse: undefined
  })

  const [popup, setPopup] = useState<boolean>(false)
  // Components
  const { enqueueSnackbar } = useSnackbar()

  // Algorand BoilerPlate
  const { signer, activeAddress } = useWallet()

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


  // Form handling
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { value, name } = event.target

    setForm(prevForm => ({
      ...prevForm,
      [name]: value
    }))
  }

  function handleVerificationChange(event: ChangeEvent<HTMLInputElement>) {
    const { value, name } = event.target

    setVerification(prevForm => ({
      ...prevForm,
      [name]: value
    }))
  }

  function handleSubmit(event: ChangeEvent<HTMLFormElement>) {
    event.preventDefault()
  }

  async function tooglePopup() {
    // let data = await response?.return
    const data: (string & ABIReturn) | undefined = undefined

    setVerification(prevVerify => ({
      ...prevVerify,
      blockChainResponse: data
    }))

    setPopup(!popup)
    if (popup) {
      setTimeout(() => {
        setPopup(!popup)
      }, 3500)
    }
  }

  const sendRegisterLandAppCall = async () => {
    setLoading(true)

    // Please note, in typical production scenarios,
    // you wouldn't want to use deploy directly from your frontend.
    // Instead, you would deploy your contract on your backend and reference it by id.
    // Given the simplicity of the starter contract, we are deploying it on the frontend
    // for demonstration purposes.
    // const appDetails = {
    //   // resolveBy: 'creatorAndName',
    //   resolveBy: 'id',
    //   id: 1066,
    //   sender: { signer, addr: activeAddress } as TransactionSignerAccount,
    //   // creatorAddress: activeAddress,
    //   findExistingUsing: indexer,
    // } as AppDetails

    // for demonstration purposes.
    const appDetails = {
      resolveBy: 'creatorAndName',
      sender: { signer, addr: activeAddress } as TransactionSignerAccount,
      creatorAddress: activeAddress,
      findExistingUsing: indexer,
    } as AppDetails
    // Creating an App Client
    const appClient = new DeedDefenderClient(appDetails, algodClient)

    // appClient.create

    // Adding parameters tgo created client
    const deployParams = {
      onSchemaBreak: OnSchemaBreak.AppendApp,
      onUpdate: OnUpdate.AppendApp,
    }

    const appDeployment = await appClient.deploy(deployParams).catch((e: Error) => {
      enqueueSnackbar(`App found ${e.message}`, { variant: 'success' })
      setLoading(false)
      return
    })

    // console.log("App Deployment", appDeployment.appId)

    // Actual execution 
    // register Land


    // Validation

    if (form.idNumber == "") {
      enqueueSnackbar(`ID Number is empty. Please fill.`, { variant: 'error' })
      setLoading(false)
      return
    }

    if (form.landNumber == "") {
      enqueueSnackbar(`Land Reference Number is empty. Please fill.`, { variant: 'error' })
      setLoading(false)
      return
    }

    if (form.titleDeed == "") {
      enqueueSnackbar(`Title deed is empty. Please fill.`, { variant: 'error' })
      setLoading(false)
      return
    }

    // Get the existing land and titles
    const getLandResponse = await appClient.getLand({}).catch((e: Error) => {
      enqueueSnackbar(`Error getting land details${e.message}`, { variant: 'error' })
      setLoading(false)
      return
    })

    let landAndTitleDeedsList;
    // let landAndTitleDeedsMap = new Map()

    if ((getLandResponse?.return != undefined) || (getLandResponse?.return != '')) {
      // if empty nothing to be done
      // if len is 0 pass
      landAndTitleDeedsList = getLandResponse?.return?.split(";")

      landAndTitleDeedsList?.pop() // To remove the empty string

      console.log(landAndTitleDeedsList)

      // Checking for duplications
      for (let i = 0; i < landAndTitleDeedsList?.length; i++) {
        const landTitlePair = landAndTitleDeedsList[i].split(":")
        const landReferenceNumber = landTitlePair[1]
        const titleDeedNumber = landTitlePair[2]

        if (landReferenceNumber == form.landNumber) {
          enqueueSnackbar(`Land Reference Number ${landReferenceNumber} already exists`, { variant: 'error' })
          setLoading(false)
          return
        }

        if (titleDeedNumber == form.titleDeed) {
          enqueueSnackbar(`Title Deed  ${titleDeedNumber} already exists`, { variant: 'error' })
          setLoading(false)
          return
        }
      }
    }
    const landReferenceAndTitleDeed = `${form.idNumber}:${form.landNumber}:${form.titleDeed};`

    await appClient.registerLand({ landReferenceAndTitleDeed: landReferenceAndTitleDeed })
      .then(() => {
        enqueueSnackbar(`Land registered successfully`, { variant: 'success' })
        setLoading(false)
        return
      })
      .catch((e: Error) => {
        enqueueSnackbar(`Error registering land: ${e.message}`, { variant: 'error' })
        setLoading(false)
        return
      })

    // setResult(response?.return)

    // enqueueSnackbar(`Response from the contract: ${response?.return}`, { variant: 'success' })

    setLoading(false)

  }

  const sendVerifyLandAppCall = async () => {
    setLoading(true)

    // Please note, in typical production scenarios,
    // you wouldn't want to use deploy directly from your frontend.
    // Instead, you would deploy your contract on your backend and reference it by id.
    // Given the simplicity of the starter contract, we are deploying it on the frontend
    // for demonstration purposes.
    // const appDetails = {
    //   // resolveBy: 'creatorAndName',
    //   resolveBy: 'id',
    //   id: 1066,
    //   sender: { signer, addr: activeAddress } as TransactionSignerAccount,
    //   // creatorAddress: activeAddress,
    //   findExistingUsing: indexer,
    // } as AppDetails

    // for demonstration purposes.
    const appDetails = {
      resolveBy: 'creatorAndName',
      sender: { signer, addr: activeAddress } as TransactionSignerAccount,
      creatorAddress: activeAddress,
      findExistingUsing: indexer,
    } as AppDetails
    // Creating an App Client
    const appClient = new DeedDefenderClient(appDetails, algodClient)

    // appClient.create

    // Adding parameters tgo created client
    const deployParams = {
      onSchemaBreak: OnSchemaBreak.AppendApp,
      onUpdate: OnUpdate.AppendApp,
    }

    const appDeployment = await appClient.deploy(deployParams).catch((e: Error) => {
      enqueueSnackbar(`App found ${e.message}`, { variant: 'success' })
      setLoading(false)
      return
    })

    const response = await appClient.getLand({}).catch((e: Error) => {
      enqueueSnackbar(`Error getting land details${e.message}`, { variant: 'error' })
      setLoading(false)
      return
    })

    // Validation
    if (verification.idNumber == "") {
      enqueueSnackbar(`ID Number is empty. Please fill.`, { variant: 'error' })
      setLoading(false)
      return
    }

    if (verification.landNumberVerification == "") {
      enqueueSnackbar(`Land Reference Number is empty. Please fill.`, { variant: 'error' })
      setLoading(false)
      return
    }

    if (verification.titleDeedVerification == "") {
      enqueueSnackbar(`Title deed is empty. Please fill.`, { variant: 'error' })
      setLoading(false)
      return
    }

    let landAndTitleDeedsList;
    let landAndTitleDeedsMap = new Map()

    if ((response?.return != undefined) || (response?.return != '')) {
      // if empty nothing to be done
      // if len is 0 pass
      landAndTitleDeedsList = response?.return?.split(";")

      landAndTitleDeedsList?.pop() // To remove the empty string

      console.log(landAndTitleDeedsList)

      let isValid = false
      for (let i = 0; i < landAndTitleDeedsList?.length; i++) {
        const landTitlePair = landAndTitleDeedsList[i].split(":")
        const idNumber = landTitlePair[0]
        const landReferenceNumber = landTitlePair[1]
        const titleDeedNumber = landTitlePair[2]

        if (
          (idNumber == verification.idNumber) &&
          (landReferenceNumber == verification.landNumberVerification) &&
          (titleDeedNumber == verification.titleDeedVerification)
        ) {
          enqueueSnackbar(`Valid`, { variant: 'success' })
          setLoading(false)
          return
        }
        // landAndTitleDeedsMap.set(landTitlePair[1], landTitlePair[2])
      }

      enqueueSnackbar(`Invalid`, { variant: 'error' })
      setLoading(false)
      return

      // if(landAndTitleDeedsMap.has(verification.landNumberVerification)) {
      //   const trueTitleDeed = landAndTitleDeedsMap.get(verification.landNumberVerification)
      //   if(trueTitleDeed == verification.titleDeedVerification) {
      //     enqueueSnackbar(`Valid`, { variant: 'success' })
      //     setLoading(false)
      //     return
      //   } else {
      //     enqueueSnackbar(`Invalid`, { variant: 'error' })
      //     setLoading(false)
      //     return
      //   }
      // } else {
      //   enqueueSnackbar(`Invalid`, { variant: 'error' })
      //   setLoading(false)
      //   return
      // }

      //   console.log(landAndTitleDeedsMap)
      // enqueueSnackbar(`Existing land details: ${response?.return}`, {variant: "success"})
    }


    setLoading(false)
    // console.log("App Deployment", appDeployment.appId)

    // Actual execution 
    // register Land
    // const response = await appClient.verifyLandDetails({ landReferenceNumber: verification.landNumberVerification }).catch((e: Error) => {
    //   enqueueSnackbar(`Error registering land: ${e.message}`, { variant: 'error' })
    //   setLoading(false)
    //   return
    // })

    // setResult(response?.return)

    //TRYING TO ARRANGE THE FORMS IN A HORIZONTAL MANNER

  }

  return (
    <dialog id="appcalls_modal" className={`modal ${openModal ? 'modal-open' : ''} bg-slate-200`}>
      <h1>Deed Defender</h1>
      <form onSubmit={handleSubmit} className='form'>
        <div className='no1'>
        <h1>Land Registration</h1>
        <div>
          <div>
            <label>Id number:</label>
            <input className='form--input' placeholder='Id number'
              onChange={handleChange}
              value={form.idNumber}
              name="idNumber"
            />
          </div>
          <label>Land Number:</label>
          <input className='form--input' placeholder='Land Number'
            onChange={handleChange}
            value={form.landNumber}
            name="landNumber"
          />
        </div>
        <div>
          <label>Title Deed:</label>
          <input className='form--input' placeholder='Title Deed'
            onChange={handleChange}
            value={form.titleDeed}
            name="titleDeed"
          />
        </div>
        <div className='divider' />
        <div className='form--submit'>
          <button className='btn' onClick={sendRegisterLandAppCall}>
            {loading ? <span className="loading loading-spinner" /> : 'Submit'}
          </button>
          <button type="button" className="btn" onClick={() => setModalState(!openModal)}>
            Back To Menu
          </button>
        </div>

        </div>

        <hr />
        <div className='no2'>
        <h1>Verify Land Details</h1>
        <div>
          <label>Id number:</label>
          <input className='form--input' placeholder='Id number'
            onChange={handleVerificationChange}
            value={verification.idNumber}
            name="idNumber"
          />
        </div>
        <div>
          <label>Land Number:</label>
          <input className='form--input' placeholder='Land Number'
            name="landNumberVerification"
            value={verification.landNumberVerification}
            onChange={handleVerificationChange}
          />
        </div>
        <div>
          <label>Title Deed:</label>
          <input className='form--input' placeholder='Title Deed'
            name="titleDeedVerification"
            value={verification.titleDeedVerification}
            onChange={handleVerificationChange}
          />
        </div>
        <div>
          <button className="btn" type='button'
            // onClick = {tooglePopup}
            onClick={sendVerifyLandAppCall}
          >
            Verify Details
          </button>
          {popup && (
            verification.titleDeedVerification == verification.blockChainResponse ? <h1>Details are valid</h1> : <h1>False Details</h1>
          )}
        </div>

        </div>

        <div className = "no3">
        <h1>Transfer Land</h1>
        <div className="transferform">
          <div className="leftside">
            <h2>ORIGINAL OWNER</h2>
            <div>
              <label>Id number:</label>
              <input className='form--input' placeholder='Id number'
                onChange={handleVerificationChange}
                value={verification.idNumber}
                name="idNumber"
              />
            </div>
            <div>
              <label>Land Number:</label>
              <input className='form--input' placeholder='Land Number'
                name="landNumberVerification"
                value={verification.landNumberVerification}
                onChange={handleVerificationChange}
              />
            </div>
            <div>
              <label>Title Deed:</label>
              <input className='form--input' placeholder='Title Deed'
                name="titleDeedVerification"
                value={verification.titleDeedVerification}
                onChange={handleVerificationChange}
              />
            </div>
          </div>
          <div className="rightside">
            <h2>NEW OWNER</h2>
            <div>
              <label>Id number:</label>
              <input className='form--input' placeholder='Id number'
                onChange={handleVerificationChange}
                value={verification.idNumber}
                name="idNumber"
              />
            </div>
          </div>
        </div>
        <div>
          <button className="btn" type='button'
            // onClick = {tooglePopup}
            onClick={sendVerifyLandAppCall}
          >
            Verify Details
          </button>

          </div>


          {popup && (
            verification.titleDeedVerification == verification.blockChainResponse ? <h1>Details are valid</h1> : <h1>False Details</h1>
          )}
        </div>
      </form>
    </dialog>
  )
}
export default VerifyLandModal
