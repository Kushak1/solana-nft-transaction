const web3 =  require('@solana/web3.js');
const splToken = require('@solana/spl-token');

(async () => {
    
    //Create connection to devnet
    const connection = new web3.Connection(web3.clusterApiUrl("devnet"));

    //Generate keypair and airdrop 1000000000 Lamports (1 SOL)
    const myKeypair = web3.Keypair.generate();

    let airdropSignature = await connection.requestAirdrop(
        myKeypair.publicKey, 1000000000
    );
    
    await connection.confirmTransaction(airdropSignature);
    console.log('Solana public address: ' + myKeypair.publicKey.toBase58());

    //Create mint
    let mint = await splToken.Token.createMint(connection, myKeypair, myKeypair.publicKey, null, 0, splToken.TOKEN_PROGRAM_ID)

    console.log('Mint public address: ' + mint.publicKey.toBase58());

    //Get the token accont of this solana address, if it does not exist, create it
    let myToken = await mint.getOrCreateAssociatedAccountInfo(
        myKeypair.publicKey
    )

    console.log('Token public address: ' + myToken.address.toBase58());

    //Minting 100 new tokens to the token address we just created
    await mint.mintTo(myToken.address, myKeypair.publicKey, [], 1);

    let nftReciver = web3.Keypair.generate();
    console.log(nftReciver.publicKey.toBase58())
    try{
        await transfer(mint.publicKey.toBase58(),myKeypair,nftReciver.publicKey.toBase58(),connection,1)
    }catch(error){
        console.log(error)
    }
        
    console.log('Done')

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