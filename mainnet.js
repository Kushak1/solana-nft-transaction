const web3 =  require('@solana/web3.js');
const splToken = require('@solana/spl-token');

(async () => {
    
    //Create connection to mainnet
    const connection = new web3.Connection(web3.clusterApiUrl("mainnet-beta"));

    //Generate keypair from Uint8Array(Make sure it's right format! i.e. [123,123,123...])
    let secretKey = Uint8Array.from('YOUR KEY HERE');
  
    const myKeypair = web3.Keypair.fromSecretKey(secretKey);
    
    const tokenMintAddress = 'TOKEN MINT ADDRES';
    const nftReciver = 'WALLET ADDRES TO SEND';

    try{
        await transfer(tokenMintAddress,myKeypair,nftReciver,connection,1);
    }catch(error){
        console.log(error);
    }
        
    console.log('Done!');

})();

async function transfer(tokenMintAddress, wallet, to, connection, amount) {
  const mintPublicKey = new web3.PublicKey(tokenMintAddress);    

  const mintToken = new splToken.Token(
    connection,
    mintPublicKey,
    splToken.TOKEN_PROGRAM_ID,
    wallet // The wallet owner will pay to transfer and to create recipients associated token account if it does not yet exist.
  );

  const fromTokenAccount = await mintToken.getOrCreateAssociatedAccountInfo(
    wallet.publicKey
  );

  const destPublicKey = new web3.PublicKey(to);

  // Get the derived address of the destination wallet which will hold the custom token
  const associatedDestinationTokenAddr = await splToken.Token.getAssociatedTokenAddress(
    mintToken.associatedProgramId,
    mintToken.programId,
    mintPublicKey,
    destPublicKey
  );

  const receiverAccount = await connection.getAccountInfo(associatedDestinationTokenAddr);

  let transaction = await new web3.Transaction();
  //In case reciver doesn't have associated token account we are going to crate one for him
  if (receiverAccount === null) {

      transaction.add( splToken.Token.createAssociatedTokenAccountInstruction(
        mintToken.associatedProgramId,
        mintToken.programId,
        mintPublicKey,
        associatedDestinationTokenAddr,
        destPublicKey,
        wallet.publicKey
      ));

  }
  transaction.add(
      splToken.Token.createTransferInstruction(
      splToken.TOKEN_PROGRAM_ID,
      fromTokenAccount.address,
      associatedDestinationTokenAddr,
      wallet.publicKey,
      [],
      amount
    )
  );
  // Sign transaction, broadcast, and confirm
  try{
      var signature = await web3.sendAndConfirmTransaction(
      connection,
      transaction,
      [wallet]
  );
  }catch(error){
      console.log(error);
  }
  
  console.log("Transcation signature", signature);
  console.log("Success!");   

}