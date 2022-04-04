const web3 =  require('@solana/web3.js');

(async () => {
    
    //Create connection to mainnet
    const connection =  new web3.Connection(web3.clusterApiUrl('mainnet-beta'));

    //Generate keypair from Uint8Array(Make sure it's right format! i.e. [123,123,123...])
    let secretKey = Uint8Array.from('SECRET KEY HERE');
  
    const myKeypair = web3.Keypair.fromSecretKey(secretKey);


    const reciver =  new web3.PublicKey('RECIVER PUB ADDRESS');
    //1 SOL = 1 000 000 000 lamports
    //In this case we send 0.01 SOL
    const solTransferAmount = 0.01 * web3.LAMPORTS_PER_SOL
    var transaction = new web3.Transaction().add(
      web3.SystemProgram.transfer({
          fromPubkey: myKeypair.publicKey,
          toPubkey: reciver,
          lamports: solTransferAmount,
      })
  );
    // Sign transaction, broadcast, and confirm
    var signature = await web3.sendAndConfirmTransaction(
        connection,
        transaction,
        [myKeypair],
        {
          commitment:'recent',
          skipPreflight: true

        },
    );
    console.log("SIGNATURE", signature);
    console.log("SUCCESS");

})();
