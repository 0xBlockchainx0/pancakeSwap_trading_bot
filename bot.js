const ethers = require("ethers");
const contracts = require("./my_contracts");
const bot = async function () {
  const addresses = {
    token_in: "0xe9e7cea3dedca5984780bafc599bd69add087d56", //BUSD address
    token_out: "", //address of the token you want to buy

    router: "0x05fF2B0DB69458A0750badebc4f9e13aDd608C7F",
    recipient: "", // your public key to be added here
  };
  const mnemonic = ""; // your mnemonic goes here respect the spacing !
  var accountAddress;
  const wallet = ethers.Wallet.fromMnemonic(mnemonic);

  let provider = new ethers.providers.JsonRpcProvider(
    "https://bsc-dataseed1.binance.org:443" //connects you to the binance smart chain main network
  );
  const account = wallet.connect(provider);

  await provider.getBalance(addresses.recipient).then((data) => {
    console.log(
      ethers.utils.formatEther(data.toString(), { pad: true }) + " BNB"
    );
  });

  const router = new ethers.Contract(
    addresses.router,
    contracts.routerAdd,
    account
  );
  const BUSD = new ethers.Contract(
    addresses.token_in,
    contracts.token_in_ABI,
    account
  );

  const howMuchTokentoApprove = ethers.utils.parseUnits("1", "ether");

  console.log("Waiting for Approval receipt...");
  const txh = await BUSD.approve(addresses.router, howMuchTokentoApprove); //sets the limite of the number of tokens that the router contract can get !!!!! very dangerous
  const receipt1 = await txh.wait();
  console.log("Transaction receipt"); //uncomment it to approve the router to withdraw busd

  //console.log(receipt1);

  const amountIn = ethers.utils.parseUnits("1", "ether"); //add the wanted amont of token in to purchase with

  const amounts = await router.getAmountsOut(
    amountIn,
    [addresses.token_in, addresses.token_out],
    {
      gasLimit: 80000,

      gasPrice: ethers.utils.parseUnits("2.0", "gwei"),
    }
  );

  const amountOutMin = amounts[1] - amounts[1] * 0.1; // setting up the slippage here 10% by default

  const tx = await router.swapExactTokensForTokens(
    amountIn,
    amountOutMin, //min amount
    [
      addresses.token_in, //address of the token in
      addresses.token_out, //address of the token out
    ],
    addresses.recipient,
    Date.now() + 1000 * 60 * 10,
    {
      gasLimit: 80000,

      gasPrice: ethers.utils.parseUnits("5.0", "gwei"),
    }
  );
  const receipt = await tx.wait();
  console.log(receipt);
};
bot();
