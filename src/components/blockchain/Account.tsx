import { useWallet } from '@txnlab/use-wallet-react'
import { useMemo } from 'react'
import { ellipseAddress } from '../../utils/ellipseAddress'
import { getAlgodConfigFromViteEnvironment } from '../../utils/network/getAlgoClientConfigs'

const Account = () => {
  const { activeAddress } = useWallet()
  const algoConfig = getAlgodConfigFromViteEnvironment()

  const networkName = useMemo(() => {
    return algoConfig.network === '' ? 'localnet' : algoConfig.network.toLocaleLowerCase()
  }, [algoConfig.network])

  if (!activeAddress) {
    return null
  }

  return (
    <div className="mb-4">
      <div className="text-sm text-gray-600">Connected Account:</div>
      <div className="font-mono text-lg">
        <a 
          className="link link-primary" 
          target="_blank" 
          href={`https://lora.algokit.io/${networkName}/account/${activeAddress}/`}
          rel="noreferrer"
        >
          {ellipseAddress(activeAddress)}
        </a>
      </div>
      <div className="text-sm text-gray-600 mt-1">Network: {networkName}</div>
    </div>
  )
}

export default Account