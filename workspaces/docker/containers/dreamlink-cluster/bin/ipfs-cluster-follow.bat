@echo off

set containerName=dreamlink-cluster
set containerExec=ipfs-cluster-follow

docker exec -ti %containerName% sh -c "%containerExec% %*"