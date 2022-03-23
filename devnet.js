const web3 = require('@solana/web3.js');
const splToken = require('@solana/spl-token');

(async () => {

  //Create connection to devnet
  const connection = new web3.Connection(web3.clusterApiUrl('devnet'));

  //Generate keypair and airdrop 1000000000 Lamports (1 SOL)
  const myKeypair = web3.Keypair.generate();

  let airdropSignature = await connection.requestAirdrop(
    myKeypair.publicKey, 1000000000
  );

  await connection.confirmTransaction(airdropSignature);
  console.log('Solana public address: ' + myKeypair.publicKey.toBase58());

  //Create mint
  let mint = await splToken.createMint(connection, myKeypair, myKeypair.publicKey, null, 0, web3.Keypair.generate(), splToken.TOKEN_PROGRAM_ID)
  console.log(mint)
  console.log('Mint public address: ' + mint.toBase58());

  //Get the token accont of this solana address, if it does not exist, create it
  let my_token_account = await splToken.getOrCreateAssociatedTokenAccount(
    connection, 
    payer = myKeypair, 
    mint = mint, 
    owner = myKeypair.publicKey, 
    commitment = 'finalized', 
    allowOwnerOffCurve = false, 
    confirmOptions = null,
    programId = splToken.TOKEN_PROGRAM_ID, 
    associatedTokenProgramId = splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
  )
  console.log('Token public address: ' + my_token_account.address.toBase58());

  //Minting 100 new tokens to the token address we just created
  let mint_to_trx = await splToken.mintTo(
    connection, 
    payer = myKeypair, 
    mint = mint, 
    destination = my_token_account.address, 
    authority = myKeypair, 
    amount = 100, 
    multiSigners = [myKeypair], 
    confirmOptions = false, 
    programId = splToken.TOKEN_PROGRAM_ID,
    );

  console.log(mint_to_trx);
  //Same thing here, creating or getting accout to transfer our nft
  let nftReciver = web3.Keypair.generate();
  let reciver_token_account = await splToken.getOrCreateAssociatedTokenAccount(
    connection, 
    payer = myKeypair, 
    mint = mint, 
    owner = nftReciver.publicKey, 
    commitment = 'finalized', 
    allowOwnerOffCurve = false, 
    confirmOptions = null, 
    programId = splToken.TOKEN_PROGRAM_ID, 
    associatedTokenProgramId = splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
  );
  console.log(nftReciver.publicKey.toBase58(), 'Reciver addr')

  try {
    await transfer_tokens(myKeypair, connection, 1, reciver_token_account, my_token_account)
  } catch (error) {
    console.log(error)
  }

  console.log('Done')
})();

async function transfer_tokens(wallet, connection, amount, reciver_token_account, from_token_account) {
  const transfer_trx = await splToken.transfer(
    connection, 
    payer = wallet, 
    source = from_token_account.address, 
    destination = reciver_token_account.address, 
    owner = wallet, 
    amount = amount, 
    multiSigners = [wallet], 
    confirmOptions = false, 
    programId = splToken.TOKEN_PROGRAM_ID,
    )

  console.log("Transcation signature", transfer_trx);
  console.log("Success!");
}
