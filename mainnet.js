const web3 =  require('@solana/web3.js');
const splToken = require('@solana/spl-token');

(async () => {
    
    //Create connection to mainnet
    const connection = new web3.Connection(web3.clusterApiUrl('mainnet-beta'));

    //Generate keypair from Uint8Array(Make sure it's right format! i.e. [123,123,123...])
    let secretKey = Uint8Array.from('YOUR KEY HERE');
  
    const myKeypair = web3.Keypair.fromSecretKey(secretKey);

    const tokenMintAddress =  new web3.PublicKey('6qdPa5Q6EZy8SKEdYL1uDrfaMN4WciyH3ja7PNw8Mnoy');
    const nftReciver =  new web3.PublicKey('6YMyYFmNmdA6ymfJsdcWkvP4wpjzFCRbZgNvox1UJxYg');
    
    let my_token_account = await splToken.getOrCreateAssociatedTokenAccount(
      connection, 
      payer = myKeypair, 
      mint = tokenMintAddress, 
      owner = myKeypair.publicKey, 
      commitment = 'finalized', 
      allowOwnerOffCurve = false, 
      confirmOptions = null,
      programId = new web3.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'), 
      associatedTokenProgramId = splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
    )
    let reciver_token_account = await splToken.getOrCreateAssociatedTokenAccount(
      connection, 
      payer = myKeypair, 
      mint = tokenMintAddress, 
      owner = nftReciver, 
      commitment = 'finalized', 
      allowOwnerOffCurve = false, 
      confirmOptions = null, 
      programId = splToken.TOKEN_PROGRAM_ID, 
      associatedTokenProgramId = splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
    );

    console.log('My token account public address: ' + my_token_account.address.toBase58());
    console.log('Reciver token account public address: ' + reciver_token_account.address.toBase58());
    try {
      await transfer_tokens(
        wallet = myKeypair, 
        connection, 
        amount = 1, 
        reciver_token_account = reciver_token_account, 
        from_token_account = my_token_account,
        )
    } catch (error) {
      console.log(error)
    }
        
    console.log('Done!');

})();

async function transfer_tokens(wallet, connection, amount, reciver_token_account, from_token_account) {
  //if trx takes more when 60 sec to complete you will receive error here
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

  console.log(transfer_trx)
  
  console.log("Transcation signature", transfer_trx);
  console.log("Success!(we assume)");   

}
