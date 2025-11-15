import { useWallet, WalletId } from '@txnlab/use-wallet-react'
import { Button } from '../ui/button'
import Account from './Account'

const WalletConnector = () => {
  const { activeAddress, wallets } = useWallet()

  const connectWallet = async (walletId: WalletId) => {
    const wallet = wallets.find(w => w.id === walletId)
    if (wallet) {
      await wallet.connect()
    }
  }

  if (activeAddress) {
    return <Account />
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-xl font-bold">Connect Your Wallet</h2>
      <p className="text-gray-600">Select a wallet provider to connect to the application</p>
      
      <div className="flex flex-col gap-2 w-full max-w-xs">
        <Button 
          onClick={() => connectWallet(WalletId.PERA)}
          className="flex items-center justify-center gap-2"
        >
          <span>Connect Pera Wallet</span>
        </Button>
        
        <Button 
          onClick={() => connectWallet(WalletId.DEFLY)}
          className="flex items-center justify-center gap-2"
        >
          <span>Connect Defly Wallet</span>
        </Button>
        
        <Button 
          onClick={() => connectWallet(WalletId.EXODUS)}
          className="flex items-center justify-center gap-2"
        >
          <span>Connect Exodus Wallet</span>
        </Button>
      </div>
    </div>
  )
}

export default WalletConnector