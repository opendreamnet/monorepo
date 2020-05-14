@echo off

set containerName=dreamlink
set containerExec=ipfs

docker exec -ti %containerName% sh -c "%containerExec% %*"