@echo off

set containerName=dreamlink-master
set containerExec=ipfs

docker exec -ti %containerName% sh -c "%containerExec% %*"