objects = BBSAccount.sol BBSContainer.sol BBSPost.sol BBSForum.sol EtherBBS.sol


compile: clean  $(objects) 
			 solc -o binaries --ast-json --asm-json --abi --optimize --interface --userdoc --devdec --bin --ast --asm $(objects) 

prepare: compile
	ruby prepare_js.rb $(bootstrap) $(objects)

clean:
	rm -rf binaries/*
