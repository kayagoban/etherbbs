deploy_script = /tmp/deploy.js

compile: 
	cd contracts && make

prepare:
	cd contracts && make prepare

deploy: prepare
	geth --dev --unlock 0 --preload "$(deploy_script)" attach ipc:/tmp/geth/geth.ipc 

test: prepare
	geth --dev --unlock 0 --preload "$(deploy_script)" --exec "test();" attach ipc:/tmp/geth/geth.ipc 

.PHONY : serve
serve: 
	geth --dev --rpc --unlock 0 --ipcpath /tmp/geth/geth.ipc --mine console

staging_setup:
	mkdir -p /tmp/devchain
	rm -rf /tmp/devchain/keystore
	ln -sf $(PWD)/devconfigs/nodes/* /tmp/devchain/
	ln -sf $(PWD)/devconfigs/keystore /tmp/devchain/keystore

link-keys-osx:
	gem install highline
	clear
	ruby -e "require 'highline/import'; system 'clear'; confirm = ask('WARNING -  This will destroy your ethereum private keys in Etherum wallet and mist, and replace them.  Back them up.  Continue? [Y/N] ') { |yn| yn.limit = 1, yn.validate = /[yn]/i }; exit(1) unless confirm.downcase == 'y'"
	rm -rf ~/Library/Ethereum/keystore
	ln -sf $(PWD)/devconfigs/keystore ~/Library/Ethereum/keystore

clean-devchain:
	rm -rf /tmp/devchain

staging: prepare
	geth --preload "$(deploy_script)" --exec "test();" --networkid "1833929189" attach ipc:/Users/cthomas/Library/Ethereum/geth.ipc

staging-console: prepare
	geth --preload "$(deploy_script)" --networkid "1833929189" attach ipc:/Users/cthomas/Library/Ethereum/geth.ipc

miner: clean-devchain staging_setup link-keys-osx
  # --unlock 0 --password devconfigs/keypass/account0
	geth --datadir /tmp/devchain init devconfigs/genesis/Genesis.json  
	geth --networkid "1833929189" --etherbase 0 --rpc --rpccorsdomain "http://localhost:3000"  --ipcpath ~/Library/Ethereum/geth.ipc --datadir /tmp/devchain --mine --minerthreads 1 console init devconfigs/genesis/Genesis.json 

tail: 
	tail -f /tmp/devchain/01.log

