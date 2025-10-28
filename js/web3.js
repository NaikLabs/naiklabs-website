// 🦊 Naik Token - MetaMask Connect Script (Final & Stable)

console.log("✅ web.js loaded");

// 🔗 Ambil elemen HTML
const connectButton = document.getElementById("connectButton");
const walletAddressSpan = document.getElementById("walletAddress");
const ethBalanceSpan = document.getElementById("ethBalance");
const naikBalanceSpan = document.getElementById("naikBalance");

// 🚧 Ganti ini setelah kontrak NAIK deploy
const NAIK_TOKEN_ADDRESS = "0x0000000000000000000000000000000000000000"; // Ganti dengan alamat kontrak asli
const NAIK_TOKEN_ABI = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    type: "function"
  }
];

let provider;
let signer;

async function connectWallet() {
  if (typeof window.ethereum === "undefined") {
    alert("MetaMask belum terpasang. Silakan install dulu.");
    return;
  }

  provider = new ethers.providers.Web3Provider(window.ethereum);
  const bscChainId = "0x38"; // BSC Mainnet

  try {
    const currentChainId = await window.ethereum.request({ method: "eth_chainId" });

    if (currentChainId !== bscChainId) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: bscChainId }],
        });
      } catch (switchError) {
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: bscChainId,
              chainName: "Binance Smart Chain",
              rpcUrls: ["https://bsc-dataseed.binance.org/"],
              nativeCurrency: {
                name: "BNB",
                symbol: "BNB",
                decimals: 18
              },
              blockExplorerUrls: ["https://bscscan.com"]
            }]
          });
        } else {
          alert("Gagal switch ke BSC. Coba manual di MetaMask.");
          return;
        }
      }
    }

    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    const address = await signer.getAddress();

    connectButton.innerText = "Connected";
    walletAddressSpan.innerText = address;

    const balance = await provider.getBalance(address);
    const bnbBalance = ethers.utils.formatEther(balance);
    ethBalanceSpan.innerText = `${parseFloat(bnbBalance).toFixed(4)} BNB`;

    // Aktifkan jika kontrak NAIK sudah deploy
    await getNaikBalance(address);

  } catch (err) {
    console.error("❌ Error connecting wallet:", err);
    alert("Gagal connect wallet. Coba refresh atau cek MetaMask.");
  }
}

async function getNaikBalance(address) {
  try {
    const contract = new ethers.Contract(NAIK_TOKEN_ADDRESS, NAIK_TOKEN_ABI, provider);
    const decimals = await contract.decimals();
    const balance = await contract.balanceOf(address);
    const formatted = balance / (10 ** decimals);
    naikBalanceSpan.innerText = `${formatted.toFixed(2)} $NAIK`;
  } catch (err) {
    console.error("❌ Error fetching NAIK balance:", err);
    naikBalanceSpan.innerText = "Error";
  }
}

// 🔘 Event listener untuk tombol
connectButton.addEventListener("click", connectWallet);

// 🔄 Reload jika akun berubah
if (window.ethereum) {
  window.ethereum.on("accountsChanged", () => {
    window.location.reload();
  });
}
