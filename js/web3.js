// 🦊 Naik Token - BSC MetaMask Connect Script

const connectButton = document.getElementById("connectButton");
const walletAddressSpan = document.getElementById("walletAddress");
const ethBalanceSpan = document.getElementById("ethBalance");
const naikBalanceSpan = document.getElementById("naikBalance");

// 🔗 Alamat kontrak NAIK (isi nanti kalau udah deploy)
const NAIK_TOKEN_ADDRESS = "0x0000000000000000000000000000000000000000";
const NAIK_TOKEN_ABI = [
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{"name": "", "type": "uint8"}],
    "type": "function"
  }
];

let provider;
let signer;

async function connectWallet() {
  if (typeof window.ethereum !== "undefined") {
    provider = new ethers.providers.Web3Provider(window.ethereum);

    // ✅ Pastikan MetaMask udah di jaringan Binance Smart Chain
    const bscChainId = "0x38"; // Chain ID 56 = BSC Mainnet
    const currentChainId = await window.ethereum.request({ method: "eth_chainId" });

    if (currentChainId !== bscChainId) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: bscChainId }],
        });
        console.log("✅ Switched to BSC Mainnet");
      } catch (switchError) {
        alert("Please switch to BSC Mainnet in MetaMask!");
        return;
      }
    }

    // ✅ Minta izin connect wallet
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    const address = await signer.getAddress();

    // ✅ Update tampilan
    connectButton.innerText = Connected;
    walletAddressSpan.innerText = address;

    // ✅ Ambil saldo BNB
    const balance = await provider.getBalance(address);
    const bnbBalance = ethers.utils.formatEther(balance);
    ethBalanceSpan.innerText = ${parseFloat(bnbBalance).toFixed(4)} BNB;

    // Kalau kontrak NAIK udah deploy, aktifin bagian ini:
    // await getNaikBalance(address);

  } else {
    alert("MetaMask belum terpasang, pasang dulu ya biar bisa connect!");
  }
}

// 🔍 Ambil saldo NAIK Token (aktifin nanti setelah deploy kontrak)
async function getNaikBalance(address) {
  const contract = new ethers.Contract(NAIK_TOKEN_ADDRESS, NAIK_TOKEN_ABI, provider);
  const decimals = await contract.decimals();
  const balance = await contract.balanceOf(address);
  const formatted = balance / (10 ** decimals);
  naikBalanceSpan.innerText = ${formatted.toFixed(2)} $NAIK;
}

connectButton.addEventListener("click", connectWallet);
