import { Contract, providers, utils } from "ethers";
import Head from "next/head";
import Web3Modal from "web3modal";
import styles from "../styles/Home.module.css";
import React from "react";
import { abi, NFT_CONTRACT_ADDRESS } from "../constants/index";

export default function Home() {
  const [walletConnected, setWalletConnected] = React.useState(false);

  const [loading, setLoading] = React.useState(false);

  const [tokenIdsMinted, setTokenIdsMinted] = React.useState("0");

  const web3ModalRef = React.useRef();

  const publicMint = async () => {
    try {
      console.log("Public Mint");
      // We need a Signer here since this is a 'write' transaction.
      const signer = await getProviderOrSigner(true);
      // Create a new instance of the Contract with a Signer, which allows
      // update methods
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
      // call the mint from the contract to mint the LW3Punks

      const tx = await nftContract.mint({
        // value signifies the cost of one LW3Punks which is "0.01" eth.
        // We are parsing `0.01` string to ether using the utils library from ethers.js
        value: utils.parseEther("0.01"),
      });
      setLoading(true);
      // wait for the transaction to get minted
      await tx.wait();
      setLoading(false);
      window.alert("You successfully minted a LW3Punk!");
    } catch (error) {
      console.error(error);
    }
  };

  // connectwallet: Connects the MetaMask wallet

  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (error) {
      console.error(error);
    }
  };

  /**
   * getTokenIdsMinted: gets the number of tokenIds that have been minted
   */

  const getTokenIdsMinted = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // No need for the Signer here, as we are only reading state from the blockchain
      const provider = await getProviderOrSigner();
      // We connect to the Contract using a Provider, so we will only
      // have read-only access to the Contract
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
      // call the tokendIds from the contract

      const _tokenIds = await nftContract.tokenIds();
      console.log("tokendIds", _tokenIds);
      //_tokenIds is a `Big Number`. We need to convert the Big Number to a string
      setTokenIdsMinted(_tokenIds.toString());
    } catch (error) {
      console.error(error);
    }
  };

  /**
   * Returns a Provider or Signer object representing the Ethereum RPC with or without the
   * signing capabilities of metamask attached
   *
   * A `Provider` is needed to interact with the blockchain - reading transactions, reading balances, reading state, etc.
   *
   * A `Signer` is a special type of Provider used in case a `write` transaction that eeds to be made to the blockchain, which involves the connected account
   * needing to make a digital signature to authorize the transaction being sent. Metamask exposes a Signer API to allow your website to
   * request signatures from the user using Signer functions.
   *
   * @param {*} needSigner - True if you need the signer, default false otherwise
   */

  const getProviderOrSigner = async (needSigner = false) => {
    // connect to metamask

    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 80001) {
      window.alert("Change the network to Mumbai");
      throw new Error("Change network to Mumbai");
    }
    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  // useEffects are used to react to changes in state of the website
  // The array at the end of function call represents what state changes will trigger this effect
  // In this case, whenever the value of `walletConnected` changes - this effect will be called

  React.useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "mumbai",
        providerOptions: {},
        disableInjectionProvider: false,
      });

      connectWallet();
      getTokenIdsMinted();

      setInterval(async function () {
        await getTokenIdsMinted();
      }, 5 * 1000);
    }
  }, [walletConnected]);

  const renderButton = () => {
    if (!walletConnected) {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      );
    }
    // If we are currently waiting for something, return a loading button

    if (loading) {
      return <button className={styles.button}>Loading...</button>;
    }
    return (
      <button className={styles.button} onClick={publicMint}>
        Public Mint 🚀
      </button>
    );
  };
  return (
    <div className={styles.container}>
      <Head>
        <title>LW3Punks</title>
        <meta name="description" content="LW3Punks-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
        <div className={styles.main}>
          <div>
            <h1 className={styles.title}>Welcome to LW3Punks!</h1>
            <div className={styles.description}>
              Its an NFT collection for LearnWeb3 students.
            </div>
            <div className={styles.description}>
              {tokenIdsMinted}/10 have been minted
            </div>
            {renderButton()}
          </div>
          <div>
            <img className={styles.image} src="1.png" />
          </div>
        </div>

        <footer className={styles.footer}>
          Made with &#10084; by J's-LW3Punks
        </footer>
      </div>
    </div>
  );
}
