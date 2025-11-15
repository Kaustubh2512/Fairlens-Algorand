import { AlgoViteClientConfig, AlgoViteKMDConfig } from '../../interfaces/network'

export function getAlgodConfigFromViteEnvironment(): AlgoViteClientConfig {
  const env = import.meta.env
  
  if (!env.VITE_ALGOD_SERVER) {
    throw new Error('Attempt to get default algod configuration without specifying VITE_ALGOD_SERVER in the environment variables')
  }

  return {
    server: env.VITE_ALGOD_SERVER,
    port: env.VITE_ALGOD_PORT,
    token: env.VITE_ALGOD_TOKEN,
    network: env.VITE_ALGOD_NETWORK,
  }
}

export function getIndexerConfigFromViteEnvironment(): AlgoViteClientConfig {
  const env = import.meta.env
  
  if (!env.VITE_INDEXER_SERVER) {
    throw new Error('Attempt to get default algod configuration without specifying VITE_INDEXER_SERVER in the environment variables')
  }

  return {
    server: env.VITE_INDEXER_SERVER,
    port: env.VITE_INDEXER_PORT,
    token: env.VITE_INDEXER_TOKEN,
    network: env.VITE_ALGOD_NETWORK,
  }
}

export function getKmdConfigFromViteEnvironment(): AlgoViteKMDConfig {
  const env = import.meta.env
  
  if (!env.VITE_KMD_SERVER) {
    throw new Error('Attempt to get default kmd configuration without specifying VITE_KMD_SERVER in the environment variables')
  }

  return {
    server: env.VITE_KMD_SERVER,
    port: env.VITE_KMD_PORT,
    token: env.VITE_KMD_TOKEN,
    wallet: env.VITE_KMD_WALLET,
    password: env.VITE_KMD_PASSWORD,
  }
}