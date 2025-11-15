import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { WalletProvider, WalletManager, WalletId } from '@txnlab/use-wallet-react';
import { getAlgodConfigFromViteEnvironment } from './utils/network/getAlgoClientConfigs';

// Setup wallet manager
const algodConfig = getAlgodConfigFromViteEnvironment();

let walletManager: WalletManager;

try {
  if (algodConfig.network === 'localnet') {
    // LocalNet configuration
    walletManager = new WalletManager({
      wallets: [
        { id: WalletId.PERA },
        { id: WalletId.DEFLY },
        { id: WalletId.EXODUS },
        {
          id: WalletId.KMD,
          options: {
            baseServer: import.meta.env.VITE_KMD_SERVER || 'http://localhost',
            token: import.meta.env.VITE_KMD_TOKEN || '',
            port: import.meta.env.VITE_KMD_PORT || '4002',
          },
        },
      ],
      defaultNetwork: algodConfig.network,
      networks: {
        [algodConfig.network]: {
          algod: {
            baseServer: algodConfig.server,
            port: algodConfig.port,
            token: algodConfig.token,
          },
        },
      },
    });
  } else {
    // TestNet/MainNet configuration
    walletManager = new WalletManager({
      wallets: [
        { id: WalletId.PERA },
        { id: WalletId.DEFLY },
        { id: WalletId.EXODUS },
      ],
      defaultNetwork: algodConfig.network,
      networks: {
        [algodConfig.network]: {
          algod: {
            baseServer: algodConfig.server,
            port: algodConfig.port,
            token: algodConfig.token,
          },
        },
      },
    });
  }
} catch (error) {
  console.error('Error initializing wallet manager:', error);
  // Fallback to basic configuration
  walletManager = new WalletManager({
    wallets: [
      { id: WalletId.PERA },
      { id: WalletId.DEFLY },
      { id: WalletId.EXODUS },
    ],
    defaultNetwork: 'testnet',
    networks: {
      testnet: {
        algod: {
          baseServer: 'https://testnet-api.algonode.cloud',
          port: '',
          token: '',
        },
      },
    },
  });
}

// Check if root element exists
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Root element not found!');
} else {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <BrowserRouter>
        <WalletProvider manager={walletManager}>
          <App />
        </WalletProvider>
      </BrowserRouter>
    </React.StrictMode>,
  );
}