
    # EtherBBS is a decentralized, antispam forum system.
    
    Reading EtherBBS is free.  But to post, a user:

    1. must pay a fee plus one-time gas costs for the creating a user account.  The account fee will
       will be automatically calculated from tx.gasprice to account for ether 
       price volatility.
    2. must pay gas costs for posting, plus a nominal system maintainance fee that is
       used for garbage-collecting understaked user accounts. (more on that in #3).  The maintainance
       fee will be automatically calculated from tx.gasprice to account for ether 
       price volatility.
    3. must maintain a "staking" ether account balance above a floor,
       to prove that they have stake in the well-being of the Ethereum system.  In most cases,
       this should be a different ether account than the one the users pays for posts with.
       Floor is decided by vote every 6 months, which brings me to..
    4. A voting period to decide the initial staking floor will occur in the month leading up to the
       launch of EtherBBS.  When the voting time is up, the floor will be set and the BBS will become active
       and usable.
        
    After account creation, you send 1 wei of ether from your staking account to the StakingContract.  
    The StakingContract is then registered to your BBSAccount contract.  5 minutes later, you can post.
    If you fail to stake your user account within 3 hours of creating it, the account will be subject
    to garbage collection.
    
    If you fall below the staking floor, you will be unable to post, and have 3 days to add funds or
    switch to a better funded staking account, or your user account will be subject to 
    garbage collection. If that happened, your posts would remain readable on the system.
   
    Here's where the antispam magic starts.
   
    To begin, you can configure your client to ignore posts from anybody below a staking threshhold 
    that you specify.  Putting it up even a little bit will weed out many shitposts that plague 
    reddit and other internet forums. I like 100 Ether, but then I'm a snob. You decide your threshold.
   
    Trolls are almost invariably armchair analysts with little or no stake in what's going on.  
    You might find out that some people who you thought were trolls, actually have a big stake 
    in Ethereum, and their posts might start to seem more genuine.  I hope that this can 
    usher in a new era of civility in our discussions.
   
    Step 2 of antispam: 
   
    Additionally, you can place annoying posters on a Blocklist, and you can set additional trusted
    curators (users whose judgement you trust) whose blocklists you will employ.  Spammers will quickly 
    find their accounts useless, and the cost of creating new ones (and maintaining the stake for 
    old ones) should be extremely discouraging.
    
    Step 3 of antispam is a 10 posts per 5 minutes hard rate limit.  
   
    --------------
    Other Features
    
    Upvoting and private messenging are also available.  Private messages are encrypted, and are rate
    limited to discourage spam.  You can set a staking limit to your inbox as well, 
    to pre-empt spammers.
    
    You attach polls to a topic, which will allow results that show both the raw poll result, and the
    result weighted by stake (see how the money voted).
    
    -----------------
    A Few More Things
    
    The author is not responsible for *anything* you see on EtherBBS.
   
    You can change a post once you make it, but it'll cost.  So watch that filthy mouth of yours.  
    


    Dev notes:

    zsh warning:
    -----------
    gnu make hates zsh.  Probably because your filthy hipster command shell supports fascism. 
    Baby jesus punches a kitten every time you launch a zsh instance.  Zsh probably will cause 
    every rule in the makefile to go wrong, in some way or another, because zsh knows better. 

    https://github.com/ethereum/homebrew-ethereum
    Use homebrew to install dev tools.  
    
    !!!!!!!!!!!!!!
    Use the devel flag on cpp-ethereum to avoid a critical bug.
    'brew install cpp-ethereum --devel --successful'
    !!!!!!!!!!!!!!


    Install the Mist browser beta. 
    https://github.com/ethereum/mist/releases

    brew install ethereum
    Install the highline ruby gem.  If it isn't available, the build process will attempt to install
    it for you..


    Open two terminals in the etherbbs directory.

    **********
    Terminal #1

    type 'make miner'.  
    
    It will prompt you to assent to your private key directory being overwritten.  Obviously 
    you should back up anything you want to keep in there, before pressing forward.  
    
    After that, the miner console will prompt for a password.  Press enter.

    You should see blocks being mined.

    The miner *must remain running* in order for your program to work - remember, the miner is the
    process that runs instructions on the ethereum VM. 

    ***********
    Terminal #2

    type 'make staging'

    Some tests will run.

    If all goes well, you'll see the address on the blockchain that EtherBBS is at.  Your write
    calls will mostly be sent to this object.  See my contracts/deploy.js for examples of how 
    to use the API.  Your javascript code will use the same endpoints, except that you'll be using 
    JSONRPC versions of the calls.  (I think).

    'make miner' always gives you a fresh blockchain and starts the miner.  
    'make staging' deploys the current solidity code to the blockchain.

    After you've deployed, you can fire up Mist.  You should see 5 accounts, all populated with
    ether.  You can use any of these - they all have empty passwords.

    I believe you can click the location browser of Mist and point it to file:/myfile.html

    Also, the miner should have opened a json RPC endpoint at http://localhost:8545, in case you
    would like to use chrome or another browser to develop with.  I have not tested this.


    ABIs!

    You will eventually need ABI definitions for different "classes" (contracts) in order to 
    reconstitute the objects from the freeze-dried things in the blockchain.

    You'll find ABIs aplenty in the contracts/binaries directory.  They are whipped up fresh
    from source every time you run 'make staging'.


